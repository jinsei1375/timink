import { MemberListModal } from '@/components/ui/MemberListModal';
import { PinBadge } from '@/components/ui/PinBadge';
import { DiaryWithDetails } from '@/services/diaryService';
import { DiaryType } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import React, { useCallback, useState } from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { DiaryEntryPreview } from './DiaryEntryPreview';

interface DiaryCardProps {
  diary: DiaryWithDetails;
  currentUserId: string;
  onPress: (diaryId: string) => void;
  onLongPress?: (diaryId: string) => void;
  formatDate: (dateString: string) => string;
}

/**
 * 交換日記カードを表示するコンポーネント
 */
export const DiaryCard = React.memo<DiaryCardProps>(
  ({ diary, currentUserId, onPress, onLongPress, formatDate }) => {
    const [showMembers, setShowMembers] = useState(false);

    const handlePress = useCallback(() => {
      onPress(diary.id);
    }, [diary.id, onPress]);

    const handleLongPress = useCallback(() => {
      if (onLongPress) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        onLongPress(diary.id);
      }
    }, [diary.id, onLongPress]);

    const getDiaryTypeLabel = () => {
      return diary.diary_type === DiaryType.Personal ? '個人' : '友達と';
    };

    return (
      <Pressable
        onPress={handlePress}
        onLongPress={handleLongPress}
        className="bg-white mb-4 rounded-2xl p-4 shadow-sm border border-gray-200 active:opacity-70"
      >
        {/* ヘッダー */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-2">
            {diary.is_pinned && <PinBadge className="mr-1.5" size={12} />}
            <Ionicons name="book-outline" size={20} color="#4B5563" />
            <Text className="text-xs font-medium text-gray-500">{getDiaryTypeLabel()}</Text>
          </View>
          {diary.unread_count > 0 && (
            <View className="bg-red-500 px-2 py-1 rounded-full">
              <Text className="text-white text-xs font-medium">{diary.unread_count}件</Text>
            </View>
          )}
        </View>

        {/* タイトル */}
        <Text className="text-lg font-bold text-gray-900 mb-2">{diary.title}</Text>

        {/* 最新エントリー */}
        {diary.latest_entry ? (
          <View className="mb-3">
            <DiaryEntryPreview entry={diary.latest_entry} formatDate={formatDate} />
          </View>
        ) : (
          <Text className="text-sm text-gray-400 mb-3">まだ投稿がありません</Text>
        )}

        {/* ステータス */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1">
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text className="text-sm text-gray-600">{formatDate(diary.updated_at)}</Text>
          </View>

          {/* メンバー数 */}
          {diary.members && diary.members.length > 0 && (
            <TouchableOpacity
              className="flex-row items-center gap-1"
              onPress={() => setShowMembers(true)}
            >
              <Ionicons name="people-outline" size={16} color="#6B7280" />
              <Text className="text-sm text-gray-600">{diary.members.length}人</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 最終更新日 */}
        <View className="mt-3 pt-3 border-t border-gray-100">
          <Text className="text-xs text-gray-500">
            最終更新:{' '}
            {new Date(diary.updated_at).toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        <MemberListModal
          visible={showMembers}
          onClose={() => setShowMembers(false)}
          members={diary.members}
          title="交換日記メンバー"
        />
      </Pressable>
    );
  }
);

DiaryCard.displayName = 'DiaryCard';
