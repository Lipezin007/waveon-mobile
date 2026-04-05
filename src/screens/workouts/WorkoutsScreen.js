import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import api from '../../api/axios';
import { t } from '../../i18n';

const CATEGORIES = [
  'All',
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

const TEMPLATE_WORKOUTS = [
  {
    id: 't1',
    name: 'Beginner Full Body',
    category: 'Full Body',
    duration: '40 min',
    exercises: [
      { id: 't1-e1', name: 'Bodyweight Squat' },
      { id: 't1-e2', name: 'Push Up' },
      { id: 't1-e3', name: 'Glute Bridge' },
      { id: 't1-e4', name: 'Plank' },
      { id: 't1-e5', name: 'Walking Lunges' },
    ],
  },
  {
    id: 't2',
    name: 'Pull Strength',
    category: 'Pull',
    duration: '50 min',
    exercises: [
      { id: 't2-e1', name: 'Deadlift' },
      { id: 't2-e2', name: 'Barbell Row' },
      { id: 't2-e3', name: 'Lat Pulldown' },
      { id: 't2-e4', name: 'Seated Cable Row' },
      { id: 't2-e5', name: 'Face Pull' },
      { id: 't2-e6', name: 'Hammer Curl' },
    ],
  },
  {
    id: 't3',
    name: 'Core + Mobility',
    category: 'Core',
    duration: '25 min',
    exercises: [
      { id: 't3-e1', name: 'Plank' },
      { id: 't3-e2', name: 'Dead Bug' },
      { id: 't3-e3', name: 'Bird Dog' },
      { id: 't3-e4', name: 'Hip Mobility Flow' },
    ],
  },
  {
    id: 't4',
    name: 'Fat Loss Circuit',
    category: 'Cardio',
    duration: '30 min',
    exercises: [
      { id: 't4-e1', name: 'Jump Squat' },
      { id: 't4-e2', name: 'Mountain Climbers' },
      { id: 't4-e3', name: 'Burpees' },
      { id: 't4-e4', name: 'High Knees' },
      { id: 't4-e5', name: 'Push Up' },
      { id: 't4-e6', name: 'Lunges' },
      { id: 't4-e7', name: 'Plank Shoulder Tap' },
      { id: 't4-e8', name: 'Jumping Jacks' },
    ],
  },
];

export default function WorkoutsScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [myWorkouts, setMyWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadCustomWorkouts();
    }, [])
  );

  async function loadCustomWorkouts() {
    try {
      setLoading(true);
      const response = await api.get('/custom-workouts');
      setMyWorkouts(response.data || []);
    } catch (error) {
  console.log('CUSTOM WORKOUTS ERROR STATUS:', error?.response?.status);
  console.log('CUSTOM WORKOUTS ERROR DATA:', error?.response?.data);
  console.log('CUSTOM WORKOUTS ERROR MESSAGE:', error?.message);

  Alert.alert(
    t('common.error', 'Error'),
    error?.response?.data?.message ||
      error?.message ||
      t('workouts.loadError', 'Could not load workouts.')
  );
} finally {
      setLoading(false);
    }
  }

  function filterWorkouts(list) {
    return list.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;

      const matchesSearch = item.name
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }

  const filteredMyWorkouts = useMemo(() => {
    return filterWorkouts(myWorkouts);
  }, [selectedCategory, search, myWorkouts]);

  const filteredTemplates = useMemo(() => {
    return filterWorkouts(TEMPLATE_WORKOUTS);
  }, [selectedCategory, search]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>{t('workouts.title', 'Workouts')}</Text>
      <Text style={styles.subtitle}>
        {t(
          'workouts.subtitle',
          'Choose a plan, explore templates or create your own workout.'
        )}
      </Text>

      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={18} color="#8A8A8A" />
        <TextInput
          style={styles.searchInput}
          placeholder={t('workouts.search', 'Search workouts')}
          placeholderTextColor="#8A8A8A"
          value={search}
          onChangeText={setSearch}
        />
      </View>

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

      <TouchableOpacity
        style={styles.createCard}
        onPress={() => navigation.navigate('CreateWorkout')}
      >
        <View style={styles.createIcon}>
          <Ionicons name="add" size={22} color="#0A0A0A" />
        </View>

        <View style={styles.createTextWrapper}>
          <Text style={styles.createTitle}>{t('workouts.createTitle', 'Create your own workout')}</Text>
          <Text style={styles.createText}>
            {t('workouts.createText', 'Build a workout with the exercises you want.')}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#8EA2D0" />
      </TouchableOpacity>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('workouts.my', 'My workouts')}</Text>
        <Text style={styles.sectionCount}>{filteredMyWorkouts.length}</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#8EA2D0" style={{ marginBottom: 20 }} />
      ) : filteredMyWorkouts.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>{t('workouts.none', 'No workouts found')}</Text>
          <Text style={styles.emptyText}>
            {t('workouts.noneText', 'Try another filter or create a new workout.')}
          </Text>
        </View>
      ) : (
        filteredMyWorkouts.map((workout) => (
          <TouchableOpacity
            key={workout.id}
            style={styles.workoutCard}
            onPress={() =>
              navigation.navigate('WorkoutDetails', {
                workoutId: workout.id,
                isCustom: true,
                workout,
              })
            }
          >
            <View style={styles.workoutTop}>
              <View>
                <Text style={styles.workoutTitle}>{workout.name}</Text>
                <Text style={styles.workoutCategory}>{workout.category}</Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#8EA2D0" />
            </View>

            <View style={styles.badgesRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {workout.exercises_count || workout.exercises?.length || 0} exercises
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('workouts.templates', 'Templates')}</Text>
        <Text style={styles.sectionCount}>{filteredTemplates.length}</Text>
      </View>

      {filteredTemplates.map((workout) => (
        <TouchableOpacity
          key={workout.id}
          style={styles.templateCard}
          onPress={() => navigation.navigate('WorkoutDetails', { workout })}
        >
          <View style={styles.workoutTop}>
            <View>
              <Text style={styles.workoutTitle}>{workout.name}</Text>
              <Text style={styles.workoutCategory}>{workout.category}</Text>
            </View>

            <Ionicons name="sparkles-outline" size={18} color="#8EA2D0" />
          </View>

          <View style={styles.badgesRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {workout.exercises_count || workout.exercises?.length || 0} exercises
              </Text>
            </View>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>{workout.duration}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
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
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222222',
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    paddingVertical: 14,
    paddingLeft: 10,
  },
  categoriesRow: {
    paddingBottom: 6,
    marginBottom: 14,
    gap: 10,
  },
  categoryChip: {
    backgroundColor: '#121212',
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
  createCard: {
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },
  createIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#8EA2D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  createTextWrapper: {
    flex: 1,
  },
  createTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  createText: {
    color: '#A8A8A8',
    fontSize: 13,
    lineHeight: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  sectionCount: {
    color: '#8EA2D0',
    fontSize: 14,
    fontWeight: '800',
  },
  workoutCard: {
    backgroundColor: '#121212',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: 12,
  },
  templateCard: {
    backgroundColor: '#121212',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: 12,
  },
  workoutTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  workoutTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  workoutCategory: {
    color: '#8EA2D0',
    fontSize: 13,
    fontWeight: '700',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 10,
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
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: 14,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyText: {
    color: '#A8A8A8',
    fontSize: 14,
    lineHeight: 20,
  },
});