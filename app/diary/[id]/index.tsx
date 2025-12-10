import { DiaryPageView } from '@/components/diary/DiaryPageView';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useAuth } from '@/contexts/AuthContext';
import { RefreshEvent, useRefresh } from '@/contexts/RefreshContext';
import { DiaryService } from '@/services/diaryService';
import { DiaryEntry, Profile } from '@/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Keyboard,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DiaryDetail {
  id: string;
  title: string;
  is_group: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  members: Profile[];
}

export default function DiaryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const { subscribe } = useRefresh();
  const flatListRef = useRef<FlatList<DiaryEntry & { author: Profile }>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const [diary, setDiary] = useState<DiaryDetail | null>(null);
  const [entries, setEntries] = useState<(DiaryEntry & { author: Profile })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canPost, setCanPost] = useState(false);
  const [nextPostTime, setNextPostTime] = useState<Date | null>(null);

  const handleBack = () => {
    router.replace('/(tabs)/diaries');
  };

  const loadDiaryData = useCallback(async () => {
    if (!id) return;

    try {
      // 日記詳細取得
      const detailResult = await DiaryService.getDiaryDetail(id);
      if (detailResult.success && detailResult.data) {
        setDiary(detailResult.data);
      }

      // エントリー一覧取得
      const entriesResult = await DiaryService.getDiaryEntries(id);
      if (entriesResult.success) {
        setEntries(entriesResult.data);
      }

      // 投稿可能かチェック
      const canPostToday = await DiaryService.canPostToday(id);
      setCanPost(canPostToday);

      // 次回投稿時刻取得
      if (!canPostToday) {
        const nextTime = await DiaryService.getNextPostTime(id);
        setNextPostTime(nextTime);
      }
    } catch (error) {
      console.error('日記データ取得エラー:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    loadDiaryData();
  }, [loadDiaryData]);

  // 日記更新イベントを購読
  useEffect(() => {
    const unsubscribe = subscribe(RefreshEvent.DIARY_UPDATED, loadDiaryData);
    return () => {
      unsubscribe();
    };
  }, [subscribe, loadDiaryData]);

  // リアルタイム更新を設定
  useEffect(() => {
    if (!id) return;

    // DiaryServiceを使用してRealtime購読
    const channel = DiaryService.subscribeToEntries(id, {
      onInsert: (newEntry) => {
        // 重複チェック付きで追加
        setEntries((prev) => {
          const existingIds = new Set(prev.map((e) => e.id));
          if (existingIds.has(newEntry.id)) return prev;
          return [...prev, newEntry];
        });

        // 投稿可能状態を再チェック
        DiaryService.canPostToday(id).then((canPostToday) => {
          setCanPost(canPostToday);
          if (!canPostToday) {
            DiaryService.getNextPostTime(id).then((nextTime) => {
              setNextPostTime(nextTime);
            });
          }
        });

        // 最新ページにスクロール（新しいエントリーが追加された場合）
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      },
      onUpdate: (updatedEntry) => {
        setEntries((prev) =>
          prev.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry))
        );
      },
      onDelete: (entryId) => {
        setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
      },
    });

    // クリーンアップ
    return () => {
      DiaryService.unsubscribeFromEntries(channel);
    };
  }, [id, profile]);

  // 初回ロード後、最新ページ（最後）にスクロール
  useEffect(() => {
    if (entries.length > 0 && !isLoading && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [entries.length, isLoading]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadDiaryData();
  };

  const renderPage = useCallback(
    ({ item, index }: { item: DiaryEntry & { author: Profile }; index: number }) => (
      <View style={{ width: SCREEN_WIDTH }}>
        <DiaryPageView
          entry={item}
          currentPage={index + 1}
          totalPages={entries.length}
          currentUserId={profile?.id}
        />
      </View>
    ),
    [entries.length, profile]
  );

  const keyExtractor = useCallback((item: DiaryEntry) => item.id, []);

  const renderEmptyState = useCallback(
    () => (
      <View className="flex-1 items-center justify-center bg-white">
        <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-6">
          <IconSymbol name="book.fill" size={48} color="#9CA3AF" />
        </View>
        <Text className="text-gray-500 text-lg font-semibold mb-2">まだ投稿がありません</Text>
        <Text className="text-gray-400 text-sm text-center px-8">
          最初の1ページを書いてみましょう
        </Text>
      </View>
    ),
    []
  );

  if (isLoading) {
    return (
      <SafeAreaView>
        <ActivityIndicator size="large" color="#6C6EE6" />
      </SafeAreaView>
    );
  }

  if (!diary) {
    return (
      <SafeAreaView>
        <Text className="text-gray-500">日記が見つかりません</Text>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-gradient-to-b from-gray-100 to-gray-50">
      <ScreenHeader
        title={diary.title}
        subtitle={entries.length > 0 ? `📖 ${entries.length}ページの思い出` : undefined}
        onBack={handleBack}
      />

      {/* ページビュー（横スクロール） */}
      {entries.length === 0 ? (
        renderEmptyState()
      ) : (
        <View className="flex-1">
          <Animated.FlatList
            ref={flatListRef}
            data={entries}
            renderItem={renderPage}
            keyExtractor={keyExtractor}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToAlignment="center"
            decelerationRate="fast"
            scrollEventThrottle={16}
            keyboardShouldPersistTaps="handled"
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
              useNativeDriver: true,
            })}
            onScrollBeginDrag={() => Keyboard.dismiss()}
            getItemLayout={(data, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            contentContainerStyle={{ flexGrow: 1 }}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
          />
        </View>
      )}

      {/* 投稿ボタンまたは投稿不可メッセージ */}
      <View className="bg-white border-t border-gray-200 p-4 pb-8">
        {canPost ? (
          <Pressable
            onPress={() => router.push(`/diary/${id}/new-entry`)}
            className="bg-app-primary rounded-xl py-4 items-center flex-row justify-center"
          >
            <Text className="text-white text-base font-semibold">今日の出来事を書く</Text>
          </Pressable>
        ) : nextPostTime ? (
          <View className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <Text className="text-amber-800 text-center font-semibold mb-1">
              今日はもう投稿済みです
            </Text>
            <Text className="text-amber-600 text-sm text-center">
              次の投稿は
              {(() => {
                const diff = nextPostTime.getTime() - new Date().getTime();
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                return `${hours > 0 ? hours + '時間' : ''}${minutes > 0 ? minutes + '分' : ''}`;
              })()}
              後に可能です
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
