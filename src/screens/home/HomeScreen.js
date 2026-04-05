import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../api/axios';

const ACTIVE_WORKOUT_KEY = '@waveon_active_workout';

export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadHomeData();
      loadActiveWorkout();
    }, [])
  );

  useEffect(() => {
    if (!activeWorkout?.startedAt) return;

    const interval = setInterval(() => {
      const diffInSeconds = Math.floor(
        (Date.now() - new Date(activeWorkout.startedAt).getTime()) / 1000
      );
      setElapsedSeconds(diffInSeconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeWorkout]);

  async function loadHomeData() {
    try {
      setLoading(true);

      const response = await api.get('/progress/workout-sessions');
      setSessions(response.data || []);
    } catch (error) {
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Could not load home data.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadActiveWorkout() {
    try {
      const stored = await AsyncStorage.getItem(ACTIVE_WORKOUT_KEY);

      if (!stored) {
        setActiveWorkout(null);
        setElapsedSeconds(0);
        return;
      }

      const parsed = JSON.parse(stored);
      setActiveWorkout(parsed);

      if (parsed.startedAt) {
        const diffInSeconds = Math.floor(
          (Date.now() - new Date(parsed.startedAt).getTime()) / 1000
        );
        setElapsedSeconds(diffInSeconds);
      }
    } catch (error) {
      console.log('LOAD ACTIVE WORKOUT ERROR:', error);
    }
  }

  function getGreeting() {
    const hour = new Date().getHours();

    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  function getDateKey(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  function formatSessionDate(dateString) {
    if (!dateString) return '';

    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  function formatElapsedTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
        2,
        '0'
      )}:${String(seconds).padStart(2, '0')}`;
    }

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
      2,
      '0'
    )}`;
  }

  function calculateCurrentStreak(sessionList) {
    if (!sessionList.length) return 0;

    const uniqueDays = [
      ...new Set(sessionList.map((session) => getDateKey(session.completed_at))),
    ].sort((a, b) => new Date(b) - new Date(a));

    const today = new Date();
    const latestWorkoutDate = new Date(uniqueDays[0]);

    const diffFromToday = Math.floor(
      (today - latestWorkoutDate) / (1000 * 60 * 60 * 24)
    );

    if (diffFromToday > 2) return 0;

    let currentStreak = 1;

    for (let i = 0; i < uniqueDays.length - 1; i++) {
      const currentDate = new Date(uniqueDays[i]);
      const nextDate = new Date(uniqueDays[i + 1]);

      const diffInDays = Math.round(
        (currentDate - nextDate) / (1000 * 60 * 60 * 24)
      );

      if (diffInDays === 1) {
        currentStreak += 1;
      } else {
        break;
      }
    }

    return currentStreak;
  }

  const homeStats = useMemo(() => {
    const lastWorkout = sessions[0] || null;

    const totalMinutes = sessions.reduce(
      (sum, session) => sum + Number(session.duration_minutes || 0),
      0
    );

    const totalWorkouts = sessions.length;
    const currentStreak = calculateCurrentStreak(sessions);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyWorkouts = sessions.filter(
      (session) => new Date(session.completed_at) >= weekAgo
    ).length;

    return {
      lastWorkout,
      totalMinutes,
      totalWorkouts,
      currentStreak,
      weeklyWorkouts,
    };
  }, [sessions]);

  function getMotivationText() {
    if (activeWorkout) return 'Your workout is waiting for you.';
    if (homeStats.currentStreak >= 5) return "You're on fire 🔥";
    if (homeStats.currentStreak >= 1) return 'Keep the momentum going.';
    return 'Start your next session today.';
  }

  function handleResumeWorkout() {
    navigation.navigate('WorkoutDetails', {
      workoutId: activeWorkout?.workoutId || null,
      isCustom: !!activeWorkout?.isCustom,
      workout: activeWorkout?.workoutData || null,
    });
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8EA2D0" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: 120 + insets.bottom },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>
          {getGreeting()}
          {user?.name ? `, ${user.name}` : ''}
        </Text>
        <Text style={styles.subtitle}>{getMotivationText()}</Text>
      </View>

      <LinearGradient
        colors={['#6E86BC', '#4D618F', '#2A3550']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <Text style={styles.heroSmall}>WAVEON DAILY</Text>
        <Text style={styles.heroTitle}>
          {homeStats.currentStreak} {homeStats.currentStreak === 1 ? 'day' : 'days'}
        </Text>
        <Text style={styles.heroSubtitle}>Current streak</Text>

        <Text style={styles.heroText}>
          Your streak stays alive with up to 2 rest days.
        </Text>

        <TouchableOpacity
          style={styles.heroButton}
          onPress={() =>
            activeWorkout ? handleResumeWorkout() : navigation.navigate('Workouts')
          }
        >
          <Text style={styles.heroButtonText}>
            {activeWorkout ? 'Resume workout' : 'Start workout'}
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>This week</Text>
          <Text style={styles.statValue}>{homeStats.weeklyWorkouts}</Text>
          <Text style={styles.statFoot}>workouts</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total minutes</Text>
          <Text style={styles.statValue}>{homeStats.totalMinutes}</Text>
          <Text style={styles.statFoot}>trained</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>
        {activeWorkout ? 'Active workout' : 'Last workout'}
      </Text>

      {activeWorkout ? (
        <View style={styles.activeWorkoutHomeCard}>
          <View style={styles.activeWorkoutTop}>
            <View>
              <Text style={styles.lastWorkoutTitle}>
                {activeWorkout.workoutName || 'Workout in progress'}
              </Text>
              <Text style={styles.lastWorkoutDate}>
                Time elapsed: {formatElapsedTime(elapsedSeconds)}
              </Text>
            </View>

            <View style={styles.liveBadge}>
              <Text style={styles.liveBadgeText}>LIVE</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleResumeWorkout}
          >
            <Text style={styles.secondaryButtonText}>Resume workout</Text>
          </TouchableOpacity>
        </View>
      ) : homeStats.lastWorkout ? (
        <View style={styles.lastWorkoutCard}>
          <View style={styles.lastWorkoutTop}>
            <View>
              <Text style={styles.lastWorkoutTitle}>
                {homeStats.lastWorkout.workout_name}
              </Text>
              <Text style={styles.lastWorkoutDate}>
                {formatSessionDate(homeStats.lastWorkout.completed_at)}
              </Text>
            </View>

            <View style={styles.dot} />
          </View>

          <View style={styles.badgesRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {homeStats.lastWorkout.completed_sets} sets
              </Text>
            </View>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {homeStats.lastWorkout.duration_minutes} min
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Progress')}
          >
            <Text style={styles.secondaryButtonText}>View progress</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No workouts yet</Text>
          <Text style={styles.emptyText}>
            Complete your first workout to start building your progress.
          </Text>
        </View>
      )}

      <LinearGradient
        colors={['rgba(142,162,208,0.16)', 'rgba(142,162,208,0.04)']}
        style={styles.tipCard}
      >
        <Text style={styles.tipLabel}>Today’s focus</Text>
        <Text style={styles.tipTitle}>Consistency beats intensity</Text>
        <Text style={styles.tipText}>
          Even a short workout keeps your streak alive and your progress moving.
        </Text>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 18,
  },
  greeting: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    color: '#A8A8A8',
    fontSize: 14,
    lineHeight: 20,
  },
  heroCard: {
    borderRadius: 28,
    padding: 22,
    marginBottom: 18,
    overflow: 'hidden',
  },
  heroSmall: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '900',
    marginBottom: 4,
  },
  heroSubtitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  heroText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
    maxWidth: 280,
  },
  heroButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
  },
  heroButtonText: {
    color: '#2A3550',
    fontSize: 15,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#121212',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222222',
  },
  statLabel: {
    color: '#9C9C9C',
    fontSize: 13,
    marginBottom: 10,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
  },
  statFoot: {
    color: '#8EA2D0',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 6,
    marginBottom: 12,
  },
  activeWorkoutHomeCard: {
    backgroundColor: '#121212',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: 18,
  },
  activeWorkoutTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  liveBadge: {
    backgroundColor: '#1A2238',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  liveBadgeText: {
    color: '#8EA2D0',
    fontSize: 11,
    fontWeight: '800',
  },
  lastWorkoutCard: {
    backgroundColor: '#121212',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: 18,
  },
  lastWorkoutTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastWorkoutTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  lastWorkoutDate: {
    color: '#8EA2D0',
    fontSize: 13,
    fontWeight: '700',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#6E86BC',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  badgeText: {
    color: '#D8D8D8',
    fontSize: 13,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#1A2238',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#8EA2D0',
    fontSize: 14,
    fontWeight: '800',
  },
  emptyCard: {
    backgroundColor: '#121212',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: 18,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    color: '#A8A8A8',
    fontSize: 14,
    lineHeight: 20,
  },
  tipCard: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(142,162,208,0.18)',
  },
  tipLabel: {
    color: '#8EA2D0',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  tipTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  tipText: {
    color: '#B8B8B8',
    fontSize: 14,
    lineHeight: 20,
  },
});