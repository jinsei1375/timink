import { FriendSelectItem } from '@/components/ui/FriendSelectItem';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useRefresh } from '@/contexts/RefreshContext';
import { FriendService } from '@/services/friendService';
import { Friend, FriendRequest, RefreshEvent } from '@/types';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function FriendsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { subscribe, emit } = useRefresh();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 友達関連イベントを購読
  useEffect(() => {
    const unsubscribers = [
      subscribe(RefreshEvent.FRIEND_ADDED, loadData),
      subscribe(RefreshEvent.FRIEND_ACCEPTED, loadData),
    ];

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [subscribe, loadData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const handleAcceptRequest = async (requestId: string) => {
    const result = await FriendService.acceptFriendRequest(requestId);
    if (result.success) {
      emit(RefreshEvent.FRIEND_ACCEPTED);
      Alert.alert(t('common.success'), t('friends.acceptSuccess'));
    } else {
      Alert.alert(t('common.error'), t('friends.acceptError'));
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    const result = await FriendService.rejectFriendRequest(requestId);
    if (result.success) {
      emit(RefreshEvent.FRIEND_ACCEPTED);
      Alert.alert(t('common.success'), t('friends.rejectSuccess'));
    } else {
      Alert.alert(t('common.error'), t('friends.rejectError'));
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
      <ScreenHeader title={t('friends.title')} />

      <FlatList
        data={[]}
        renderItem={() => null}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        ListHeaderComponent={
          <>
            {/* 友達リクエスト */}
            {pendingRequests.length > 0 && (
              <View className="px-6 py-4">
                <Text className="text-lg font-bold text-gray-800 mb-3">
                  {t('friends.friendRequests')}
                </Text>
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
                          <Text className="text-white font-semibold">{t('friends.accept')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleRejectRequest(request.id)}
                          className="bg-gray-300 px-4 py-2 rounded"
                        >
                          <Text className="text-gray-700 font-semibold">{t('friends.reject')}</Text>
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
                <Text className="text-lg font-bold text-gray-800">
                  {t('friends.count', { count: friends.length })}
                </Text>
                <TouchableOpacity
                  onPress={() => router.push('/friend/add')}
                  className="bg-app-primary px-3 py-1.5 rounded-lg flex-row items-center"
                >
                  <IconSymbol name="person.badge.plus" size={16} color="#fff" />
                  <Text className="text-white text-sm font-semibold ml-1">
                    {t('friends.addButton')}
                  </Text>
                </TouchableOpacity>
              </View>
              {friends.length === 0 ? (
                <View className="bg-gray-50 rounded-lg p-8 items-center">
                  <IconSymbol name="person.2" size={48} color="#9CA3AF" />
                  <Text className="text-gray-500 mt-4 text-center">{t('friends.empty')}</Text>
                  <Text className="text-gray-400 text-sm mt-2 text-center">
                    {t('friends.emptyDescription')}
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push('/friend/add')}
                    className="bg-app-primary px-6 py-3 rounded-lg mt-4"
                  >
                    <Text className="text-white font-semibold">{t('friends.add')}</Text>
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
