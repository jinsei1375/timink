import { LanguageSelector } from '@/components/settings/LanguageSelector';
import { InfoBox } from '@/components/ui/InfoBox';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

export default function LanguageSettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title={t('settings.language.title')} onBack={() => router.back()} />
      <View className="flex-1 p-6">
        <View className="mb-6">
          <InfoBox message={`${t('settings.language.description')}`} />
        </View>
        <LanguageSelector />
      </View>
    </View>
  );
}
