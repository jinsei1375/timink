import { InfoBox } from '@/components/ui/InfoBox';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useAuth } from '@/contexts/AuthContext';
import { capsuleService } from '@/services/capsuleService';
import { CapsuleWithMembers } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function EditCapsuleInfoScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [capsule, setCapsule] = useState<CapsuleWithMembers | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleBack = () => {
    router.replace(`/capsule/${id}`);
  };

  useEffect(() => {
    if (id && user) {
      loadData();
    }
  }, [id, user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const capsuleData = await capsuleService.getCapsuleById(id);

      if (capsuleData) {
        setCapsule(capsuleData);
        setTitle(capsuleData.title);
        setDescription(capsuleData.description || '');
      }
    } catch (error) {
      console.error('Error loading capsule:', error);
      Alert.alert(t('common.error'), t('capsule.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert(t('common.error'), t('capsule.titleRequired'));
      return;
    }

    try {
      setSaving(true);

      await capsuleService.updateCapsuleInfo(id, {
        title: title.trim(),
        description: description.trim() || undefined,
      });

      Alert.alert(t('capsule.saveComplete'), t('capsule.infoUpdated'), [
        {
          text: 'OK',
          onPress: handleBack,
        },
      ]);
    } catch (error) {
      console.error('Error updating capsule:', error);
      Alert.alert(t('common.error'), t('capsule.infoUpdateError'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#6C6EE6" />
      </View>
    );
  }

  if (!capsule) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-6">
        <Ionicons name="alert-circle-outline" size={64} color="#9CA3AF" />
        <Text className="text-gray-500 text-center mt-4">{t('capsule.notFound')}</Text>
      </View>
    );
  }

  // オーナーでない場合は編集不可
  if (capsule.created_by !== user?.id) {
    return (
      <View className="flex-1 bg-white">
        <View className="bg-app-primary p-6 pb-4">
          <View className="flex-row items-center justify-between">
            <Pressable onPress={handleBack}>
              <Ionicons name="close" size={28} color="white" />
            </Pressable>
            <Text className="text-white text-lg font-bold">{t('capsule.editInfo')}</Text>
            <View style={{ width: 28 }} />
          </View>
        </View>

        <View className="flex-1 items-center justify-center p-6">
          <View className="bg-red-50 rounded-full p-6 mb-4">
            <Ionicons name="lock-closed" size={48} color="#DC2626" />
          </View>
          <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
            {t('capsule.cannotEdit')}
          </Text>
          <Text className="text-base text-gray-600 text-center mb-6">
            {t('capsule.noPermission')}
          </Text>
          <Pressable onPress={handleBack} className="bg-app-primary px-8 py-3 rounded-xl">
            <Text className="text-white font-semibold">{t('common.back')}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* ヘッダー */}
      <ScreenHeader title={t('capsule.editInfo')} onBack={handleBack} />

      {/* コンテンツ */}
      <ScrollView className="flex-1 p-6">
        {/* タイトル */}
        <View className="mb-6">
          <Text className="text-gray-700 font-semibold mb-2">
            {t('capsule.title')} <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={t('capsule.titlePlaceholder')}
            className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-base"
            maxLength={50}
          />
          <Text className="text-gray-400 text-sm mt-1 text-right">{title.length}/50</Text>
        </View>

        {/* 説明文 */}
        <View className="mb-6">
          <Text className="text-gray-700 font-semibold mb-2">{t('capsule.description')}</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder={t('capsule.descriptionOptional')}
            className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-base"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={200}
          />
          <Text className="text-gray-400 text-sm mt-1 text-right">{description.length}/200</Text>
        </View>

        {/* 注意事項 */}
        <InfoBox
          type="info"
          title={t('capsule.editAbout')}
          message={t('capsule.editAboutMessage')}
        />
      </ScrollView>

      {/* 保存ボタン */}
      <View className="bg-white border-t border-gray-200 p-4">
        <Pressable
          onPress={handleSave}
          disabled={saving}
          className={`rounded-xl py-4 items-center ${saving ? 'bg-gray-400' : 'bg-app-primary'}`}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-base font-semibold">{t('capsule.saveChanges')}</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
