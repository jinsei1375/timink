import { DiaryEntry, Profile } from '@/types';
import { formatAbsoluteDate, formatDate } from '@/utils/formatDate';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { UserAvatar } from './UserAvatar';

interface DiaryPageViewProps {
  entry: DiaryEntry & { author: Profile };
  currentUserId?: string;
  currentPage?: number;
  totalPages?: number;
}

/**
 * 1ページ分の日記表示コンポーネント
 * 日記帳風のデザインで1つのエントリーを表示
 */
export const DiaryPageView = React.memo<DiaryPageViewProps>(
  ({ entry, currentUserId, currentPage, totalPages }) => {
    const isOwnEntry = entry.author_id === currentUserId;

    return (
      <View className="flex-1 px-4 py-4">
        {/* 日記の用紙風デザイン */}
        <View
          className="flex-1 bg-[#FFFEF7] rounded-2xl border-2 border-gray-200"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 10,
          }}
        >
          {/* 上部の綴じ穴風デザイン */}
          <View className="flex-row justify-around py-4 border-b border-gray-200">
            <View className="w-3 h-3 rounded-full bg-gray-300" />
            <View className="w-3 h-3 rounded-full bg-gray-300" />
            <View className="w-3 h-3 rounded-full bg-gray-300" />
          </View>

          {/* 日記コンテンツ */}
          <ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator={false}>
            {/* ヘッダー: 日付と著者 */}
            <View className="flex-row items-center justify-between mb-6 pb-4 border-b border-dashed border-gray-300">
              <View className="flex-row items-center flex-1">
                <UserAvatar user={entry.author} size="small" />
                <View className="ml-3 flex-1">
                  <Text className="text-base font-bold text-gray-800">
                    {entry.author.display_name}
                    {isOwnEntry && (
                      <Text className="text-sm text-gray-500 font-normal"> (あなた)</Text>
                    )}
                  </Text>
                  <Text className="text-xs text-gray-500">{formatDate(entry.created_at)}</Text>
                </View>
              </View>
              {/* 右端：絶対日付表示 */}
              <Text className="text-xs text-gray-400 ml-2">
                {formatAbsoluteDate(new Date(entry.created_at).toDateString())}
              </Text>
            </View>

            {/* 本文 */}
            <View className="mb-6">
              <Text
                className="text-base text-gray-800 leading-7"
                style={{
                  fontFamily: 'System',
                  lineHeight: 28,
                }}
              >
                {entry.content}
              </Text>
            </View>

            {/* 余白（スクロール用） */}
            <View className="h-12" />
          </ScrollView>

          {/* 下部装飾 */}
          <View className="px-6 py-4 border-t border-gray-200">
            <View className="flex-row items-center justify-between">
              {/* 左：ページインジケーター */}
              {currentPage !== undefined && totalPages !== undefined && (
                <View className="bg-gray-100 px-3 py-1 rounded-full">
                  <Text className="text-xs text-gray-600 font-semibold">
                    {currentPage + 1} / {totalPages}
                  </Text>
                </View>
              )}
              {/* 右：文字数 */}
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-app-primary mr-2" />
                <Text className="text-xs text-gray-400">{entry.content.length} 文字</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }
);

DiaryPageView.displayName = 'DiaryPageView';
