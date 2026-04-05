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
          placeholderTextColor="#8A8A8A"
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
            placeholderTextColor="#8A8A8A"
            value={exerciseName}
            onChangeText={setExerciseName}
          />

          <TouchableOpacity style={styles.addButton} onPress={handleAddExercise}>
            <Ionicons name="add" size={20} color="#0A0A0A" />
          </TouchableOpacity>
        </View>

        {exercises.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No exercises added yet.</Text>
          </View>
        ) : (
          exercises.map((exercise, index) => (
            <View key={exercise.id} style={styles.exerciseItem}>
              <View>
                <Text style={styles.exerciseIndex}>Exercise {index + 1}</Text>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
              </View>

              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveExercise(exercise.id)}
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
    backgroundColor: '#0A0A0A',
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    color: '#A8A8A8',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },
  card: {
    backgroundColor: '#121212',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: 16,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: '#FFFFFF',
    marginBottom: 14,
  },
  categoriesRow: {
    gap: 10,
  },
  categoryChip: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  categoryChipActive: {
    backgroundColor: '#6E86BC',
    borderColor: '#6E86BC',
  },
  categoryChipText: {
    color: '#D0D0D0',
    fontSize: 13,
    fontWeight: '700',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  addExerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  exerciseInput: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: '#FFFFFF',
    marginRight: 10,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#8EA2D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBox: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  emptyText: {
    color: '#8A8A8A',
    fontSize: 14,
  },
  exerciseItem: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseIndex: {
    color: '#8EA2D0',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  exerciseName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  removeButton: {
    padding: 8,
  },
  saveButton: {
    backgroundColor: '#6E86BC',
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