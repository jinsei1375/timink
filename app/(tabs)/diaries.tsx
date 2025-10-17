import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { DiaryService, DiaryWithDetails } from '@/services/diaryService';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function DiariesScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const [diaries, setDiaries] = useState<DiaryWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDiaries = async () => {
    try {
      const data = await DiaryService.getMyDiaries();
      setDiaries(data);
    } catch (error) {
      console.error('データ取得エラー:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDiaries();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadDiaries();
  };

  const handleCreateDiary = () => {
    // 新規作成画面へ遷移
    router.push('/(tabs)/create-diary');
  };

  const handleDiaryPress = (diaryId: string) => {
    // 日記詳細画面へ遷移（後で実装）
    router.push(`/diary/${diaryId}` as any);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'たった今';
    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;

    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
    });
  };

  const renderDiaryCard = ({ item }: { item: DiaryWithDetails }) => {
    const otherMembers = item.members.filter((m) => m.id !== profile?.id);
    const memberNames = otherMembers.map((m) => m.display_name || '名前なし').join(', ');

    return (
      <TouchableOpacity
        onPress={() => handleDiaryPress(item.id)}
        className="bg-white mx-4 mb-3 rounded-2xl p-4 shadow-sm border border-gray-100"
      >
        {/* ヘッダー部分 */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            {/* メンバーのアバター */}
            <View className="flex-row -space-x-2 mr-3">
              {otherMembers.slice(0, 3).map((member, index) => (
                <View
                  key={member.id}
                  className="w-10 h-10 rounded-full bg-app-primary items-center justify-center border-2 border-white"
                  style={{ zIndex: 10 - index }}
                >
                  <Text className="text-white font-bold text-sm">
                    {member.display_name?.charAt(0) || '?'}
                  </Text>
                </View>
              ))}
              {otherMembers.length > 3 && (
                <View className="w-10 h-10 rounded-full bg-gray-300 items-center justify-center border-2 border-white">
                  <Text className="text-gray-600 font-bold text-xs">
                    +{otherMembers.length - 3}
                  </Text>
                </View>
              )}
            </View>

            {/* タイトル */}
            <View className="flex-1">
              <Text className="text-base font-bold text-gray-800" numberOfLines={1}>
                {item.title}
              </Text>
              <Text className="text-xs text-gray-500 mt-0.5">{memberNames}</Text>
            </View>
          </View>

          {/* 未読バッジ */}
          {item.unread_count > 0 && (
            <View className="bg-red-500 rounded-full w-6 h-6 items-center justify-center ml-2">
              <Text className="text-white text-xs font-bold">{item.unread_count}</Text>
            </View>
          )}
        </View>

        {/* 最新エントリー */}
        {item.latest_entry ? (
          <View className="bg-gray-50 rounded-lg p-3">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-xs font-semibold text-gray-700">
                {item.latest_entry.author.display_name || '名前なし'}
              </Text>
              <Text className="text-xs text-gray-400">
                {formatDate(item.latest_entry.created_at)}
              </Text>
            </View>
            <Text className="text-sm text-gray-600" numberOfLines={2}>
              {item.latest_entry.content}
            </Text>
          </View>
        ) : (
          <View className="bg-gray-50 rounded-lg p-3">
            <Text className="text-sm text-gray-400 text-center">まだ投稿がありません</Text>
          </View>
        )}
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
    <View className="flex-1 bg-gray-50">
      {/* ヘッダー */}
      <View className="bg-white px-6 pt-12 pb-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <Text className="text-3xl font-bold text-gray-800">交換日記</Text>
          <TouchableOpacity
            onPress={handleCreateDiary}
            className="bg-app-primary w-12 h-12 rounded-full items-center justify-center shadow-md"
          >
            <Text className="text-white text-2xl font-light">+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 日記一覧 */}
      <FlatList
        data={diaries}
        renderItem={renderDiaryCard}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 80 }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4">
              <IconSymbol name="book.fill" size={48} color="#9CA3AF" />
            </View>
            <Text className="text-gray-500 text-lg font-semibold mb-2">
              まだ交換日記がありません
            </Text>
            <Text className="text-gray-400 text-sm text-center mb-6 px-8">
              友達と新しい交換日記を始めましょう
            </Text>
            <TouchableOpacity
              onPress={handleCreateDiary}
              className="bg-app-primary px-8 py-3 rounded-full"
            >
              <Text className="text-white font-semibold">交換日記を作成</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}
