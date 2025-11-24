import { DiaryCard } from '@/components/diary/DiaryCard';
import { EmptyState } from '@/components/diary/EmptyState';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useAuth } from '@/contexts/AuthContext';
import { DiaryService, DiaryWithDetails } from '@/services/diaryService';
import { formatDate } from '@/utils/formatDate';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, TouchableOpacity, View } from 'react-native';

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
    router.push('/diary/create');
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
      <ScreenHeader
        title="交換日記"
        rightElement={
          <TouchableOpacity onPress={handleCreateDiary}>
            <Ionicons name="add-circle-outline" size={28} color="#6C6EE6" />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={diaries}
        renderItem={renderDiaryCard}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={renderEmptyState}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      />
    </View>
  );
}
