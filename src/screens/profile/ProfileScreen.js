import { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthContext } from '../../contexts/AuthContext';
import { LanguageContext } from '../../contexts/LanguageContext';
import api from '../../api/axios';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const AVATAR_KEY = '@waveon_avatar';

export default function ProfileScreen() {
  const { user, setUser, logout } = useContext(AuthContext);
  const { language, setLanguage, t } = useContext(LanguageContext);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading] = useState(false);
  const [avatar, setAvatar] = useState(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    body_type: '',
    goal: '',
    weight: '',
    height: '',
    age: '',
    plan: '',
    created_at: '',
  });

  useEffect(() => {
    loadAvatar();

    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        body_type: user.body_type || '',
        goal: user.goal || '',
        weight: user.weight ? String(user.weight) : '',
        height: user.height ? String(user.height) : '',
        age: user.age ? String(user.age) : '',
        plan: user.plan || 'free',
        created_at: user.created_at || '',
      });
    }
  }, [user]);

  async function loadAvatar() {
    const saved = await AsyncStorage.getItem(AVATAR_KEY);
    if (saved) setAvatar(saved);
  }

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(t('profile.permissionRequired', 'Permission required'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setAvatar(uri);
      await AsyncStorage.setItem(AVATAR_KEY, uri);
    }
  }

  function handleChange(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleCancelEdit() {
    setEditing(false);

    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        body_type: user.body_type || '',
        goal: user.goal || '',
        weight: user.weight ? String(user.weight) : '',
        height: user.height ? String(user.height) : '',
        age: user.age ? String(user.age) : '',
        plan: user.plan || 'free',
        created_at: user.created_at || '',
      });
    }
  }

  async function handleSaveProfile() {
    try {
      if (!form.name.trim()) {
        Alert.alert(t('profile.nameRequired', 'Name is required'));
        return;
      }

      setSaving(true);

      const payload = {
        name: form.name.trim(),
        body_type: form.body_type || null,
        goal: form.goal || null,
        weight: form.weight ? Number(form.weight) : null,
        height: form.height ? Number(form.height) : null,
        age: form.age ? Number(form.age) : null,
      };

      const response = await api.put('/users/me', payload);

      if (response?.data?.user) {
        setUser(response.data.user);
      }

      setEditing(false);
      Alert.alert(t('profile.saved', 'Saved successfully'));
    } catch (error) {
      console.log('PROFILE ERROR:', error?.response?.data || error);
      Alert.alert(
        t('profile.saveError', 'Error saving'),
        error?.response?.data?.message || t('profile.tryAgain', 'Try again.')
      );
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    Alert.alert(
      t('profile.logoutTitle', 'Sign out'),
      t('profile.logoutMessage', 'Do you want to sign out?'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('profile.signOut', 'Sign out'),
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  }

  function formatDate(date) {
    if (!date) return '---';
    return new Date(date).toLocaleDateString();
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient
        colors={['#7A91C8', '#5B74AB', '#2F3B58']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <TouchableOpacity
          onPress={pickImage}
          activeOpacity={0.85}
          style={styles.avatarWrapper}
        >
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {form.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.name}>{form.name || t('profile.user', 'User')}</Text>
        <Text style={styles.email}>{form.email}</Text>

        {!editing && (
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setEditing(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.editBtnText}>
              {t('profile.editProfile', 'Edit profile')}
            </Text>
          </TouchableOpacity>
        )}
      </LinearGradient>

      {!editing ? (
        <>
          <View style={styles.row}>
            <Card
              label={t('profile.weight', 'Weight')}
              value={form.weight ? `${form.weight} kg` : '-'}
            />
            <Card
              label={t('profile.height', 'Height')}
              value={form.height ? `${form.height} cm` : '-'}
            />
          </View>

          <View style={styles.row}>
            <Card label={t('profile.age', 'Age')} value={form.age || '-'} />
            <Card label={t('profile.plan', 'Plan')} value={form.plan || '-'} />
          </View>

          <Box title={t('profile.profile', 'Profile')}>
            <Item
              label={t('profile.bodyType', 'Body type')}
              value={form.body_type}
            />
            <Item label={t('profile.goal', 'Goal')} value={form.goal} />
          </Box>

          <Box title={t('profile.account', 'Account')}>
            <Item label={t('common.email', 'Email')} value={form.email} />
            <Item
              label={t('profile.createdAt', 'Created at')}
              value={formatDate(form.created_at)}
            />
          </Box>

          <Box title={t('profile.language', 'Language')}>
            <View style={styles.languageRow}>
              <TouchableOpacity
                style={[
                  styles.languageButton,
                  language === 'en' && styles.languageButtonActive,
                ]}
                onPress={() => setLanguage('en')}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.languageButtonText,
                    language === 'en' && styles.languageButtonTextActive,
                  ]}
                >
                  English
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.languageButton,
                  language === 'pt' && styles.languageButtonActive,
                ]}
                onPress={() => setLanguage('pt')}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.languageButtonText,
                    language === 'pt' && styles.languageButtonTextActive,
                  ]}
                >
                  Português
                </Text>
              </TouchableOpacity>
            </View>
          </Box>

          <TouchableOpacity
            style={styles.logoutButtonFull}
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <Text style={styles.logoutButtonText}>
              {t('profile.signOut', 'Sign out')}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <Box title={t('profile.editProfile', 'Edit profile')}>
          <Input
            label={t('profile.name', 'Name')}
            value={form.name}
            onChange={(v) => handleChange('name', v)}
          />
          <Input
            label={t('profile.bodyType', 'Body type')}
            value={form.body_type}
            onChange={(v) => handleChange('body_type', v)}
          />
          <Input
            label={t('profile.goal', 'Goal')}
            value={form.goal}
            onChange={(v) => handleChange('goal', v)}
          />
          <Input
            label={t('profile.weight', 'Weight')}
            value={form.weight}
            onChange={(v) => handleChange('weight', v)}
          />
          <Input
            label={t('profile.height', 'Height')}
            value={form.height}
            onChange={(v) => handleChange('height', v)}
          />
          <Input
            label={t('profile.age', 'Age')}
            value={form.age}
            onChange={(v) => handleChange('age', v)}
          />

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.cancel}
              onPress={handleCancelEdit}
              activeOpacity={0.85}
            >
              <Text style={styles.cancelText}>
                {t('common.cancel', 'Cancel')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.85}
            >
              <Text style={styles.logoutButtonText}>
                {t('profile.signOut', 'Sign out')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.save}
              onPress={handleSaveProfile}
              activeOpacity={0.85}
            >
              <Text style={styles.saveText}>
                {saving
                  ? t('common.saving', 'Saving...')
                  : t('common.save', 'Save')}
              </Text>
            </TouchableOpacity>
          </View>
        </Box>
      )}
    </ScrollView>
  );
}

