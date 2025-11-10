import { CapsuleType } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

type Props = {
  selectedType: CapsuleType;
  onSelect: (type: CapsuleType) => void;
};

export function CapsuleTypeSelector({ selectedType, onSelect }: Props) {
  const types = [
    {
      value: 'personal' as CapsuleType,
      icon: 'person-outline',
      title: '個人',
      description: '自分だけのカプセル',
    },
    {
      value: 'one_to_one' as CapsuleType,
      icon: 'people-outline',
      title: '1対1',
      description: '友達1人と共有',
    },
    {
      value: 'group' as CapsuleType,
      icon: 'people',
      title: 'グループ',
      description: '複数の友達と共有',
    },
  ];

  return (
    <View className="mb-6">
      <Text className="text-sm font-semibold text-gray-700 mb-2">
        カプセルタイプ <Text className="text-red-500">*</Text>
      </Text>
      <View className="gap-2">
        {types.map((type) => (
          <Pressable
            key={type.value}
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
              <Text className="text-base font-semibold text-gray-900">{type.title}</Text>
              <Text className="text-sm text-gray-600">{type.description}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
