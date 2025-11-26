import { PinBadge } from '@/components/ui/PinBadge';
import { DiaryWithDetails } from '@/services/diaryService';

import React, { useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { DiaryEntryPreview } from './DiaryEntryPreview';
import { MemberAvatarGroup } from './MemberAvatarGroup';

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
    const otherMembers = diary.members.filter((m) => m.id !== currentUserId);
    const memberNames = otherMembers.map((m) => m.display_name || '名前なし').join(', ');

    const handlePress = useCallback(() => {
      onPress(diary.id);
    }, [diary.id, onPress]);

    const handleLongPress = useCallback(() => {
      if (onLongPress) {
        onLongPress(diary.id);
      }
    }, [diary.id, onLongPress]);

    return (
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={handleLongPress}
        className="bg-white mb-3 rounded-2xl p-4 shadow-sm border border-gray-100"
        activeOpacity={0.7}
      >
        {/* ヘッダー部分 */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            {/* メンバーのアバター */}
            <View className="mr-3">
              <MemberAvatarGroup members={otherMembers} maxDisplay={3} size="medium" />
            </View>

            {/* タイトル */}
            <View className="flex-1">
              <View className="flex-row items-center">
                {diary.is_pinned && <PinBadge className="mr-1.5" size={12} />}
                <Text className="text-base font-bold text-gray-800 flex-1" numberOfLines={1}>
                  {diary.title}
                </Text>
              </View>
              <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={1}>
                {memberNames}
              </Text>
            </View>
          </View>

          {/* 未読バッジ */}
          {diary.unread_count > 0 && (
            <View className="bg-red-500 rounded-full w-6 h-6 items-center justify-center ml-2">
              <Text className="text-white text-xs font-bold">{diary.unread_count}</Text>
            </View>
          )}
        </View>

        {/* 最新エントリー */}
        {diary.latest_entry ? (
          <DiaryEntryPreview entry={diary.latest_entry} formatDate={formatDate} />
        ) : (
          <View className="bg-gray-50 rounded-lg p-3">
            <Text className="text-sm text-gray-400 text-center">まだ投稿がありません</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }
);

DiaryCard.displayName = 'DiaryCard';
