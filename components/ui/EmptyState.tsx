import { IconSymbol } from '@/components/ui/icon-symbol';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface EmptyStateProps {
  icon?: 'book.fill' | 'person.2' | 'hourglass.fill';
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * 空の状態を表示する汎用コンポーネント
 */
export const EmptyState = React.memo<EmptyStateProps>(
  ({ icon = 'book.fill', title, description, actionLabel, onAction }) => {
    return (
      <View className="flex-1 items-center justify-center py-20 px-8">
        <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4">
          <IconSymbol name={icon} size={48} color="#9CA3AF" />
        </View>
        <Text className="text-gray-500 text-lg font-semibold mb-2 text-center">{title}</Text>
        <Text className="text-gray-400 text-sm text-center mb-6">{description}</Text>
        {actionLabel && onAction && (
          <TouchableOpacity
            onPress={onAction}
            className="bg-app-primary px-8 py-3 rounded-full"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">{actionLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
);

EmptyState.displayName = 'EmptyState';