function Card({ label, value }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );
}

function Box({ title, children }) {
  return (
    <View style={styles.box}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

function Item({ label, value }) {
  return (
    <View style={styles.item}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || '-'}</Text>
    </View>
  );
}

function Input({ label, value, onChange }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholderTextColor={colors.textSecondary}
      />
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

  hero: {
    borderRadius: 28,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    overflow: 'hidden',
  },

  avatarWrapper: {
    marginBottom: spacing.md,
  },

  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },

  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },

  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
  },

  name: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    marginTop: spacing.xs,
  },

  email: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 14,
    marginTop: 4,
    marginBottom: spacing.md,
  },

  editBtn: {
    backgroundColor: '#fff',
    minHeight: 46,
    paddingHorizontal: 18,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  editBtnText: {
    fontWeight: '800',
    color: '#1D2740',
    fontSize: 14,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },

  actionsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },

  card: {
    flex: 1,
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },

  cardLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 8,
  },

  cardValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },

  box: {
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },

  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },

  item: {
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },

  label: {
    color: colors.primary,
    marginBottom: 6,
    fontSize: 13,
    fontWeight: '700',
  },

  value: {
    color: colors.text,
    fontSize: 15,
  },

  inputGroup: {
    marginBottom: spacing.sm,
  },

  input: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    minHeight: 52,
    color: colors.text,
    fontSize: 15,
  },

  cancel: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },

  cancelText: {
    color: colors.text,
    fontWeight: '700',
  },

  logoutButton: {
    flex: 1,
    backgroundColor: 'rgba(255,107,107,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.25)',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },

  logoutButtonFull: {
    backgroundColor: 'rgba(255,107,107,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.25)',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: spacing.xs,
  },

  logoutButtonText: {
    color: '#FF7D7D',
    fontWeight: '800',
  },

  save: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },

  saveText: {
    color: '#fff',
    fontWeight: '800',
  },

  languageRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },

  languageButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },

  languageButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  languageButtonText: {
    color: colors.text,
    fontWeight: '700',
  },

  languageButtonTextActive: {
    color: '#FFFFFF',
  },
});