import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface DiaryPostFormProps {
  onSubmit: (content: string) => Promise<void>;
  canPost: boolean;
  nextPostTime?: Date | null;
  maxLength?: number;
}

/**
 * 交換日記の投稿フォーム
 * 1日1回制限を考慮した入力フォーム
 */
export const DiaryPostForm = React.memo<DiaryPostFormProps>(
  ({ onSubmit, canPost, nextPostTime, maxLength = 500 }) => {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = useCallback(async () => {
      if (!content.trim() || !canPost || isSubmitting) return;

      setIsSubmitting(true);
      try {
        await onSubmit(content.trim());
        setContent(''); // 投稿成功後にクリア
      } catch (error) {
        console.error('投稿エラー:', error);
      } finally {
        setIsSubmitting(false);
      }
    }, [content, canPost, isSubmitting, onSubmit]);

    // 投稿不可の場合のメッセージ
    if (!canPost && nextPostTime) {
      const now = new Date();
      const diff = nextPostTime.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      return (
        <View className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mx-4 mb-4">
          <Text className="text-amber-800 text-center font-semibold mb-1">
            今日はもう投稿済みです
          </Text>
          <Text className="text-amber-600 text-sm text-center">
            次の投稿は{hours > 0 ? `${hours}時間` : ''}
            {minutes > 0 ? `${minutes}分` : ''}後に可能です
          </Text>
        </View>
      );
    }

    return (
      <View className="bg-white border-t border-gray-200 p-4">
        {/* テキスト入力 */}
        <View className="bg-gray-50 rounded-2xl p-4 mb-3">
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="今日の出来事を書いてみよう..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            maxLength={maxLength}
            className="text-base text-gray-800 min-h-[100px]"
            textAlignVertical="top"
            editable={!isSubmitting}
          />
        </View>

        {/* 文字数カウントと投稿ボタン */}
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-gray-400">
            {content.length}/{maxLength}文字
          </Text>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className={`px-6 py-3 rounded-full flex-row items-center ${
              content.trim() && !isSubmitting ? 'bg-app-primary' : 'bg-gray-300'
            }`}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text className="text-white font-semibold ml-2">投稿中...</Text>
              </>
            ) : (
              <Text className="text-white font-semibold">投稿する</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

DiaryPostForm.displayName = 'DiaryPostForm';
