import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

type Props = {
  title: string;
  subtitle?: string;
  onBack: () => void;
  onSave: () => void;
  saving?: boolean;
};

export function EditHeader({ title, subtitle, onBack, onSave, saving = false }: Props) {
  const { t } = useTranslation();

  return (
    <View className="bg-app-primary p-6 pb-4">
      <View className="flex-row items-center justify-between">
        <Pressable onPress={onBack}>
          <Ionicons name="close" size={28} color="white" />
        </Pressable>
        <Text className="text-white text-lg font-bold">{t('capsule.editContentTitle')}</Text>
        <Pressable onPress={onSave} disabled={saving} className="opacity-100">
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">{t('common.save')}</Text>
          )}
        </Pressable>
      </View>

      <Text className="text-white/80 text-sm mt-3">{title}</Text>
      {subtitle && <Text className="text-white/60 text-xs mt-1">{subtitle}</Text>}
    </View>
  );
}
