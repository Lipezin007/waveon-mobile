import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import api from '../../api/axios';

export default function ProgressScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [])
  );

  async function loadProgress() {
    try {
      setLoading(true);
      const response = await api.get('/progress/workout-sessions');
      setSessions(response.data || []);
    } catch (error) {
      console.log('PROGRESS ERROR:', error?.response?.data || error?.message);
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Could not load progress.'
      );
    } finally {
      setLoading(false);
    }
  }

  function formatSessionDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function getDateKey(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

  const stats = useMemo(() => {
    const totalWorkouts = sessions.length;

    const totalMinutes = sessions.reduce(
      (sum, session) => sum + Number(session.duration_minutes || 0),
      0
    );

    const totalSets = sessions.reduce(
      (sum, session) => sum + Number(session.completed_sets || 0),
      0
    );

    const currentStreak = calculateCurrentStreak(sessions);

    const bestSession = sessions.reduce((best, session) => {
      if (!best) return session;
      return Number(session.completed_sets || 0) > Number(best.completed_sets || 0)
        ? session
        : best;
    }, null);

    return {
      totalWorkouts,
      totalMinutes,
      totalSets,
      currentStreak,
      bestSessionSets: bestSession ? Number(bestSession.completed_sets || 0) : 0,
    };
  }, [sessions]);

  const weeklyChart = useMemo(() => {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    const day = now.getDay();
    const sundayBased = day === 0 ? 6 : day - 1;

    const startOfWeek = new Date(now);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(now.getDate() - sundayBased);

    const buckets = labels.map((label, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      return {
        label,
        key: getDateKey(date),
        value: 0,
      };
    });

    sessions.forEach((session) => {
      const key = getDateKey(session.completed_at);
      const bucket = buckets.find((item) => item.key === key);
      if (bucket) {
        bucket.value += 1;
      }
    });

    const maxValue = Math.max(...buckets.map((item) => item.value), 1);

    return {
      data: buckets,
      maxValue,
    };
  }, [sessions]);

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
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={['#6E86BC', '#4D618F', '#2A3550']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <Text style={styles.heroLabel}>YOUR PROGRESS</Text>
        <Text style={styles.heroTitle}>{stats.totalWorkouts}</Text>
        <Text style={styles.heroSubtitle}>Total workouts completed</Text>

        <View style={styles.heroStatsRow}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{stats.currentStreak}</Text>
            <Text style={styles.heroStatLabel}>Streak</Text>
          </View>

          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{stats.totalMinutes}</Text>
            <Text style={styles.heroStatLabel}>Minutes</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total sets</Text>
          <Text style={styles.statValue}>{stats.totalSets}</Text>
          <Text style={styles.statFoot}>completed</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Best session</Text>
          <Text style={styles.statValue}>{stats.bestSessionSets}</Text>
          <Text style={styles.statFoot}>sets</Text>
        </View>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.sectionTitle}>This week</Text>

        <View style={styles.chartRow}>
          {weeklyChart.data.map((item) => {
            const height = Math.max(12, (item.value / weeklyChart.maxValue) * 90);

            return (
              <View key={item.label} style={styles.chartItem}>
                <Text style={styles.chartValue}>{item.value}</Text>

                <View style={styles.chartTrack}>
                  <View style={[styles.chartBar, { height }]} />
                </View>

                <Text style={styles.chartLabel}>{item.label}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent sessions</Text>

      {sessions.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No sessions yet</Text>
          <Text style={styles.emptyText}>
            Finish your workouts to start seeing your progress here.
          </Text>
        </View>
      ) : (
        sessions.map((session) => (
          <TouchableOpacity
            key={session.id}
            style={styles.sessionCard}
            activeOpacity={0.9}
            onPress={() =>
              navigation.navigate('SessionDetails', {
                sessionId: session.id,
                session,
              })
            }
          >
            <View style={styles.sessionTop}>
              <View>
                <Text style={styles.sessionTitle}>
                  {session.workout_name || 'Workout'}
                </Text>
                <Text style={styles.sessionDate}>
                  {formatSessionDate(session.completed_at)}
                </Text>
              </View>

              <View style={styles.sessionRight}>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#8EA2D0"
                />
              </View>
            </View>

            <View style={styles.badgesRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {session.completed_sets || 0} sets
                </Text>
              </View>

              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {session.duration_minutes || 0} min
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}
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
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCard: {
    borderRadius: 28,
    padding: 22,
    marginBottom: 18,
    overflow: 'hidden',
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '900',
    marginBottom: 4,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 18,
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  heroStat: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    padding: 14,
  },
  heroStatValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  heroStatLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '700',
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
  chartCard: {
    backgroundColor: '#121212',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: 18,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  chartItem: {
    alignItems: 'center',
    width: '13%',
  },
  chartValue: {
    color: '#8EA2D0',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  chartTrack: {
    width: 18,
    height: 92,
    borderRadius: 999,
    backgroundColor: '#1A1A1A',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginBottom: 8,
  },
  chartBar: {
    width: '100%',
    backgroundColor: '#6E86BC',
    borderRadius: 999,
  },
  chartLabel: {
    color: '#A8A8A8',
    fontSize: 11,
    fontWeight: '700',
  },
  sessionCard: {
    backgroundColor: '#121212',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: 12,
  },
  sessionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  sessionDate: {
    color: '#8EA2D0',
    fontSize: 13,
    fontWeight: '700',
  },
  sessionRight: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1A2238',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
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
  emptyCard: {
    backgroundColor: '#121212',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#222222',
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
});