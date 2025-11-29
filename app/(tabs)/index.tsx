import { FriendSelectItem } from '@/components/ui/FriendSelectItem';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useAuth } from '@/contexts/AuthContext';
import { FriendService } from '@/services/friendService';
import { Friend, FriendRequest } from '@/types';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [friendsData, requestsData] = await Promise.all([
        FriendService.getFriends(),
        FriendService.getPendingRequests(),
      ]);
      setFriends(friendsData);
      setPendingRequests(requestsData);
    } catch (error) {
      console.error('データ取得エラー:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const handleAcceptRequest = async (requestId: string) => {
    const result = await FriendService.acceptFriendRequest(requestId);
    if (result.success) {
      Alert.alert('成功', '友達リクエストを承認しました');
      loadData();
    } else {
      Alert.alert('エラー', '承認に失敗しました');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    const result = await FriendService.rejectFriendRequest(requestId);
    if (result.success) {
      Alert.alert('完了', '友達リクエストを拒否しました');
      loadData();
    } else {
      Alert.alert('エラー', '拒否に失敗しました');
    }
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
      <ScreenHeader title="ホーム" />

      <FlatList
        data={[]}
        renderItem={() => null}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        ListHeaderComponent={
          <>
            {/* 友達リクエスト */}
            {pendingRequests.length > 0 && (
              <View className="px-6 py-4">
                <Text className="text-lg font-bold text-gray-800 mb-3">友達リクエスト</Text>
                {pendingRequests.map((request) => (
                  <View
                    key={request.id}
                    className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-2"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-gray-800">
                          {request.requester.display_name || '名前なし'}
                        </Text>
                        <Text className="text-sm text-gray-500">@{request.requester.user_id}</Text>
                      </View>
                      <View className="flex-row gap-2">
                        <TouchableOpacity
                          onPress={() => handleAcceptRequest(request.id)}
                          className="bg-app-primary px-4 py-2 rounded"
                        >
                          <Text className="text-white font-semibold">承認</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleRejectRequest(request.id)}
                          className="bg-gray-300 px-4 py-2 rounded"
                        >
                          <Text className="text-gray-700 font-semibold">拒否</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* 友達一覧 */}
            <View className="px-6 py-4">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg font-bold text-gray-800">友達 ({friends.length})</Text>
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/add-friend')}
                  className="bg-app-primary px-3 py-1.5 rounded-lg flex-row items-center"
                >
                  <IconSymbol name="person.badge.plus" size={16} color="#fff" />
                  <Text className="text-white text-sm font-semibold ml-1">追加</Text>
                </TouchableOpacity>
              </View>
              {friends.length === 0 ? (
                <View className="bg-gray-50 rounded-lg p-8 items-center">
                  <IconSymbol name="person.2" size={48} color="#9CA3AF" />
                  <Text className="text-gray-500 mt-4 text-center">まだ友達がいません</Text>
                  <Text className="text-gray-400 text-sm mt-2 text-center">
                    友達を追加して交換日記を始めましょう
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push('/(tabs)/add-friend')}
                    className="bg-app-primary px-6 py-3 rounded-lg mt-4"
                  >
                    <Text className="text-white font-semibold">友達を追加</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                friends.map((friend) => (
                  <FriendSelectItem
                    key={friend.id}
                    friend={friend}
                    isSelected={false}
                    onToggle={() => {}}
                  />
                ))
              )}
            </View>
          </>
        }
      />
    </View>
  );
}
