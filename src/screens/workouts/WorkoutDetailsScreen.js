import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import api from '../../api/axios';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const ACTIVE_WORKOUT_KEY = '@waveon_active_workout';

export default function WorkoutDetailsScreen({ route, navigation }) {
  const { workout, workoutId, isCustom } = route.params || {};

  const [loading, setLoading] = useState(!!isCustom);
  const [savingWorkout, setSavingWorkout] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [customWorkout, setCustomWorkout] = useState(null);
  const [completedSets, setCompletedSets] = useState({});
  const [restoredReady, setRestoredReady] = useState(false);

  useEffect(() => {
    if (isCustom && workoutId) {
      loadCustomWorkout();
      return;
    }

    if (workout?.exercises?.length) {
      const initialSets = {};
      workout.exercises.forEach((exercise, index) => {
        const key = String(exercise.id ?? `${exercise.name}-${index}`);
        initialSets[key] = 0;
      });
      setCompletedSets(initialSets);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [isCustom, workoutId, workout]);

  useEffect(() => {
    if (!loading) {
      restoreActiveWorkout();
    }
  }, [loading]);

  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      const diffInSeconds = Math.floor((Date.now() - startTime.getTime()) / 1000);
      setElapsedSeconds(diffInSeconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  useEffect(() => {
    if (!restoredReady || !startTime || !currentWorkout) return;
    persistActiveWorkout();
  }, [completedSets, startTime, restoredReady, currentWorkout]);

  async function loadCustomWorkout() {
    try {
      setLoading(true);

      const response = await api.get(`/custom-workouts/${workoutId}`);
      const data = response.data;

      setCustomWorkout(data);

      const initialSets = {};
      (data.exercises || []).forEach((exercise, index) => {
        const key = String(exercise.id ?? `${exercise.name}-${index}`);
        initialSets[key] = 0;
      });

      setCompletedSets(initialSets);
    } catch (error) {
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Could not load workout.'
      );
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }

  const currentWorkout = useMemo(() => {
    return isCustom ? customWorkout : workout;
  }, [isCustom, customWorkout, workout]);

  const exercises = useMemo(() => {
    if (!currentWorkout) return [];

    return (currentWorkout.exercises || []).map((item, index) => ({
      id: String(item.id ?? `${item.name}-${index}`),
      name: item.name,
    }));
  }, [currentWorkout]);

  const totalCompletedSets = useMemo(() => {
    return Object.values(completedSets).reduce(
      (sum, value) => sum + Number(value || 0),
      0
    );
  }, [completedSets]);

  function getWorkoutStorageId() {
    if (workoutId) return String(workoutId);
    if (currentWorkout?.id) return String(currentWorkout.id);
    return String(currentWorkout?.name || currentWorkout?.workout_name || '');
  }

  async function persistActiveWorkout(
    nextStartTime = startTime,
    nextCompletedSets = completedSets
  ) {
    try {
      if (!nextStartTime || !currentWorkout) return;

      const payload = {
        workoutKey: getWorkoutStorageId(),
        workoutId: workoutId || currentWorkout?.id || null,
        workoutName: currentWorkout?.name || currentWorkout?.workout_name || '',
        workoutData: currentWorkout || null,
        isCustom: !!isCustom,
        startedAt: nextStartTime.toISOString(),
        completedSets: nextCompletedSets,
      };

      await AsyncStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify(payload));
    } catch (error) {
      console.log('PERSIST ACTIVE WORKOUT ERROR:', error);
    }
  }

  async function restoreActiveWorkout() {
    try {
      const stored = await AsyncStorage.getItem(ACTIVE_WORKOUT_KEY);

      if (!stored) {
        setRestoredReady(true);
        return;
      }

      const parsed = JSON.parse(stored);
      const currentKey = getWorkoutStorageId();

      if (parsed.workoutKey !== currentKey) {
        setRestoredReady(true);
        return;
      }

      if (parsed.startedAt) {
        const restoredStart = new Date(parsed.startedAt);
        setStartTime(restoredStart);

        const diffInSeconds = Math.floor(
          (Date.now() - restoredStart.getTime()) / 1000
        );
        setElapsedSeconds(diffInSeconds);
      }

      if (parsed.completedSets && typeof parsed.completedSets === 'object') {
        setCompletedSets((prev) => ({
          ...prev,
          ...parsed.completedSets,
        }));
      }
    } catch (error) {
      console.log('RESTORE ACTIVE WORKOUT ERROR:', error);
    } finally {
      setRestoredReady(true);
    }
  }

  async function clearActiveWorkout() {
    try {
      await AsyncStorage.removeItem(ACTIVE_WORKOUT_KEY);
    } catch (error) {
      console.log('CLEAR ACTIVE WORKOUT ERROR:', error);
    }
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

  async function handleStartWorkout() {
    if (startTime) return;

    const now = new Date();
    setStartTime(now);
    setElapsedSeconds(0);
    await persistActiveWorkout(now, completedSets);

    Alert.alert('Workout started', 'Your session is now in progress.');
  }

  function handleAddSet(exerciseId) {
    setCompletedSets((prev) => ({
      ...prev,
      [exerciseId]: Number(prev[exerciseId] || 0) + 1,
    }));
  }

  function handleRemoveSet(exerciseId) {
    setCompletedSets((prev) => ({
      ...prev,
      [exerciseId]: Math.max(0, Number(prev[exerciseId] || 0) - 1),
    }));
  }

  async function saveWorkoutSession() {
    try {
      if (!startTime) {
        Alert.alert('Error', 'Start the workout first.');
        return;
      }

      if (!currentWorkout) {
        Alert.alert('Error', 'Workout data not found.');
        return;
      }

      if (!exercises.length) {
        Alert.alert('Error', 'This workout has no exercises.');
        return;
      }

      setSavingWorkout(true);

      const endTime = new Date();
      const durationMs = endTime - startTime;
      const durationMinutes = Math.max(1, Math.round(durationMs / 60000));

      const formattedCompletedAt = endTime
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');

      const exercisesPayload = exercises.map((exercise) => ({
        exercise_name: String(exercise.name || ''),
        completed_sets: Number(completedSets[exercise.id] || 0),
      }));

      const payload = {
        workout_name: String(
          currentWorkout?.name || currentWorkout?.workout_name || 'Workout'
        ),
        completed_sets: Number(totalCompletedSets),
        duration_minutes: Number(durationMinutes),
        completed_at: formattedCompletedAt,
        exercises: exercisesPayload,
      };

      console.log('FINISH WORKOUT PAYLOAD:', payload);

      const response = await api.post('/progress/workout-session', payload);

      console.log('FINISH WORKOUT RESPONSE:', response.data);

      await clearActiveWorkout();

      Alert.alert('Workout completed', 'Great job 🔥', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.log('FINISH WORKOUT STATUS:', error?.response?.status);
      console.log('FINISH WORKOUT DATA:', error?.response?.data);
      console.log('FINISH WORKOUT MESSAGE:', error?.message);

      Alert.alert(
        'Error',
        error?.response?.data?.message ||
          error?.message ||
          'Could not save workout session.'
      );
    } finally {
      setSavingWorkout(false);
    }
  }

  function handleFinishWorkout() {
    if (totalCompletedSets === 0) {
      Alert.alert(
        'No sets completed',
        'Do you want to finish the workout anyway?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Finish',
            onPress: saveWorkoutSession,
          },
        ]
      );
      return;
    }

    saveWorkoutSession();
  }

  if (loading || !currentWorkout) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
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
        colors={['#7A91C8', '#5B74AB', '#2F3B58']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <Text style={styles.heroLabel}>WORKOUT DETAILS</Text>
        <Text style={styles.heroTitle}>
          {currentWorkout.name || currentWorkout.workout_name}
        </Text>
        <Text style={styles.heroSubtitle}>
          {currentWorkout.category || 'Workout plan'}
        </Text>

        <View style={styles.heroStatsRow}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{exercises.length}</Text>
            <Text style={styles.heroStatLabel}>Exercises</Text>
          </View>

          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{totalCompletedSets}</Text>
            <Text style={styles.heroStatLabel}>Sets done</Text>
          </View>
        </View>
      </LinearGradient>

      {!startTime ? (
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartWorkout}
          activeOpacity={0.85}
        >
          <Ionicons name="play" size={18} color={colors.background} />
          <Text style={styles.startButtonText}>Start workout</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.activeWorkoutCard}>
          <View style={styles.activeTopRow}>
            <View style={styles.activeLeft}>
              <View style={styles.activeDot} />
              <Text style={styles.activeWorkoutText}>Workout in progress</Text>
            </View>

            <Text style={styles.timerText}>{formatElapsedTime(elapsedSeconds)}</Text>
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>Exercises</Text>

      {exercises.map((exercise, index) => (
        <View key={exercise.id} style={styles.exerciseCard}>
          <View style={styles.exerciseHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.exerciseIndex}>Exercise {index + 1}</Text>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
            </View>

            <View style={styles.exerciseSetsBadge}>
              <Text style={styles.exerciseSetsBadgeText}>
                {completedSets[exercise.id] || 0} sets
              </Text>
            </View>
          </View>

          <View style={styles.setControlsRow}>
            <TouchableOpacity
              style={styles.setActionButton}
              onPress={() => handleRemoveSet(exercise.id)}
              activeOpacity={0.85}
            >
              <Text style={styles.setActionButtonText}>−</Text>
            </TouchableOpacity>

            <View style={styles.setCountBox}>
              <Text style={styles.setCountLabel}>Completed</Text>
              <Text style={styles.setCountValue}>
                {completedSets[exercise.id] || 0}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.setActionButton, styles.setActionButtonPrimary]}
              onPress={() => handleAddSet(exercise.id)}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.setActionButtonText,
                  styles.setActionButtonTextPrimary,
                ]}
              >
                +
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total completed sets</Text>
        <Text style={styles.summaryValue}>{totalCompletedSets}</Text>
      </View>

      <TouchableOpacity
        style={[styles.finishButton, savingWorkout && styles.finishButtonDisabled]}
        onPress={handleFinishWorkout}
        disabled={savingWorkout}
        activeOpacity={0.85}
      >
        <Text style={styles.finishButtonText}>
          {savingWorkout ? 'Saving...' : 'Finish workout'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCard: {
    borderRadius: 28,
    padding: spacing.lg,
    marginBottom: spacing.lg,
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
    fontSize: 30,
    fontWeight: '900',
    marginBottom: 6,
    letterSpacing: -0.6,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: spacing.lg,
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
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
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.lg,
  },
  startButtonText: {
    color: colors.background,
    fontSize: 15,
    fontWeight: '800',
  },
  activeWorkoutCard: {
    backgroundColor: 'rgba(110,134,188,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(110,134,188,0.20)',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: spacing.lg,
  },
  activeTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.primary,
    marginRight: 10,
  },
  activeWorkoutText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  timerText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: spacing.sm,
    letterSpacing: -0.4,
  },
  exerciseCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  exerciseIndex: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  exerciseName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  exerciseSetsBadge: {
    backgroundColor: 'rgba(110,134,188,0.12)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(110,134,188,0.18)',
  },
  exerciseSetsBadgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  setControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  setActionButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setActionButtonPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  setActionButtonText: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  setActionButtonTextPrimary: {
    color: colors.background,
  },
  setCountBox: {
    flex: 1,
    marginHorizontal: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  setCountLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  setCountValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 8,
  },
  summaryValue: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
  },
  finishButton: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: 'center',
  },
  finishButtonDisabled: {
    opacity: 0.7,
  },
  finishButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});