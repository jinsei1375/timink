import { IconSymbol } from '@/components/ui/icon-symbol';
import { DiaryService } from '@/services/diaryService';
import { FriendService } from '@/services/friendService';
import { Friend } from '@/types';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function CreateDiaryScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      const data = await FriendService.getFriends();
      setFriends(data);
    } catch (error) {
      console.error('友達一覧取得エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFriendSelection = (friendId: string) => {
    if (selectedFriends.includes(friendId)) {
      setSelectedFriends(selectedFriends.filter((id) => id !== friendId));
    } else {
      setSelectedFriends([...selectedFriends, friendId]);
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('エラー', 'タイトルを入力してください');
      return;
    }

    if (selectedFriends.length === 0) {
      Alert.alert('エラー', '少なくとも1人の友達を選択してください');
      return;
    }

    setIsCreating(true);

    try {
      const result = await DiaryService.createDiary(title, selectedFriends);

      if (result.success) {
        Alert.alert('作成完了', '交換日記を作成しました', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert('エラー', '作成に失敗しました');
      }
    } catch (error) {
      Alert.alert('エラー', '作成中にエラーが発生しました');
      console.error('作成エラー:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const renderFriendItem = ({ item }: { item: Friend }) => {
    const isSelected = selectedFriends.includes(item.profile.id);

    return (
      <TouchableOpacity
        onPress={() => toggleFriendSelection(item.profile.id)}
        className={`flex-row items-center p-4 mb-2 rounded-xl ${
          isSelected ? 'bg-purple-50 border-2 border-app-primary' : 'bg-gray-50'
        }`}
      >
        <View
          className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${
            isSelected ? 'bg-app-primary' : 'bg-gray-300'
          }`}
        >
          <Text className="text-white text-lg font-bold">
            {item.profile.display_name?.charAt(0) || '?'}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-800">
            {item.profile.display_name || '名前なし'}
          </Text>
          <Text className="text-sm text-gray-500">@{item.profile.user_id}</Text>
        </View>
        {isSelected && <IconSymbol name="chevron.right" size={20} color="#6C6EE6" />}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#6C6EE6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* ヘッダー */}
      <View className="px-6 pt-12 pb-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <IconSymbol
              name="chevron.right"
              size={24}
              color="#6C6EE6"
              style={{ transform: [{ rotate: '180deg' }] }}
            />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800 flex-1">交換日記を作成</Text>
          <TouchableOpacity
            onPress={handleCreate}
            disabled={isCreating || !title.trim() || selectedFriends.length === 0}
            className={`px-4 py-2 rounded-lg ${
              isCreating || !title.trim() || selectedFriends.length === 0
                ? 'bg-gray-300'
                : 'bg-app-primary'
            }`}
          >
            {isCreating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white font-semibold">作成</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1 px-6">
        {/* タイトル入力 */}
        <View className="py-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2">タイトル</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="例: 大学時代の思い出"
            placeholderTextColor="#9CA3AF"
            className="bg-gray-50 rounded-lg px-4 py-3 text-gray-800 text-base"
            maxLength={50}
          />
          <Text className="text-xs text-gray-400 mt-1 text-right">{title.length}/50</Text>
        </View>

        {/* 友達選択 */}
        <View className="flex-1">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            メンバーを選択 ({selectedFriends.length}人選択中)
          </Text>

          {friends.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <IconSymbol name="person.2" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 mt-4 text-center">友達がいません</Text>
              <Text className="text-gray-400 text-sm mt-2 text-center">
                まず友達を追加してください
              </Text>
            </View>
          ) : (
            <FlatList
              data={friends}
              renderItem={renderFriendItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </View>
      </View>
    </View>
  );
}
