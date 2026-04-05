import { useContext } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';
import { t } from '../../i18n';

export default function NutritionScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  const isPremium = user?.plan === 'premium';

  function handleUpgrade() {
    Alert.alert(
      t('nav.paywall', 'Premium'),
      'Upgrade flow coming soon — €5/month'
    );
  }

  if (!isPremium) {
    return (
      <View style={styles.lockedContainer}>
        <Text style={styles.lockedBadge}>PREMIUM</Text>
        <Text style={styles.lockedTitle}>{t('nutrition.unlock', 'Unlock Nutrition')}</Text>
        <Text style={styles.lockedPrice}>€5/month</Text>
        <Text style={styles.lockedText}>
          Get access to meal plans, bulking and cutting guidance, high-calorie meals and shake ideas.
        </Text>

        <View style={styles.lockedCard}>
          <Text style={styles.lockedCardTitle}>{t('nutrition.included', 'What’s included')}</Text>
          <Text style={styles.lockedItem}>• Bulking meal plans</Text>
          <Text style={styles.lockedItem}>• Cutting meal ideas</Text>
          <Text style={styles.lockedItem}>• High-calorie meals</Text>
          <Text style={styles.lockedItem}>• Quick shake recipes</Text>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Paywall')}
          >
          <Text style={styles.primaryButtonText}>{t('nutrition.upgradePrice', 'Upgrade for €5/month')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>{t('nutrition.fuelBody', 'Fuel your body')}</Text>
      <Text style={styles.title}>{t('nutrition.title', 'Nutrition')}</Text>

      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>{t('nutrition.active', 'Premium Active')}</Text>
        <Text style={styles.heroTitle}>{t('nutrition.planTitle', 'Your nutrition plan')}</Text>
        <Text style={styles.heroText}>
          {t(
            'nutrition.planText',
            'Nutrition is the foundation of recovery, muscle growth and performance.'
          )}
        </Text>

        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>{t('nutrition.viewMealPlan', 'View Meal Plan')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity style={styles.gridCard}>
          <Text style={styles.gridTitle}>Bulking Plan</Text>
          <Text style={styles.gridText}>High-calorie meals for size and strength.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridCard}>
          <Text style={styles.gridTitle}>Cutting Plan</Text>
          <Text style={styles.gridText}>Lean meals focused on fat loss.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridCard}>
          <Text style={styles.gridTitle}>High-Calorie Meals</Text>
          <Text style={styles.gridText}>Easy options to hit your calories.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridCard}>
          <Text style={styles.gridTitle}>Shake Ideas</Text>
          <Text style={styles.gridText}>Quick calories for busy days.</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Recommended</Text>
        <Text style={styles.sectionTitle}>1000+ calorie shake</Text>
        <Text style={styles.sectionText}>
          Oats, banana, peanut butter, milk, whey and honey. Fast, practical and effective.
        </Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Tip</Text>
        <Text style={styles.sectionTitle}>Consistency beats perfection</Text>
        <Text style={styles.sectionText}>
          You do not need perfect meals every day. You need meals you can follow consistently.
        </Text>
      </View>
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
    paddingBottom: 32,
  },
  greeting: {
    color: '#A0A0A0',
    fontSize: 14,
    marginTop: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
  },
  heroCard: {
    backgroundColor: '#121212',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: 18,
  },
  heroLabel: {
    color: '#4D618F',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
  },
  heroText: {
    color: '#A0A0A0',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
  },
  primaryButton: {
    backgroundColor: '#4D618F',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  gridCard: {
    width: '48%',
    backgroundColor: '#121212',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: 12,
  },
  gridTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  gridText: {
    color: '#A0A0A0',
    fontSize: 13,
    lineHeight: 18,
  },
  sectionCard: {
    backgroundColor: '#121212',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: 14,
  },
  sectionLabel: {
    color: '#4D618F',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionText: {
    color: '#A0A0A0',
    fontSize: 14,
    lineHeight: 21,
  },
  lockedContainer: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    padding: 24,
  },
  lockedBadge: {
    color: '#4D618F',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
    textAlign: 'center',
  },
  lockedTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  lockedPrice: {
    color: '#4D618F',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  lockedText: {
    color: '#A0A0A0',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  lockedCard: {
    backgroundColor: '#121212',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: 24,
  },
  lockedCardTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  lockedItem: {
    color: '#A0A0A0',
    fontSize: 14,
    marginBottom: 8,
  },
});