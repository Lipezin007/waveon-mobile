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
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

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
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.9)',
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
  exerciseIndex: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  exerciseName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(110,134,188,0.12)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(110,134,188,0.18)',
  },
  badgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
});