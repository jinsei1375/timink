import { DiaryEntry, Profile } from '@/types';
import React from 'react';
import { Text, View } from 'react-native';

interface DiaryEntryPreviewProps {
  entry: DiaryEntry & { author: Profile };
  formatDate: (dateString: string) => string;
}

/**
 * 交換日記のエントリープレビューを表示するコンポーネント
 */
export const DiaryEntryPreview = React.memo<DiaryEntryPreviewProps>(({ entry, formatDate }) => {
  return (
    <View className="bg-gray-50 rounded-lg p-3">
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-xs font-semibold text-gray-700">
          {entry.author.display_name || '名前なし'}
        </Text>
        <Text className="text-xs text-gray-400">{formatDate(entry.created_at)}</Text>
      </View>
      <Text className="text-sm text-gray-600" numberOfLines={2}>
        {entry.content}
      </Text>
    </View>
  );
});

DiaryEntryPreview.displayName = 'DiaryEntryPreview';
