import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

interface EmptyStateProps {
  title: string;
  description: string;
  iconName?: keyof typeof Ionicons.glyphMap;
}

export function EmptyState({ title, description, iconName = 'cube-outline' }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <View className="bg-gray-100 rounded-full p-6 mb-4">
        <Ionicons name={iconName} size={48} color="#9CA3AF" />
      </View>
      <Text className="text-xl font-bold text-gray-800 mb-2 text-center">{title}</Text>
      <Text className="text-sm text-gray-600 text-center leading-6">{description}</Text>
    </View>
  );
}
