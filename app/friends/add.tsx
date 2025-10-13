import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { FriendService } from '@/services/friendService';
import { UserSearchResult } from '@/types';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AddFriendScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<UserSearchResult | null>(null);
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('エラー', 'ユーザーIDを入力してください');
      return;
    }

    if (!profile?.id) {
      Alert.alert('エラー', 'ログインが必要です');
      return;
    }

    setIsSearching(true);
    setSearchResult(null);

    try {
      const result = await FriendService.searchUserById(searchQuery.trim(), profile.id);

      if (result) {
        setSearchResult(result);
      } else {
        Alert.alert('見つかりませんでした', 'このユーザーIDは存在しません');
      }
    } catch (error) {
      Alert.alert('エラー', '検索に失敗しました');
      console.error('検索エラー:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async () => {
    if (!searchResult) return;

    setIsSendingRequest(true);

    try {
      const result = await FriendService.sendFriendRequest(searchResult.id);

      if (result.success) {
        Alert.alert('送信完了', '友達リクエストを送信しました', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert('エラー', '友達リクエストの送信に失敗しました');
      }
    } catch (error) {
      Alert.alert('エラー', '友達リクエストの送信に失敗しました');
      console.error('リクエスト送信エラー:', error);
    } finally {
      setIsSendingRequest(false);
    }
  };

  const getStatusMessage = () => {
    if (!searchResult) return null;

    if (searchResult.is_friend) {
      return (
        <View className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
          <Text className="text-green-700 text-center font-semibold">すでに友達です</Text>
        </View>
      );
    }

    if (searchResult.friendship_status === 'pending') {
      return (
        <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
          <Text className="text-yellow-700 text-center font-semibold">リクエスト送信済み</Text>
        </View>
      );
    }

    return null;
  };

  const canSendRequest =
    searchResult && !searchResult.is_friend && searchResult.friendship_status !== 'pending';

  return (
    <View className="flex-1 bg-white">
      {/* ヘッダー */}
      <View className="px-6 pt-8 pb-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <IconSymbol
              name="chevron.right"
              size={24}
              color="#6C6EE6"
              style={{ transform: [{ rotate: '180deg' }] }}
            />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800">友達を追加</Text>
        </View>
      </View>

      {/* 検索フォーム */}
      <View className="px-6 py-6">
        <Text className="text-sm text-gray-600 mb-2">ユーザーIDで検索</Text>
        <View className="flex-row gap-2">
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="timink_xxxxxxxx"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            autoCorrect={false}
            className="flex-1 bg-gray-100 rounded-lg px-4 py-3 text-gray-800"
            editable={!isSearching}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity
            onPress={handleSearch}
            disabled={isSearching}
            className="bg-app-primary px-6 py-3 rounded-lg justify-center"
          >
            {isSearching ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white font-semibold">検索</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 検索結果 */}
        {searchResult && (
          <View className="mt-6 bg-gray-50 rounded-lg p-4">
            <View className="flex-row items-center mb-3">
              <View className="w-16 h-16 bg-app-primary rounded-full items-center justify-center mr-4">
                <Text className="text-white text-2xl font-bold">
                  {searchResult.display_name?.charAt(0) || '?'}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-800">
                  {searchResult.display_name || '名前なし'}
                </Text>
                <Text className="text-sm text-gray-500">@{searchResult.user_id}</Text>
              </View>
            </View>

            {getStatusMessage()}

            {canSendRequest && (
              <TouchableOpacity
                onPress={handleSendRequest}
                disabled={isSendingRequest}
                className="bg-app-primary mt-4 py-3 rounded-lg items-center"
              >
                {isSendingRequest ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-white font-semibold">友達リクエストを送信</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ヘルプテキスト */}
        <View className="mt-8 bg-blue-50 rounded-lg p-4">
          <Text className="text-sm text-gray-700 mb-2">💡 ユーザーIDについて</Text>
          <Text className="text-xs text-gray-600 leading-5">
            ユーザーIDは、プロフィール画面で確認・変更できます。
            友達に共有してもらい、検索して追加しましょう。
          </Text>
        </View>
      </View>
    </View>
  );
}
