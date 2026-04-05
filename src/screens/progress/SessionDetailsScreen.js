import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../api/axios';

export default function SessionDetailsScreen({ route }) {
  const { sessionId, session } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    if (sessionId) {
      loadExercises();
    }
  }, [sessionId]);

  async function loadExercises() {
    try {
      setLoading(true);

      const response = await api.get(
        `/progress/workout-sessions/${sessionId}/exercises`
      );

      setExercises(response.data || []);
    } catch (error) {
      console.log(
        'SESSION DETAILS ERROR:',
        error?.response?.data || error?.message
      );

      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Could not load session details.'
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
        style={styles.heroCard}
      >
        <Text style={styles.heroLabel}>SESSION DETAILS</Text>
        <Text style={styles.heroTitle}>
          {session?.workout_name || 'Workout'}
        </Text>
        <Text style={styles.heroSubtitle}>
          {formatSessionDate(session?.completed_at)}
        </Text>

        <View style={styles.heroStatsRow}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>
              {session?.completed_sets || 0}
            </Text>
            <Text style={styles.heroStatLabel}>Sets</Text>
          </View>

          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>
              {session?.duration_minutes || 0}
            </Text>
            <Text style={styles.heroStatLabel}>Minutes</Text>
          </View>
        </View>
      </LinearGradient>

      <Text style={styles.sectionTitle}>Exercises</Text>

      {exercises.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No exercise details</Text>
          <Text style={styles.emptyText}>
            This session does not have exercise data available.
          </Text>
        </View>
      ) : (
        exercises.map((exercise, index) => (
          <View
            key={exercise.id || `${exercise.exercise_name}-${index}`}
            style={styles.exerciseCard}
          >
            <Text style={styles.exerciseIndex}>Exercise {index + 1}</Text>
            <Text style={styles.exerciseName}>
              {exercise.exercise_name || 'Exercise'}
            </Text>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {exercise.completed_sets || 0} sets completed
              </Text>
            </View>
          </View>
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
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 6,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.9)',
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
  exerciseIndex: {
    color: '#8EA2D0',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  exerciseName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#1A2238',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  badgeText: {
    color: '#8EA2D0',
    fontSize: 12,
    fontWeight: '800',
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