import { Friend } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';

type Props = {
  friends: Friend[];
  selectedFriendIds: string[];
  onToggleFriend: (friendId: string) => void;
  maxSelection?: number;
};

export function FriendSelector({
  friends,
  selectedFriendIds,
  onToggleFriend,
  maxSelection,
}: Props) {
  if (friends.length === 0) {
    return (
      <View className="bg-gray-50 p-4 rounded-xl">
        <Text className="text-sm text-gray-600 text-center">友達がいません</Text>
      </View>
    );
  }

  return (
    <ScrollView className="max-h-64 bg-white rounded-xl border border-gray-300">
      <View className="p-2">
        {friends.map((friend) => {
          const isSelected = selectedFriendIds.includes(friend.profile.id);
          const isDisabled = !!(
            maxSelection &&
            selectedFriendIds.length >= maxSelection &&
            !isSelected
          );

          return (
            <Pressable
              key={friend.profile.id}
              onPress={() => !isDisabled && onToggleFriend(friend.profile.id)}
              disabled={isDisabled}
              className={`flex-row items-center justify-between p-3 rounded-lg ${
                isDisabled ? 'opacity-50' : ''
              }`}
            >
              <Text className="text-base text-gray-900">
                {friend.profile.display_name || '名前なし'}
              </Text>
              <Ionicons
                name={isSelected ? 'checkbox' : 'square-outline'}
                size={24}
                color={isSelected ? '#6C6EE6' : '#9CA3AF'}
              />
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
