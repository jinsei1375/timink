import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

export function EditNotice() {
  const { t } = useTranslation();

  return (
    <View className="bg-yellow-50 rounded-xl p-4 mt-4">
      <View className="flex-row">
        <Ionicons name="information-circle" size={20} color="#F59E0B" />
        <View className="flex-1 ml-2">
          <Text className="text-yellow-800 text-sm font-semibold mb-1">{t('capsule.notice')}</Text>
          <Text className="text-yellow-700 text-xs">{t('capsule.noticeMessage')}</Text>
        </View>
      </View>
    </View>
  );
}
