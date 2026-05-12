import { useContext, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import api from '../../api/axios';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { LanguageContext } from '../../contexts/LanguageContext';

const INITIAL_WATER_ML = 0;

const INITIAL_MEALS = [
  { id: '1', type: 'breakfast', title: 'Breakfast', items: [] },
  { id: '2', type: 'lunch', title: 'Lunch', items: [] },
  { id: '3', type: 'dinner', title: 'Dinner', items: [] },
  { id: '4', type: 'snacks', title: 'Snacks', items: [] },
];

function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatHeaderDate(date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function NutritionScreen({ navigation }) {
  const { t } = useContext(LanguageContext);

  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState(getDateKey(new Date()));

  const [waterMl, setWaterMl] = useState(INITIAL_WATER_ML);
  const [waterGoalMl] = useState(2500);
  const [meals, setMeals] = useState(INITIAL_MEALS);
  const [isPremium] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMealId, setSelectedMealId] = useState(null);
  const [editingFoodId, setEditingFoodId] = useState(null);
  const [savingFood, setSavingFood] = useState(false);
  const [savingWater, setSavingWater] = useState(false);

  const [foodForm, setFoodForm] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  });

  useEffect(() => {
    setSelectedDateKey(getDateKey(selectedDate));
  }, [selectedDate]);

  useEffect(() => {
    loadNutritionFromApi(selectedDateKey);
  }, [selectedDateKey]);

  async function loadNutritionFromApi(dateKey) {
    try {
      setLoading(true);

      const [foodsResponse, waterResponse] = await Promise.all([
        api.get(`/api/nutrition?date=${dateKey}`),
        api.get(`/api/nutrition/water?date=${dateKey}`)
      ]);

      const foods = Array.isArray(foodsResponse.data) ? foodsResponse.data : [];
      const waterData = waterResponse.data || {};

      const groupedMeals = INITIAL_MEALS.map((meal) => ({
        ...meal,
        items: foods
          .filter((item) => item.meal_type === meal.type)
          .map((item) => ({
            id: String(item.id),
            name: item.food_name,
            calories: Number(item.calories || 0),
            protein: Number(item.protein || 0),
            carbs: Number(item.carbs || 0),
            fat: Number(item.fat || 0),
          })),
      }));

      setMeals(groupedMeals);
      setWaterMl(Number(waterData.water_ml || INITIAL_WATER_ML));
    } catch (error) {
      console.log('LOAD NUTRITION API ERROR:', error?.response?.data || error);
      Alert.alert(
        t('common.error', 'Error'),
        t('nutrition.loadError', 'Could not load nutrition data.')
      );
      setMeals(INITIAL_MEALS);
      setWaterMl(INITIAL_WATER_ML);
    } finally {
      setLoading(false);
    }
  }

  const nutritionGoals = {
    calories: 2200,
    protein: 160,
    carbs: 240,
    fat: 70,
  };

  const nutritionSummary = useMemo(() => {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;

    meals.forEach((meal) => {
      meal.items.forEach((item) => {
        calories += Number(item.calories || 0);
        protein += Number(item.protein || 0);
        carbs += Number(item.carbs || 0);
        fat += Number(item.fat || 0);
      });
    });

    return { calories, protein, carbs, fat };
  }, [meals]);

  function getProgress(current, goal) {
    if (!goal) return 0;
    return Math.min(current / goal, 1);
  }

  function changeDay(days) {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + days);
    setSelectedDate(nextDate);
  }

  function goToToday() {
    setSelectedDate(new Date());
  }

  async function updateWaterOnApi(nextWaterMl) {
    try {
      setSavingWater(true);

      await api.put('/api/nutrition/water', {
        entry_date: selectedDateKey,
        water_ml: nextWaterMl,
      });

      setWaterMl(nextWaterMl);
    } catch (error) {
      console.log('UPDATE WATER ERROR:', error?.response?.data || error);
      Alert.alert(
        t('common.error', 'Error'),
        t('nutrition.waterSaveError', 'Could not update water.')
      );
    } finally {
      setSavingWater(false);
    }
  }

  function handleAddWater(amount) {
    const nextWater = waterMl + amount;
    updateWaterOnApi(nextWater);
  }

  function resetFoodForm() {
    setFoodForm({
      name: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
    });
    setEditingFoodId(null);
  }

  function openAddFoodModal(mealId) {
    resetFoodForm();
    setSelectedMealId(mealId);
    setModalVisible(true);
  }

  function openEditFoodModal(mealId, food) {
    setSelectedMealId(mealId);
    setEditingFoodId(food.id);
    setFoodForm({
      name: food.name || '',
      calories: String(food.calories || ''),
      protein: String(food.protein || ''),
      carbs: String(food.carbs || ''),
      fat: String(food.fat || ''),
    });
    setModalVisible(true);
  }

  function closeFoodModal() {
    setModalVisible(false);
    resetFoodForm();
    setSelectedMealId(null);
  }

  async function handleSaveFood() {
    if (!foodForm.name.trim()) {
      Alert.alert(
        t('common.error', 'Error'),
        t('nutrition.foodNameRequired', 'Enter the food name.')
      );
      return;
    }

    const selectedMeal = meals.find((meal) => meal.id === selectedMealId);

    if (!selectedMeal) {
      Alert.alert(
        t('common.error', 'Error'),
        t('nutrition.invalidMeal', 'Invalid meal selected.')
      );
      return;
    }

    const payload = {
      meal_type: selectedMeal.type,
      food_name: foodForm.name.trim(),
      calories: Number(foodForm.calories || 0),
      protein: Number(foodForm.protein || 0),
      carbs: Number(foodForm.carbs || 0),
      fat: Number(foodForm.fat || 0),
      entry_date: selectedDateKey,
    };

    try {
      setSavingFood(true);

      if (editingFoodId) {
        await api.put(`/api/nutrition/foods/${editingFoodId}`, payload);
      } else {
        await api.post('/api/nutrition/foods', payload);
      }

      closeFoodModal();
      await loadNutritionFromApi(selectedDateKey);
    } catch (error) {
      console.log('SAVE FOOD ERROR:', error?.response?.data || error);
      Alert.alert(
        t('common.error', 'Error'),
        t('nutrition.saveFoodError', 'Could not save food.')
      );
    } finally {
      setSavingFood(false);
    }
  }

  function handleRemoveFood(foodId) {
    Alert.alert(
      t('nutrition.removeFood', 'Remove food'),
      t('nutrition.removeFoodConfirm', 'Do you want to remove this food?'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('common.remove', 'Remove'),
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/api/nutrition/foods/${foodId}`);
              await loadNutritionFromApi(selectedDateKey);
            } catch (error) {
              console.log('DELETE FOOD ERROR:', error?.response?.data || error);
              Alert.alert(
                t('common.error', 'Error'),
                t('nutrition.deleteFoodError', 'Could not remove food.')
              );
            }
          },
        },
      ]
    );
  }

  function handlePremiumPress() {
    if (isPremium) {
      Alert.alert(
        t('nutrition.premiumActive', 'Premium active'),
        t(
          'nutrition.premiumReady',
          'Your premium nutrition plan is already active.'
        )
      );
      return;
    }

    navigation.navigate('Paywall');
  }

  async function handleResetNutrition() {
    Alert.alert(
      t('nutrition.resetTitle', 'Reset nutrition'),
      t('nutrition.resetText', 'Do you want to clear today’s nutrition data?'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('common.remove', 'Remove'),
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/api/nutrition/reset?date=${selectedDateKey}`);
              await loadNutritionFromApi(selectedDateKey);
            } catch (error) {
              console.log('RESET NUTRITION ERROR:', error?.response?.data || error);
              Alert.alert(
                t('common.error', 'Error'),
                t('nutrition.resetError', 'Could not reset nutrition data.')
              );
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
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
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.heroLabel}>
                {t('nutrition.titleSmall', 'TODAY’S NUTRITION')}
              </Text>
              <Text style={styles.heroTitle}>
                {nutritionSummary.calories}
                <Text style={styles.heroTitleLight}>
                  {' '}
                  / {nutritionGoals.calories}
                </Text>
              </Text>
              <Text style={styles.heroSubtitle}>
                {t('nutrition.caloriesGoal', 'Calories consumed today')}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.heroPremiumButton}
              onPress={handlePremiumPress}
              activeOpacity={0.85}
            >
              <Ionicons name="sparkles-outline" size={16} color="#1D2740" />
              <Text style={styles.heroPremiumText}>
                {isPremium
                  ? t('nutrition.active', 'Premium active')
                  : t('nutrition.unlock', 'Unlock')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${getProgress(
                    nutritionSummary.calories,
                    nutritionGoals.calories
                  ) * 100}%`,
                },
              ]}
            />
          </View>

          <View style={styles.heroStatsRow}>
            <HeroStat
              label={t('nutrition.protein', 'Protein')}
              value={`${nutritionSummary.protein}g`}
            />
            <HeroStat
              label={t('nutrition.carbs', 'Carbs')}
              value={`${nutritionSummary.carbs}g`}
            />
            <HeroStat
              label={t('nutrition.fat', 'Fat')}
              value={`${nutritionSummary.fat}g`}
            />
          </View>
        </LinearGradient>

        <View style={styles.dateCard}>
          <TouchableOpacity
            style={styles.dateArrow}
            onPress={() => changeDay(-1)}
            activeOpacity={0.85}
          >
            <Ionicons name="chevron-back" size={18} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.dateCenter}>
            <Text style={styles.dateLabel}>
              {t('nutrition.selectedDay', 'Selected day')}
            </Text>
            <Text style={styles.dateValue}>{formatHeaderDate(selectedDate)}</Text>
          </View>

          <TouchableOpacity
            style={styles.dateArrow}
            onPress={() => changeDay(1)}
            activeOpacity={0.85}
          >
            <Ionicons name="chevron-forward" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.todayButton}
          onPress={goToToday}
          activeOpacity={0.85}
        >
          <Text style={styles.todayButtonText}>
            {t('nutrition.today', 'Today')}
          </Text>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {t('nutrition.dailyOverview', 'Daily overview')}
          </Text>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetNutrition}
            activeOpacity={0.85}
          >
            <Ionicons name="refresh-outline" size={16} color={colors.primary} />
            <Text style={styles.resetButtonText}>
              {t('nutrition.reset', 'Reset')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <SmallStatCard
            icon="flame-outline"
            label={t('nutrition.calories', 'Calories')}
            value={`${nutritionSummary.calories}`}
            footer={`${nutritionGoals.calories} ${t('nutrition.goal', 'goal')}`}
          />
          <SmallStatCard
            icon="barbell-outline"
            label={t('nutrition.protein', 'Protein')}
            value={`${nutritionSummary.protein}g`}
            footer={`${nutritionGoals.protein}g ${t('nutrition.goal', 'goal')}`}
          />
        </View>

        <View style={styles.statsRow}>
          <SmallStatCard
            icon="nutrition-outline"
            label={t('nutrition.carbs', 'Carbs')}
            value={`${nutritionSummary.carbs}g`}
            footer={`${nutritionGoals.carbs}g ${t('nutrition.goal', 'goal')}`}
          />
          <SmallStatCard
            icon="water-outline"
            label={t('nutrition.water', 'Water')}
            value={`${waterMl}ml`}
            footer={`${waterGoalMl}ml ${t('nutrition.goal', 'goal')}`}
          />
        </View>

        <View style={styles.waterCard}>
          <View style={styles.waterHeader}>
            <View>
              <Text style={styles.waterTitle}>
                {t('nutrition.waterIntake', 'Water intake')}
              </Text>
              <Text style={styles.waterSubtitle}>
                {waterMl} / {waterGoalMl} ml
              </Text>
            </View>

            <Ionicons name="water" size={22} color={colors.primary} />
          </View>

          <View style={styles.progressTrackDark}>
            <View
              style={[
                styles.progressFillBlue,
                {
                  width: `${getProgress(waterMl, waterGoalMl) * 100}%`,
                },
              ]}
            />
          </View>

          <View style={styles.waterButtonsRow}>
            <TouchableOpacity
              style={styles.waterButton}
              onPress={() => handleAddWater(250)}
              activeOpacity={0.85}
              disabled={savingWater}
            >
              <Text style={styles.waterButtonText}>+250ml</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.waterButton}
              onPress={() => handleAddWater(500)}
              activeOpacity={0.85}
              disabled={savingWater}
            >
              <Text style={styles.waterButtonText}>+500ml</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {t('nutrition.mealsToday', 'Meals today')}
          </Text>
        </View>

        {meals.map((meal) => {
          const mealCalories = meal.items.reduce(
            (sum, item) => sum + Number(item.calories || 0),
            0
          );

          return (
            <View key={meal.id} style={styles.mealCard}>
              <View style={styles.mealHeader}>
                <View>
                  <Text style={styles.mealTitle}>
                    {t(`nutrition.${meal.type}`, meal.title)}
                  </Text>
                  <Text style={styles.mealSubtitle}>
                    {mealCalories} {t('nutrition.kcal', 'kcal')}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.mealAddButton}
                  onPress={() => openAddFoodModal(meal.id)}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={18}
                    color={colors.primary}
                  />
                  <Text style={styles.mealAddButtonText}>
                    {t('nutrition.addFood', 'Add food')}
                  </Text>
                </TouchableOpacity>
              </View>

              {meal.items.length === 0 ? (
                <View style={styles.emptyMealBox}>
                  <Text style={styles.emptyMealText}>
                    {t('nutrition.noFoodsYet', 'No foods added yet.')}
                  </Text>
                </View>
              ) : (
                meal.items.map((item) => (
                  <View key={item.id} style={styles.foodItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.foodName}>{item.name}</Text>
                      <Text style={styles.foodMeta}>
                        {item.protein}g P • {item.carbs}g C • {item.fat}g F
                      </Text>
                    </View>

                    <View style={styles.foodRight}>
                      <Text style={styles.foodCalories}>{item.calories} kcal</Text>

                      <View style={styles.foodActions}>
                        <TouchableOpacity
                          onPress={() => openEditFoodModal(meal.id, item)}
                          style={styles.iconAction}
                          activeOpacity={0.85}
                        >
                          <Ionicons
                            name="create-outline"
                            size={18}
                            color={colors.primary}
                          />
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleRemoveFood(item.id)}
                          style={styles.iconAction}
                          activeOpacity={0.85}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={18}
                            color="#FF7D7D"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          );
        })}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeFoodModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingFoodId
                  ? t('nutrition.editFood', 'Edit food')
                  : t('nutrition.addFood', 'Add food')}
              </Text>

              <TouchableOpacity onPress={closeFoodModal} activeOpacity={0.85}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              value={foodForm.name}
              onChangeText={(value) =>
                setFoodForm((prev) => ({ ...prev, name: value }))
              }
              placeholder={t('nutrition.foodName', 'Food name')}
              placeholderTextColor={colors.textSecondary}
            />

            <View style={styles.modalRow}>
              <TextInput
                style={[styles.modalInput, styles.modalHalf]}
                value={foodForm.calories}
                onChangeText={(value) =>
                  setFoodForm((prev) => ({ ...prev, calories: value }))
                }
                placeholder={t('nutrition.calories', 'Calories')}
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />

              <TextInput
                style={[styles.modalInput, styles.modalHalf]}
                value={foodForm.protein}
                onChangeText={(value) =>
                  setFoodForm((prev) => ({ ...prev, protein: value }))
                }
                placeholder={t('nutrition.protein', 'Protein')}
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.modalRow}>
              <TextInput
                style={[styles.modalInput, styles.modalHalf]}
                value={foodForm.carbs}
                onChangeText={(value) =>
                  setFoodForm((prev) => ({ ...prev, carbs: value }))
                }
                placeholder={t('nutrition.carbs', 'Carbs')}
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />

              <TextInput
                style={[styles.modalInput, styles.modalHalf]}
                value={foodForm.fat}
                onChangeText={(value) =>
                  setFoodForm((prev) => ({ ...prev, fat: value }))
                }
                placeholder={t('nutrition.fat', 'Fat')}
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={closeFoodModal}
                activeOpacity={0.85}
              >
                <Text style={styles.modalCancelText}>
                  {t('common.cancel', 'Cancel')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleSaveFood}
                activeOpacity={0.85}
                disabled={savingFood}
              >
                <Text style={styles.modalSaveText}>
                  {savingFood
                    ? t('common.saving', 'Saving...')
                    : editingFoodId
                    ? t('common.save', 'Save')
                    : t('nutrition.add', 'Add')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

function HeroStat({ label, value }) {
  return (
    <View style={styles.heroStat}>
      <Text style={styles.heroStatValue}>{value}</Text>
      <Text style={styles.heroStatLabel}>{label}</Text>
    </View>
  );
}

function SmallStatCard({ icon, label, value, footer }) {
  return (
    <View style={styles.smallStatCard}>
      <View style={styles.smallStatTop}>
        <Ionicons name={icon} size={18} color={colors.primary} />
        <Text style={styles.smallStatLabel}>{label}</Text>
      </View>
      <Text style={styles.smallStatValue}>{value}</Text>
      <Text style={styles.smallStatFooter}>{footer}</Text>
    </View>
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
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
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
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  heroTitleLight: {
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '700',
    fontSize: 18,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 14,
    marginTop: 6,
  },
  heroPremiumButton: {
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroPremiumText: {
    color: '#1D2740',
    fontSize: 13,
    fontWeight: '800',
  },
  progressTrack: {
    width: '100%',
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
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
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  heroStatLabel: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    fontWeight: '700',
  },
  dateCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateArrow: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCenter: {
    flex: 1,
    alignItems: 'center',
  },
  dateLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  dateValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  todayButton: {
    alignSelf: 'flex-start',
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(110,134,188,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(110,134,188,0.20)',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  todayButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resetButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  smallStatCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  smallStatTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  smallStatLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  smallStatValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  smallStatFooter: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  waterCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  waterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  waterTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  waterSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  progressTrackDark: {
    width: '100%',
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressFillBlue: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 999,
  },
  waterButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  waterButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 16,
    backgroundColor: 'rgba(110,134,188,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(110,134,188,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterButtonText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 14,
  },
  mealCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.md,
    alignItems: 'flex-start',
  },
  mealTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  mealSubtitle: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  mealAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mealAddButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  emptyMealBox: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  emptyMealText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  foodName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  foodMeta: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  foodRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  foodCalories: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  foodActions: {
    flexDirection: 'row',
    gap: 6,
  },
  iconAction: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: spacing.xl,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    minHeight: 52,
    color: colors.text,
    fontSize: 15,
    marginBottom: spacing.sm,
  },
  modalRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalHalf: {
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  modalCancelButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    color: colors.text,
    fontWeight: '700',
  },
  modalSaveButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});