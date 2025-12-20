import { ContentTextArea } from '@/components/capsule/ContentTextArea';
import { EditConfirmModal } from '@/components/capsule/EditConfirmModal';
import { EditNotice } from '@/components/capsule/EditNotice';
import { ImageUploader } from '@/components/capsule/ImageUploader';
import { UploadingIndicator } from '@/components/capsule/UploadingIndicator';
import { BackButton } from '@/components/ui/BackButton';
import { InfoBox } from '@/components/ui/InfoBox';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useRefresh } from '@/contexts/RefreshContext';
import { capsuleService } from '@/services/capsuleService';
import { StorageService } from '@/services/storageService';
import { CapsuleContentWithAuthor, CapsuleStatus, CapsuleWithMembers, RefreshEvent } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';

export default function EditCapsuleContentScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { emit } = useRefresh();
  const [capsule, setCapsule] = useState<CapsuleWithMembers | null>(null);
  const [content, setContent] = useState<CapsuleContentWithAuthor | null>(null);
  const [textContent, setTextContent] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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

      const [capsuleData, contentData] = await Promise.all([
        capsuleService.getCapsuleById(id),
        capsuleService.getUserContent(id, user!.id),
      ]);

      setCapsule(capsuleData);
      setContent(contentData);

      if (contentData) {
        setTextContent(contentData.text_content || '');
        setImageUri(contentData.media_url || null);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert(t('common.error'), t('capsule.dataLoadError'));
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('capsule.permissionError'), t('capsule.photoLibraryPermission'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const removeImage = () => {
    setImageUri(null);
  };

  const handleSaveClick = () => {
    if (!user || !capsule) return;

    // 開封済みの場合は編集不可
    if (capsule.status === CapsuleStatus.Unlocked) {
      Alert.alert(t('common.error'), t('capsule.cannotEditOpened'));
      return;
    }

    // 既にコンテンツが存在する場合は保存不可
    if (content) {
      Alert.alert(t('common.error'), t('capsule.cannotEditSaved'));
      return;
    }

    // テキストも画像も空の場合
    if (!textContent.trim() && !imageUri) {
      Alert.alert(t('common.error'), t('capsule.textOrImageRequired'));
      return;
    }

    // 確認モーダルを表示
    setShowConfirmModal(true);
  };

  const handleSave = async () => {
    if (!user || !capsule) return;

    try {
      setSaving(true);
      setShowConfirmModal(false);

      let mediaUrl = imageUri;

      // 新しい画像をアップロード
      if (imageUri && !imageUri.startsWith('http')) {
        setUploading(true);
        const fileName = `${user.id}_${Date.now()}.jpg`;
        const storagePath = `capsules/${id}/${fileName}`;
        mediaUrl = await StorageService.uploadImage(imageUri, 'capsule-media', storagePath);
        setUploading(false);
      }

      // コンテンツを作成または更新
      await capsuleService.createOrUpdateContent(id, user.id, {
        text_content: textContent.trim() || undefined,
        media_url: mediaUrl || undefined,
      });

      // イベント発火で関連画面を更新
      emit(RefreshEvent.CAPSULE_UPDATED);

      Alert.alert(t('capsule.saveComplete'), t('capsule.contentSavedMessage'), [
        {
          text: 'OK',
          onPress: handleBack,
        },
      ]);
    } catch (error: any) {
      console.error('Error saving content:', error);

      if (error.message === 'EDIT_LIMIT_REACHED') {
        Alert.alert(t('common.error'), t('capsule.cannotEditSaved'));
      } else {
        Alert.alert(t('common.error'), t('capsule.contentSaveError'));
      }
    } finally {
      setSaving(false);
      setUploading(false);
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

  // 既にコンテンツが保存されている場合は編集不可
  if (content) {
    return (
      <View className="flex-1 bg-white">
        <View className="bg-white px-6 pt-12 pb-4 border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <View style={{ width: 40 }}>
              <BackButton onPress={handleBack} />
            </View>
            <Text className="text-xl font-bold text-gray-800">{t('capsule.editContent')}</Text>
            <View style={{ width: 40 }} />
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
            {t('capsule.cannotEditSavedDetail')}
          </Text>
          <InfoBox
            type="danger"
            title={t('capsule.savedContentInfo')}
            message={t('capsule.savedContentInfoMessage')}
            icon="lock-closed"
          />
          <Pressable onPress={handleBack} className="bg-app-primary px-8 py-3 rounded-xl mt-6">
            <Text className="text-white font-semibold">{t('common.back')}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* ヘッダー */}
      <ScreenHeader title={t('capsule.editContent')} onBack={handleBack} />

      {/* コンテンツ入力エリア */}
      <ScrollView className="flex-1 p-6">
        <View className="mb-6">
          <Text className="text-gray-500 text-sm text-center">
            {capsule.title}
            {'\n'}
            {t('capsule.viewUntilUnlock')}
          </Text>
        </View>
        {/* テキスト入力 */}
        <ContentTextArea value={textContent} onChangeText={setTextContent} maxLength={1000} />

        {/* 画像アップロード */}
        <View className="mb-6">
          <Text className="text-gray-700 font-semibold mb-2">{t('capsule.image')}</Text>
          <ImageUploader imageUri={imageUri} onPickImage={pickImage} onRemoveImage={removeImage} />
        </View>

        {/* アップロード中の表示 */}
        {uploading && <UploadingIndicator message={t('capsule.uploadingImage')} />}

        {/* 注意事項 */}
        <EditNotice />
      </ScrollView>

      {/* 保存ボタン */}
      <View className="bg-white border-t border-gray-200 p-4">
        <Pressable
          onPress={handleSaveClick}
          disabled={saving || uploading}
          className={`rounded-xl py-4 items-center ${
            saving || uploading ? 'bg-gray-400' : 'bg-app-primary'
          }`}
        >
          {saving || uploading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-base font-semibold">{t('capsule.saveContent')}</Text>
          )}
        </Pressable>
      </View>

      {/* 保存確認モーダル */}
      <EditConfirmModal
        visible={showConfirmModal}
        onConfirm={handleSave}
        onCancel={() => setShowConfirmModal(false)}
      />
    </View>
  );
}
