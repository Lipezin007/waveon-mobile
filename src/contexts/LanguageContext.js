import { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translate } from '../i18n';

const LANGUAGE_KEY = '@waveon_language';

export const LanguageContext = createContext({});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState('en');
  const [loadingLanguage, setLoadingLanguage] = useState(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  async function loadLanguage() {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);

      if (savedLanguage) {
        setLanguageState(savedLanguage);
      }
    } catch (error) {
      console.log('LOAD LANGUAGE ERROR:', error);
    } finally {
      setLoadingLanguage(false);
    }
  }

  async function setLanguage(languageCode) {
    try {
      setLanguageState(languageCode);
      await AsyncStorage.setItem(LANGUAGE_KEY, languageCode);
    } catch (error) {
      console.log('SET LANGUAGE ERROR:', error);
    }
  }

  function t(key, fallback, vars) {
    return translate(language, key, fallback, vars);
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        loadingLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}