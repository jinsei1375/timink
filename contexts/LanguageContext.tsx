import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Language = 'ja' | 'en' | 'zh' | 'ko' | 'fr' | 'hi' | 'id' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState<Language>('ja');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem('app_language');
      const lang = (saved as Language) || 'ja';
      setLanguageState(lang);
      i18n.changeLanguage(lang);
    } catch (error) {
      console.error('言語設定の読み込みエラー:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      // AsyncStorageに保存
      await AsyncStorage.setItem('app_language', lang);
      setLanguageState(lang);
      i18n.changeLanguage(lang);

      // Supabaseにも保存（ログイン中の場合）
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({ preferred_language: lang }).eq('id', user.id);
      }
    } catch (error) {
      console.error('言語設定の保存エラー:', error);
      throw error;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
