import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useRefresh } from '@/contexts/RefreshContext';
import { DiaryService } from '@/services/diaryService';
import { RefreshEvent } from '@/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const { emit } = useRefresh();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    router.replace(`/diary/${id}`);
  };

  const handlePost = async () => {
    if (!content.trim() || !id || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await DiaryService.createEntry(id, content.trim());

      if (result.success) {
        emit(RefreshEvent.DIARY_UPDATED);
        Alert.alert(t('diary.postComplete'), t('diary.posted'), [
          {
            text: 'OK',
            onPress: handleBack,
          },
        ]);
      } else {
        Alert.alert(t('common.error'), t('diary.postError'));
      }
    } catch (error) {
      console.error(t('diary.postError'), error);
      Alert.alert(t('common.error'), t('diary.postErrorOccurred'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title={t('diary.writeEntry')} onBack={handleBack} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView className="flex-1 p-4">
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder={t('diary.placeholder')}
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
              <Text className="text-white text-base font-semibold">{t('diary.post')}</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
