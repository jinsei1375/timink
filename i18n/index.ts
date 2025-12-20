import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ja from './locales/ja.json';

i18n.use(initReactI18next).init({
  resources: {
    ja: { translation: ja },
    en: { translation: en },
  },
  lng: 'ja', // デフォルトは日本語
  fallbackLng: 'ja',
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: 'v4',
});

export default i18n;
