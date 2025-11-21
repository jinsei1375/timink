import { EmptyState } from '@/components/diary/EmptyState';
import { FriendSelectItem } from '@/components/diary/FriendSelectItem';
import { BackButton } from '@/components/ui/BackButton';
import { DiaryService } from '@/services/diaryService';
import { FriendService } from '@/services/friendService';
import { Friend } from '@/types';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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

  const toggleFriendSelection = useCallback((friendId: string) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId) ? prev.filter((id) => id !== friendId) : [...prev, friendId]
    );
  }, []);

  const handleCreate = useCallback(async () => {
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
  }, [title, selectedFriends, router]);

  const renderFriendItem = useCallback(
    ({ item }: { item: Friend }) => {
      const isSelected = selectedFriends.includes(item.profile.id);
      return (
        <FriendSelectItem friend={item} isSelected={isSelected} onToggle={toggleFriendSelection} />
      );
    },
    [selectedFriends, toggleFriendSelection]
  );

  const keyExtractor = useCallback((item: Friend) => item.id, []);

  const renderEmptyState = useCallback(
    () => (
      <EmptyState
        icon="person.2"
        title="友達がいません"
        description="まず友達を追加してください"
        actionLabel="友達を追加"
        onAction={() => router.push('/(tabs)/add-friend')}
      />
    ),
    [router]
  );

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
          <BackButton onPress={() => router.back()} />
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
            renderEmptyState()
          ) : (
            <FlatList
              data={friends}
              renderItem={renderFriendItem}
              keyExtractor={keyExtractor}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </View>
      </View>
    </View>
  );
}
