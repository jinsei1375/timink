import { ContentTextArea } from '@/components/capsule/ContentTextArea';
import { EditConfirmModal } from '@/components/capsule/EditConfirmModal';
import { EditHeader } from '@/components/capsule/EditHeader';
import { EditNotice } from '@/components/capsule/EditNotice';
import { ImageUploader } from '@/components/capsule/ImageUploader';
import { UploadingIndicator } from '@/components/capsule/UploadingIndicator';
import { InfoBox } from '@/components/ui/InfoBox';
import { useAuth } from '@/contexts/AuthContext';
import { capsuleService } from '@/services/capsuleService';
import { StorageService } from '@/services/storageService';
import { CapsuleContentWithAuthor, CapsuleStatus, CapsuleWithMembers } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';

export default function EditCapsuleContentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [capsule, setCapsule] = useState<CapsuleWithMembers | null>(null);
  const [content, setContent] = useState<CapsuleContentWithAuthor | null>(null);
  const [textContent, setTextContent] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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
      Alert.alert('エラー', 'データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('権限エラー', '写真ライブラリへのアクセス許可が必要です');
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
      Alert.alert('エラー', '開封済みのカプセルは編集できません');
      return;
    }

    // 既にコンテンツが存在する場合は保存不可
    if (content) {
      Alert.alert('保存不可', 'このコンテンツは既に保存されているため、編集できません。');
      return;
    }

    // テキストも画像も空の場合
    if (!textContent.trim() && !imageUri) {
      Alert.alert('エラー', 'テキストまたは画像を入力してください');
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

      Alert.alert('保存完了', 'コンテンツを保存しました', [
        {
          text: 'OK',
          onPress: () => router.replace(`/capsule/${id}` as any),
        },
      ]);
    } catch (error: any) {
      console.error('Error saving content:', error);

      if (error.message === 'EDIT_LIMIT_REACHED') {
        Alert.alert('保存不可', 'このコンテンツは既に保存されているため、編集できません。');
      } else {
        Alert.alert('エラー', 'コンテンツの保存に失敗しました');
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
        <Text className="text-gray-500 text-center mt-4">カプセルが見つかりませんでした</Text>
      </View>
    );
  }

  // 既にコンテンツが保存されている場合は編集不可
  if (content) {
    return (
      <View className="flex-1 bg-white">
        <View className="bg-app-primary p-6 pb-4">
          <View className="flex-row items-center justify-between">
            <Pressable onPress={() => router.back()}>
              <Ionicons name="close" size={28} color="white" />
            </Pressable>
            <Text className="text-white text-lg font-bold">コンテンツ編集</Text>
            <View style={{ width: 28 }} />
          </View>
        </View>

        <View className="flex-1 items-center justify-center p-6">
          <View className="bg-red-50 rounded-full p-6 mb-4">
            <Ionicons name="lock-closed" size={48} color="#DC2626" />
          </View>
          <Text className="text-xl font-bold text-gray-900 mb-2 text-center">編集できません</Text>
          <Text className="text-base text-gray-600 text-center mb-6">
            このコンテンツは既に保存されているため、{'\n'}
            編集することができません。
          </Text>
          <InfoBox
            type="danger"
            title="保存済みコンテンツについて"
            message="タイムカプセルのコンテンツは一度保存すると編集できません。タイトルや説明文は詳細画面から編集可能です。"
            icon="lock-closed"
          />
          <Pressable
            onPress={() => router.back()}
            className="bg-app-primary px-8 py-3 rounded-xl mt-6"
          >
            <Text className="text-white font-semibold">戻る</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* ヘッダー */}
      <EditHeader
        title={capsule.title}
        subtitle="開封日時まで自分の投稿のみ閲覧できます"
        onBack={() => router.back()}
        onSave={handleSaveClick}
        saving={saving || uploading}
      />

      {/* コンテンツ入力エリア */}
      <ScrollView className="flex-1 p-6">
        {/* テキスト入力 */}
        <ContentTextArea value={textContent} onChangeText={setTextContent} maxLength={1000} />

        {/* 画像アップロード */}
        <View className="mb-6">
          <Text className="text-gray-700 font-semibold mb-2">画像</Text>
          <ImageUploader imageUri={imageUri} onPickImage={pickImage} onRemoveImage={removeImage} />
        </View>

        {/* アップロード中の表示 */}
        {uploading && <UploadingIndicator message="画像をアップロード中..." />}

        {/* 注意事項 */}
        <EditNotice />
      </ScrollView>

      {/* 保存確認モーダル */}
      <EditConfirmModal
        visible={showConfirmModal}
        onConfirm={handleSave}
        onCancel={() => setShowConfirmModal(false)}
      />
    </View>
  );
}
