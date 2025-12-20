import { EmptyState } from '@/components/ui/EmptyState';
import { FriendSelectItem } from '@/components/ui/FriendSelectItem';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { TypeSelector } from '@/components/ui/TypeSelector';
import { useRefresh } from '@/contexts/RefreshContext';
import { DiaryService } from '@/services/diaryService';

import { FriendService } from '@/services/friendService';
import { DiaryType, Friend, RefreshEvent } from '@/types';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function CreateDiaryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { emit } = useRefresh();
  const [title, setTitle] = useState('');
  const [diaryType, setDiaryType] = useState<DiaryType>(DiaryType.Personal);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const handleBack = () => {
    router.replace('/(tabs)/diaries');
  };

  // 画面から離れるときにフォームをリセット
  useFocusEffect(
    useCallback(() => {
      return () => {
        setTitle('');
        setDiaryType(DiaryType.Personal);
        setSelectedFriends([]);
      };
    }, [])
  );

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

    if (diaryType === DiaryType.WithFriends && selectedFriends.length === 0) {
      Alert.alert('エラー', '少なくとも1人の友達を選択してください');
      return;
    }

    setIsCreating(true);

    try {
      const result = await DiaryService.createDiary(title, selectedFriends, diaryType);

      if (result.success) {
        emit(RefreshEvent.DIARY_CREATED);
        Alert.alert('作成完了', '交換日記を作成しました', [
          {
            text: 'OK',
            onPress: () => router.replace(`/diary/${result.data.id}` as any),
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
        onAction={() => router.push('/friend/add')}
      />
    ),
    [router]
  );

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#6C6EE6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* ヘッダー */}
      <ScreenHeader title={t('diary.createTitle')} onBack={handleBack} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <View className="flex-1 px-6">
          {/* タイトル入力 */}
          <View className="py-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">タイトル</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="例: 大学時代の思い出"
              placeholderTextColor="#9CA3AF"
              className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900"
              maxLength={50}
            />
            <Text className="text-xs text-gray-400 mt-1 text-right">{title.length}/50</Text>
          </View>

          <TypeSelector
            label="日記タイプ"
            options={[
              {
                value: DiaryType.Personal,
                icon: 'person-outline',
                title: '個人',
                description: '自分だけの日記',
              },
              {
                value: DiaryType.WithFriends,
                icon: 'people-outline',
                title: '友達と',
                description: '友達と交換日記',
              },
            ]}
            selectedType={diaryType}
            onSelect={(type) => {
              setDiaryType(type);
              if (type === DiaryType.Personal) {
                setSelectedFriends([]);
              }
            }}
          />

          {/* 友達選択 */}
          {diaryType === DiaryType.WithFriends && (
            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                友達を選択 ({selectedFriends.length}人選択中)
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
          )}
        </View>

        {/* 作成ボタン */}
        <View className="p-4 border-t border-gray-100 bg-gray-50">
          <Pressable
            onPress={handleCreate}
            disabled={
              isCreating ||
              !title.trim() ||
              (diaryType === DiaryType.WithFriends && selectedFriends.length === 0)
            }
            className={`w-full py-4 rounded-xl flex-row items-center justify-center ${
              isCreating ||
              !title.trim() ||
              (diaryType === DiaryType.WithFriends && selectedFriends.length === 0)
                ? 'bg-gray-300'
                : 'bg-app-primary'
            }`}
          >
            {isCreating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">作成</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
