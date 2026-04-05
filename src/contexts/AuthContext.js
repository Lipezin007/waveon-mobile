import { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axios';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStorage();
  }, []);

  async function loadStorage() {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');

      if (storedToken && storedUser) {
        api.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.log('ERRO AO CARREGAR STORAGE:', error);
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      setUser(user);

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async function register(name, email, password) {
    try {
      await api.post('/auth/register', { name, email, password });
      await login(email, password);
    } catch (error) {
      throw error;
    }
  }

  async function logout() {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');

      delete api.defaults.headers.common.Authorization;
      setUser(null);
    } catch (error) {
      console.log('ERRO AO FAZER LOGOUT:', error);
    }
  }

  async function updateStoredUser(newUser) {
    try {
      setUser(newUser);
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
    } catch (error) {
      console.log('ERRO AO ATUALIZAR USER:', error);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        setUser: updateStoredUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}