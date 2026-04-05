import { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import api from '../../api/axios';
import { AuthContext } from '../../contexts/AuthContext';
import { t } from '../../i18n';

export default function PaywallScreen({ navigation }) {
  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const isPremium = user?.plan === 'premium';

  async function handleSubscribe() {
    try {
      setLoading(true);

      const response = await api.put('/users/plan', { plan: 'premium' });
      const updatedUser = response.data.user;

      if (setUser) {
        await setUser(updatedUser);
      }

      Alert.alert(
        t('common.success', 'Success'),
        t('paywall.activated', 'Premium activated')
      );
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        t('common.error', 'Error'),
        error?.response?.data?.message ||
          t('paywall.activateError', 'Could not activate premium')
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPlan() {
    try {
      setLoading(true);

      const response = await api.put('/users/plan', { plan: 'free' });
      const updatedUser = response.data.user;

      if (setUser) {
        await setUser(updatedUser);
      }

      Alert.alert(
        t('common.done', 'Done'),
        t('paywall.resetDone', 'Plan reset to free')
      );
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        t('common.error', 'Error'),
        error?.response?.data?.message ||
          t('paywall.resetError', 'Could not reset plan')
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.badge}>PREMIUM</Text>
      <Text style={styles.title}>{t('paywall.title', 'Unlock WaveOn Nutrition')}</Text>
      <Text style={styles.price}>€5/month</Text>

      <Text style={styles.description}>
        {t(
          'paywall.description',
          'Get full access to premium nutrition features designed to improve recovery, performance and body transformation.'
        )}
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('paywall.included', 'What’s included')}</Text>
        <Text style={styles.cardItem}>• Bulking meal plans</Text>
        <Text style={styles.cardItem}>• Cutting meal guidance</Text>
        <Text style={styles.cardItem}>• High-calorie meal ideas</Text>
        <Text style={styles.cardItem}>• Quick shake recipes</Text>
        <Text style={styles.cardItem}>• Premium nutrition tips</Text>
      </View>

      {!isPremium ? (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleSubscribe}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>{t('paywall.upgrade', 'Upgrade for €5/month')}</Text>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleResetPlan}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.secondaryButtonText}>{t('paywall.reset', 'Reset to Free')}</Text>
          )}
        </TouchableOpacity>
      )}

      <Text style={styles.footerText}>{t('paywall.testingOnly', 'Testing mode only.')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    padding: 24,
  },
  badge: {
    color: '#4D618F',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  price: {
    color: '#4D618F',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 14,
  },
  description: {
    color: '#A0A0A0',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#121212',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: 24,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  cardItem: {
    color: '#A0A0A0',
    fontSize: 14,
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: '#4D618F',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  footerText: {
    color: '#777',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 14,
  },
});