import { Friend } from '@/types';
import React, { useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '../ui/icon-symbol';

interface FriendSelectItemProps {
  friend: Friend;
  isSelected: boolean;
  onToggle: (friendId: string) => void;
}

/**
 * 友達選択アイテムコンポーネント
 */
export const FriendSelectItem = React.memo<FriendSelectItemProps>(
  ({ friend, isSelected, onToggle }) => {
    const handlePress = useCallback(() => {
      onToggle(friend.profile.id);
    }, [friend.profile.id, onToggle]);

    return (
      <TouchableOpacity
        onPress={handlePress}
        className={`flex-row items-center p-4 mb-2 rounded-xl ${
          isSelected ? 'bg-purple-50 border-2 border-app-primary' : 'bg-gray-50'
        }`}
        activeOpacity={0.7}
      >
        <View
          className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${
            isSelected ? 'bg-app-primary' : 'bg-gray-300'
          }`}
        >
          <Text className="text-white text-lg font-bold">
            {friend.profile.display_name?.charAt(0) || '?'}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-800">
            {friend.profile.display_name || '名前なし'}
          </Text>
          <Text className="text-sm text-gray-500">@{friend.profile.user_id}</Text>
        </View>
        {isSelected && <IconSymbol name="chevron.right" size={20} color="#6C6EE6" />}
      </TouchableOpacity>
    );
  }
);

FriendSelectItem.displayName = 'FriendSelectItem';
