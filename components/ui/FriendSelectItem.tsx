import { Avatar } from '@/components/ui/Avatar';
import { Friend } from '@/types';
import React, { useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface FriendSelectItemProps {
  friend: Friend;
  isSelected?: boolean;
  onToggle?: (friendId: string) => void;
  onPress?: () => void;
  disabled?: boolean;
}

/**
 * 友達選択アイテムコンポーネント
 */
export const FriendSelectItem = React.memo<FriendSelectItemProps>(
  ({ friend, isSelected, onToggle, onPress, disabled }) => {
    const handlePress = useCallback(() => {
      if (disabled) return;
      if (onToggle) {
        onToggle(friend.profile.id);
      } else if (onPress) {
        onPress();
      }
    }, [friend.profile.id, onToggle, onPress, disabled]);

    const isInteractive = !!(onToggle || onPress);

    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || !isInteractive}
        className={`flex-row items-center p-4 mb-2 rounded-xl border ${
          isSelected ? 'bg-purple-50 border-app-primary' : 'bg-white border-gray-200'
        } ${disabled ? 'opacity-50' : ''}`}
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
