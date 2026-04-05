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
        <TouchableOpacity style={styles.startButton} onPress={handleStartWorkout}>
          <Ionicons name="play" size={18} color="#0A0A0A" />
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
            <View>
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
    fontSize: 30,
    fontWeight: '900',
    marginBottom: 6,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 15,
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
  startButton: {
    backgroundColor: '#8EA2D0',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  startButtonText: {
    color: '#0A0A0A',
    fontSize: 15,
    fontWeight: '800',
  },
  activeWorkoutCard: {
    backgroundColor: '#1A2238',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 18,
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
    backgroundColor: '#8EA2D0',
    marginRight: 10,
  },
  activeWorkoutText: {
    color: '#8EA2D0',
    fontSize: 14,
    fontWeight: '800',
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
  },
  exerciseCard: {
    backgroundColor: '#121212',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: 12,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  exerciseIndex: {
    color: '#8EA2D0',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  exerciseName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  exerciseSetsBadge: {
    backgroundColor: '#1A2238',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  exerciseSetsBadgeText: {
    color: '#8EA2D0',
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
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  setActionButtonPrimary: {
    backgroundColor: '#8EA2D0',
    borderColor: '#8EA2D0',
  },
  setActionButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  setActionButtonTextPrimary: {
    color: '#0A0A0A',
  },
  setCountBox: {
    flex: 1,
    marginHorizontal: 12,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  setCountLabel: {
    color: '#9C9C9C',
    fontSize: 12,
    marginBottom: 4,
  },
  setCountValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  summaryCard: {
    backgroundColor: '#121212',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#222222',
    marginTop: 8,
    marginBottom: 16,
  },
  summaryLabel: {
    color: '#9C9C9C',
    fontSize: 13,
    marginBottom: 8,
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
  },
  finishButton: {
    backgroundColor: '#6E86BC',
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