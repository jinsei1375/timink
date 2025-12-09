import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useAuth } from '@/contexts/AuthContext';
import { RefreshEvent, useRefresh } from '@/contexts/RefreshContext';
import { DiaryService } from '@/services/diaryService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function NewEntryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const { emit } = useRefresh();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePost = async () => {
    if (!content.trim() || !id || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await DiaryService.createEntry(id, content.trim());

      if (result.success) {
        emit(RefreshEvent.DIARY_UPDATED);
        Alert.alert('投稿完了', '日記を投稿しました！', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert('エラー', '投稿に失敗しました');
      }
    } catch (error) {
      console.error('投稿エラー:', error);
      Alert.alert('エラー', '投稿中にエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title="日記を書く" onBack={() => router.back()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView className="flex-1 p-4">
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="今日の出来事を書いてみよう..."
            placeholderTextColor="#9CA3AF"
            multiline
            className="text-base text-gray-800 min-h-[200px]"
            textAlignVertical="top"
            autoFocus
          />
        </ScrollView>
        <View className="bg-white border-t border-gray-200 p-4">
          <Pressable
            onPress={handlePost}
            disabled={!content.trim() || isSubmitting}
            className={`rounded-xl py-4 items-center ${
              content.trim() && !isSubmitting ? 'bg-app-primary' : 'bg-gray-400'
            }`}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-base font-semibold">投稿する</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
