import { TypeOption } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

type Props<T> = {
  label?: string;
  options: TypeOption<T>[];
  selectedType: T;
  onSelect: (type: T) => void;
};

export function TypeSelector<T extends string | number>({
  label,
  options,
  selectedType,
  onSelect,
}: Props<T>) {
  const { t } = useTranslation();
  const displayLabel = label || t('capsule.type.personal');
  return (
    <View className="mb-6">
      <Text className="text-sm font-semibold text-gray-700 mb-2">
        {displayLabel} <Text className="text-red-500">*</Text>
      </Text>
      <View className="gap-2">
        {options.map((type) => (
          <Pressable
            key={String(type.value)}
            onPress={() => onSelect(type.value)}
            className={`flex-row items-center p-4 rounded-xl border ${
              selectedType === type.value
                ? 'bg-app-primary-light border-app-primary'
                : 'bg-white border-gray-300'
            }`}
          >
            <Ionicons
              name={selectedType === type.value ? 'radio-button-on' : 'radio-button-off'}
              size={24}
              color={selectedType === type.value ? '#6C6EE6' : '#9CA3AF'}
            />
            <View className="ml-3 flex-1">
              <View className="flex-row items-center gap-2">
                <Ionicons
                  name={type.icon}
                  size={20}
                  color={selectedType === type.value ? '#6C6EE6' : '#4B5563'}
                />
                <Text
                  className={`text-base font-bold ${
                    selectedType === type.value ? 'text-app-primary' : 'text-gray-700'
                  }`}
                >
                  {type.title}
                </Text>
              </View>
              <Text className="text-xs text-gray-500 mt-1">{type.description}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
