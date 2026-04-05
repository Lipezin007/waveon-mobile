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
import api from '../../api/axios';

const AVATAR_KEY = '@waveon_avatar';

export default function ProfileScreen() {
  const { user, setUser, logout } = useContext(AuthContext);

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
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permissão necessária');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
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
        Alert.alert('Nome obrigatório');
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
      Alert.alert('Salvo com sucesso');
    } catch (error) {
      console.log('PROFILE ERROR:', error?.response?.data || error);
      Alert.alert(
        'Erro ao salvar',
        error?.response?.data?.message || 'Tente novamente.'
      );
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    Alert.alert('Sair', 'Deseja sair da conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  }

  function formatDate(date) {
    if (!date) return '---';
    return new Date(date).toLocaleDateString();
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6E86BC" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient
        colors={['#6E86BC', '#4D618F', '#2A3550']}
        style={styles.hero}
      >
        <TouchableOpacity onPress={pickImage}>
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

        <Text style={styles.name}>{form.name}</Text>
        <Text style={styles.email}>{form.email}</Text>

        {!editing && (
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setEditing(true)}
          >
            <Text style={styles.editBtnText}>Editar</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>

      {!editing ? (
        <>
          <View style={styles.row}>
            <Card label="Peso" value={form.weight ? `${form.weight}kg` : '-'} />
            <Card
              label="Altura"
              value={form.height ? `${form.height}cm` : '-'}
            />
          </View>

          <View style={styles.row}>
            <Card label="Idade" value={form.age || '-'} />
            <Card label="Plano" value={form.plan || '-'} />
          </View>

          <Box title="Perfil">
            <Item label="Body type" value={form.body_type} />
            <Item label="Objetivo" value={form.goal} />
          </Box>

          <Box title="Conta">
            <Item label="Email" value={form.email} />
            <Item label="Criado em" value={formatDate(form.created_at)} />
          </Box>

          <TouchableOpacity style={styles.logoutButtonFull} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Sair</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Box title="Editar perfil">
          <Input
            label="Nome"
            value={form.name}
            onChange={(v) => handleChange('name', v)}
          />
          <Input
            label="Body type"
            value={form.body_type}
            onChange={(v) => handleChange('body_type', v)}
          />
          <Input
            label="Objetivo"
            value={form.goal}
            onChange={(v) => handleChange('goal', v)}
          />
          <Input
            label="Peso"
            value={form.weight}
            onChange={(v) => handleChange('weight', v)}
          />
          <Input
            label="Altura"
            value={form.height}
            onChange={(v) => handleChange('height', v)}
          />
          <Input
            label="Idade"
            value={form.age}
            onChange={(v) => handleChange('age', v)}
          />

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.cancel} onPress={handleCancelEdit}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Sair</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.save} onPress={handleSaveProfile}>
              <Text style={styles.saveText}>
                {saving ? 'Salvando...' : 'Salvar'}
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
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholderTextColor="#888"
      />
    </>
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

  hero: {
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#fff3',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },

  avatarText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '900',
  },

  name: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 10,
  },

  email: {
    color: '#ccc',
    marginBottom: 10,
  },

  editBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },

  editBtnText: {
    fontWeight: '800',
    color: '#111',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },

  card: {
    backgroundColor: '#121212',
    width: '48%',
    padding: 15,
    borderRadius: 14,
  },

  cardLabel: {
    color: '#888',
    fontSize: 12,
  },

  cardValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },

  box: {
    backgroundColor: '#121212',
    padding: 15,
    borderRadius: 14,
    marginBottom: 10,
  },

  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },

  item: {
    marginTop: 10,
  },

  label: {
    color: '#8EA2D0',
    marginBottom: 4,
  },

  value: {
    color: '#fff',
  },

  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    padding: 10,
    color: '#fff',
    marginBottom: 10,
  },

  cancel: {
    flex: 1,
    backgroundColor: '#222',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  cancelText: {
    color: '#fff',
    fontWeight: '700',
  },

  logoutButton: {
    flex: 1,
    backgroundColor: '#2A1111',
    borderWidth: 1,
    borderColor: '#5A2222',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  logoutButtonFull: {
    backgroundColor: '#2A1111',
    borderWidth: 1,
    borderColor: '#5A2222',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },

  logoutButtonText: {
    color: '#FF6B6B',
    fontWeight: '800',
  },

  save: {
    flex: 1,
    backgroundColor: '#6E86BC',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  saveText: {
    color: '#fff',
    fontWeight: '800',
  },
});