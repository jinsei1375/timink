import { DiaryPageView } from '@/components/diary/DiaryPageView';
import { DiaryPostForm } from '@/components/diary/DiaryPostForm';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { DiaryService } from '@/services/diaryService';
import { DiaryEntry, Profile } from '@/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Text,
  TouchableOpacity,
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
  const flatListRef = useRef<FlatList<DiaryEntry & { author: Profile }>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const [diary, setDiary] = useState<DiaryDetail | null>(null);
  const [entries, setEntries] = useState<(DiaryEntry & { author: Profile })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canPost, setCanPost] = useState(false);
  const [nextPostTime, setNextPostTime] = useState<Date | null>(null);

  const loadDiaryData = async () => {
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
  };

  useEffect(() => {
    loadDiaryData();
  }, [id]);

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

  const handlePost = useCallback(
    async (content: string) => {
      if (!id) return;

      const result = await DiaryService.createEntry(id, content);

      if (result.success) {
        // Realtimeが有効な場合は自動的に追加されるので手動リロードは不要
        // ただし、念のため重複チェック付きで再取得
        // （Realtimeが遅延する場合のフォールバック）
        setTimeout(async () => {
          const entriesResult = await DiaryService.getDiaryEntries(id);
          if (entriesResult.success) {
            // 重複を排除して設定
            setEntries((prevEntries) => {
              const existingIds = new Set(prevEntries.map((e) => e.id));
              const newEntries = entriesResult.data.filter((e) => !existingIds.has(e.id));
              return newEntries.length > 0 ? [...prevEntries, ...newEntries] : prevEntries;
            });
          }
        }, 1000); // Realtimeイベントを待つ

        // 投稿可能状態を更新
        const canPostToday = await DiaryService.canPostToday(id);
        setCanPost(canPostToday);
        if (!canPostToday) {
          const nextTime = await DiaryService.getNextPostTime(id);
          setNextPostTime(nextTime);
        }

        // 最新ページにスクロール
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 200);
      } else {
        Alert.alert('エラー', '投稿に失敗しました');
      }
    },
    [id]
  );

  const renderPage = useCallback(
    ({ item, index }: { item: DiaryEntry & { author: Profile }; index: number }) => {
      if (!profile) return null;

      // スクロール位置に基づいてアニメーション値を計算
      const inputRange = [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ];

      // ページめくりアニメーション
      const translateX = scrollX.interpolate({
        inputRange,
        outputRange: [SCREEN_WIDTH * 0.5, 0, -SCREEN_WIDTH * 0.3],
        extrapolate: 'clamp',
      });

      const scale = scrollX.interpolate({
        inputRange,
        outputRange: [0.85, 1, 0.85],
        extrapolate: 'clamp',
      });

      const opacity = scrollX.interpolate({
        inputRange,
        outputRange: [0.5, 1, 0.5],
        extrapolate: 'clamp',
      });

      const rotateY = scrollX.interpolate({
        inputRange,
        outputRange: ['45deg', '0deg', '-45deg'],
        extrapolate: 'clamp',
      });

      return (
        <Animated.View
          style={{
            width: SCREEN_WIDTH,
            transform: [{ translateX }, { scale }, { perspective: 1000 }, { rotateY }],
            opacity,
          }}
        >
          <DiaryPageView
            entry={item}
            currentUserId={profile.id}
            currentPage={index}
            totalPages={entries.length}
          />
        </Animated.View>
      );
    },
    [profile, scrollX, entries.length]
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
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View className="flex-1 bg-gradient-to-b from-gray-100 to-gray-50">
        {/* ヘッダー */}
        <View className="bg-white px-6 pt-12 pb-4 border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <IconSymbol
                name="chevron.right"
                size={24}
                color="#6C6EE6"
                style={{ transform: [{ rotate: '180deg' }] }}
              />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-800">{diary.title}</Text>
              {entries.length > 0 && (
                <Text className="text-sm text-gray-500 mt-1">
                  📖 {entries.length}ページの思い出
                </Text>
              )}
            </View>
          </View>
        </View>

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
              refreshControl={
                <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
              }
            />
          </View>
        )}

        {/* 投稿フォーム */}
        <DiaryPostForm
          onSubmit={handlePost}
          canPost={canPost}
          nextPostTime={nextPostTime}
          maxLength={500}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
