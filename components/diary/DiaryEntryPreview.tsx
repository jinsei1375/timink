import { DiaryEntry, Profile } from '@/types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

interface DiaryEntryPreviewProps {
  entry: DiaryEntry & { author: Profile };
  formatDate: (dateString: string) => string;
}

/**
 * 交換日記のエントリープレビューを表示するコンポーネント
 */
export const DiaryEntryPreview = React.memo<DiaryEntryPreviewProps>(({ entry, formatDate }) => {
  const { t } = useTranslation();
  return (
    <View className="bg-gray-50 rounded-lg p-3">
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-sm font-semibold text-gray-900">
          {entry.author.display_name || t('common.noName')}
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
