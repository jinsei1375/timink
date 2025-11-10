import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

type Props = {
  unlockDate: Date;
  onPress: () => void;
};

export function DateSelector({ unlockDate, onPress }: Props) {
  return (
    <View className="mb-6">
      <Text className="text-sm font-semibold text-gray-700 mb-2">
        開封日 <Text className="text-red-500">*</Text>
      </Text>
      <Pressable
        onPress={onPress}
        className="bg-white border border-gray-300 rounded-xl px-4 py-3 flex-row items-center justify-between"
      >
        <Text className="text-base text-gray-900">
          {unlockDate.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
        <Ionicons name="calendar-outline" size={20} color="#6B7280" />
      </Pressable>
    </View>
  );
}
