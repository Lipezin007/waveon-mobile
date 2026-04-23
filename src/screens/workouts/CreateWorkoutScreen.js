import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import api from '../../api/axios';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const CATEGORIES = [
  'Push',
  'Pull',
  'Legs',
  'Upper',
  'Lower',
  'Full Body',
  'Cardio',
  'Mobility',
  'Core',
];

export default function CreateWorkoutScreen({ navigation }) {
  const [name, setName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Push');
  const [exerciseName, setExerciseName] = useState('');
  const [exercises, setExercises] = useState([]);
  const [saving, setSaving] = useState(false);

  function handleAddExercise() {
    const trimmed = exerciseName.trim();

    if (!trimmed) {
      Alert.alert('Error', 'Enter an exercise name.');
      return;
    }

    const newExercise = {
      id: Date.now().toString(),
      name: trimmed,
    };

    setExercises((prev) => [...prev, newExercise]);
    setExerciseName('');
  }

  function handleRemoveExercise(id) {
    setExercises((prev) => prev.filter((item) => item.id !== id));
  }

  async function handleSaveWorkout() {
    if (!name.trim()) {
      Alert.alert('Error', 'Enter the workout name.');
      return;
    }

    if (exercises.length === 0) {
      Alert.alert('Error', 'Add at least one exercise.');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: name.trim(),
        category: selectedCategory,
        exercises,
      };

      await api.post('/custom-workouts', payload);

      Alert.alert('Success', 'Workout created successfully.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Could not create workout.'
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Create workout</Text>
      <Text style={styles.subtitle}>
        Build your own workout with the exercises you want.
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Workout name</Text>
        <TextInput
          style={styles.input}
          placeholder="Example: Push Day"
          placeholderTextColor={colors.textSecondary}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {CATEGORIES.map((category) => {
            const active = selectedCategory === category;

            return (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  active && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(category)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    active && styles.categoryChipTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Add exercise</Text>

        <View style={styles.addExerciseRow}>
          <TextInput
            style={styles.exerciseInput}
            placeholder="Example: Bench Press"
            placeholderTextColor={colors.textSecondary}
            value={exerciseName}
            onChangeText={setExerciseName}
          />

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddExercise}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={20} color={colors.background} />
          </TouchableOpacity>
        </View>

        {exercises.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No exercises added yet.</Text>
          </View>
        ) : (
          exercises.map((exercise, index) => (
            <View key={exercise.id} style={styles.exerciseItem}>
              <View style={{ flex: 1, paddingRight: spacing.sm }}>
                <Text style={styles.exerciseIndex}>Exercise {index + 1}</Text>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
              </View>

              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveExercise(exercise.id)}
                activeOpacity={0.85}
              >
                <Ionicons name="trash-outline" size={18} color="#FF7A7A" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSaveWorkout}
        disabled={saving}
        activeOpacity={0.85}
      >
        <Text style={styles.saveButtonText}>
          {saving ? 'Saving...' : 'Save workout'}
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
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.6,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: colors.text,
    marginBottom: spacing.md,
    fontSize: 15,
  },
  categoriesRow: {
    gap: spacing.sm,
  },
  categoryChip: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    color: '#D0D7E2',
    fontSize: 13,
    fontWeight: '700',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  addExerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  exerciseInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: colors.text,
    marginRight: spacing.sm,
    fontSize: 15,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBox: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  exerciseItem: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseIndex: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  exerciseName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  removeButton: {
    padding: 8,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 17,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 6,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});