import { DiaryCard } from '@/components/diary/DiaryCard';
import { EmptyState } from '@/components/diary/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { DiaryService, DiaryWithDetails } from '@/services/diaryService';
import { formatDate } from '@/utils/formatDate';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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

  const handleCreateDiary = useCallback(() => {
    router.push('/(tabs)/create-diary');
  }, [router]);

  const handleDiaryPress = useCallback(
    (diaryId: string) => {
      router.push(`/diary/${diaryId}` as any);
    },
    [router]
  );

  const renderDiaryCard = useCallback(
    ({ item }: { item: DiaryWithDetails }) => {
      if (!profile) return null;
      return (
        <DiaryCard
          diary={item}
          currentUserId={profile.id}
          onPress={handleDiaryPress}
          formatDate={formatDate}
        />
      );
    },
    [profile, handleDiaryPress]
  );

  const keyExtractor = useCallback((item: DiaryWithDetails) => item.id, []);

  const renderEmptyState = useCallback(
    () => (
      <EmptyState
        icon="book.fill"
        title="まだ交換日記がありません"
        description="友達と新しい交換日記を始めましょう"
        actionLabel="交換日記を作成"
        onAction={handleCreateDiary}
      />
    ),
    [handleCreateDiary]
  );

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
        keyExtractor={keyExtractor}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 80 }}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
}
