import { Avatar } from '@/components/ui/Avatar';
import { Friend } from '@/types';
import React, { useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface FriendSelectItemProps {
  friend: Friend;
  isSelected: boolean;
  onToggle?: (friendId: string) => void;
}

/**
 * 友達選択アイテムコンポーネント
 */
export const FriendSelectItem = React.memo<FriendSelectItemProps>(
  ({ friend, isSelected, onToggle }) => {
    const handlePress = useCallback(() => {
      if (onToggle) {
        onToggle(friend.profile.id);
      }
    }, [friend.profile.id, onToggle]);

    return (
      <TouchableOpacity
        onPress={handlePress}
        className={`flex-row items-center p-4 mb-2 border rounded-xl ${
          isSelected ? 'border-app-primary' : 'border-gray-300'
        }`}
        activeOpacity={0.7}
      >
        <Avatar uri={friend.profile.avatar_url} size={48} className="mr-3" />
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-800">
            {friend.profile.display_name || '名前なし'}
          </Text>
          <Text className="text-sm text-gray-500">@{friend.profile.user_id}</Text>
        </View>
      </TouchableOpacity>
    );
  }
);

FriendSelectItem.displayName = 'FriendSelectItem';
