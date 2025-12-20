import { useTranslation } from 'react-i18next';
import { Text, TextInput, View } from 'react-native';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  maxLength?: number;
};

export function ContentTextArea({ value, onChangeText, maxLength = 1000 }: Props) {
  const { t } = useTranslation();

  return (
    <View className="mb-6">
      <Text className="text-gray-700 font-semibold mb-2">{t('capsule.message')}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={t('capsule.messagePlaceholder')}
        placeholderTextColor="#9CA3AF"
        multiline
        numberOfLines={8}
        textAlignVertical="top"
        maxLength={maxLength}
        className="bg-gray-50 rounded-xl p-4 text-gray-900 min-h-[150px]"
      />
      <Text className="text-gray-500 text-xs mt-2">
        {value.length} / {maxLength} {t('capsule.characters')}
      </Text>
    </View>
  );
}
