import { useLanguage } from '@/contexts/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

export function LanguageSelector() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  const options = [
    { value: 'ja' as const, label: t('settings.language.japanese') },
    { value: 'en' as const, label: t('settings.language.english') },
    { value: 'zh' as const, label: t('settings.language.chinese') },
    { value: 'ko' as const, label: t('settings.language.korean') },
    { value: 'fr' as const, label: t('settings.language.french') },
    { value: 'hi' as const, label: t('settings.language.hindi') },
    { value: 'id' as const, label: t('settings.language.indonesian') },
    { value: 'es' as const, label: t('settings.language.spanish') },
  ];

  const confirmLanguageChange = (value: (typeof options)[number]['value'], label: string) => {
    if (language === value) {
      return;
    }

    Alert.alert(
      t('settings.language.confirmTitle'),
      t('settings.language.confirmMessage', { language: label }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          onPress: async () => {
            try {
              await setLanguage(value);
            } catch (error) {
              console.error('言語変更エラー:', error);
              Alert.alert(t('common.error'), t('settings.language.changeError'));
            }
          },
        },
      ]
    );
  };

  return (
    <View className="bg-white rounded-2xl overflow-hidden">
      <View className="px-4 py-3 border-b border-gray-100">
        <Text className="text-sm font-medium text-gray-500">{t('settings.language.title')}</Text>
      </View>
      {options.map((option, index) => (
        <TouchableOpacity
          key={option.value}
          onPress={() => confirmLanguageChange(option.value, option.label)}
          className={`flex-row items-center justify-between px-4 py-4 ${
            index < options.length - 1 ? 'border-b border-gray-100' : ''
          }`}
        >
          <Text
            className={`text-base text-gray-800 ${language === option.value ? 'font-semibold' : ''}`}
          >
            {option.label}
          </Text>
          {language === option.value && <Ionicons name="checkmark" size={24} color="#6C6EE6" />}
        </TouchableOpacity>
      ))}
    </View>
  );
}
