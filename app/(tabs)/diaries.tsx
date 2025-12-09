import { DiaryCard } from '@/components/diary/DiaryCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useAuth } from '@/contexts/AuthContext';
import { RefreshEvent, useRefresh } from '@/contexts/RefreshContext';
import { DiaryService, DiaryWithDetails } from '@/services/diaryService';
import { formatDate } from '@/utils/formatDate';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  View,
} from 'react-native';

export default function DiariesScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { subscribe } = useRefresh();
  const [diaries, setDiaries] = useState<DiaryWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDiaries = useCallback(async () => {
    try {
      const data = await DiaryService.getMyDiaries();
      // ピン留め順 > 更新日順 でソート
      const sortedData = data.sort((a, b) => {
        if (a.is_pinned === b.is_pinned) {
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        }
        return a.is_pinned ? -1 : 1;
      });
      setDiaries(sortedData);
    } catch (error) {
      console.error('データ取得エラー:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDiaries();
  }, [loadDiaries]);

  // 日記関連イベントを購読
  useEffect(() => {
    const unsubscribers = [
      subscribe(RefreshEvent.DIARY_CREATED, loadDiaries),
      subscribe(RefreshEvent.DIARY_UPDATED, loadDiaries),
    ];

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [subscribe, loadDiaries]);

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

  const handleLongPress = useCallback(
    (diaryId: string) => {
      const diary = diaries.find((d) => d.id === diaryId);
      if (!diary || !profile) return;

      Alert.alert(
        diary.title,
        diary.is_pinned ? 'ピン留めを外しますか？' : 'この日記をピン留めしますか？',
        [
          { text: 'キャンセル', style: 'cancel' },
          {
            text: diary.is_pinned ? '外す' : 'ピン留め',
            onPress: async () => {
              try {
                await DiaryService.togglePin(diary.id, profile.id, !!diary.is_pinned);
                loadDiaries(); // リロード
              } catch (error) {
                console.error(error);
                Alert.alert('エラー', 'ピン留めの更新に失敗しました');
              }
            },
          },
        ]
      );
    },
    [diaries, profile]
  );

  const renderDiaryCard = useCallback(
    ({ item }: { item: DiaryWithDetails }) => {
      if (!profile) return null;
      return (
        <DiaryCard
          diary={item}
          currentUserId={profile.id}
          onPress={handleDiaryPress}
          onLongPress={handleLongPress}
          formatDate={formatDate}
        />
      );
    },
    [profile, handleDiaryPress, handleLongPress]
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
