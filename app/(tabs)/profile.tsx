import { Avatar } from '@/components/ui/Avatar';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { StorageService } from '@/services/storageService';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, profile, signOut, updateProfile, refreshProfile } = useAuth();
  const { language } = useLanguage();
  const [isEditingUserId, setIsEditingUserId] = useState(false);
  const [newUserId, setNewUserId] = useState(profile?.user_id || '');
  const [isEditingDisplayName, setIsEditingDisplayName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(profile?.display_name || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const languageLabel =
    language === 'ja' ? t('settings.language.japanese') : t('settings.language.english');

  const handleNavigateLanguageSettings = () => {
    router.push('/profile/language');
  };

  const handleSignOut = () => {
    Alert.alert(t('auth.logout'), t('auth.logoutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('auth.logout'),
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (error) {
            Alert.alert(t('common.error'), t('auth.logoutError'));
          }
        },
      },
    ]);
  };

  const handleUpdateUserId = async () => {
    if (!user || !newUserId.trim()) {
      Alert.alert(t('common.error'), t('profile.userIdError'));
      return;
    }

    // バリデーション
    if (!/^[a-zA-Z0-9_]+$/.test(newUserId)) {
      Alert.alert(t('common.error'), t('profile.userIdFormatError'));
      return;
    }

    if (newUserId.length < 4 || newUserId.length > 20) {
      Alert.alert(t('common.error'), t('profile.userIdLengthError'));
      return;
    }

    try {
      setIsLoading(true);
      await updateProfile({ user_id: newUserId });
      Alert.alert(t('common.success'), t('profile.userId') + 'を更新しました');
      setIsEditingUserId(false);
    } catch (error: any) {
      console.error('❌ ユーザーID更新エラー:', error);
      Alert.alert(t('common.error'), error.message || t('profile.userId') + 'の更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDisplayName = async () => {
    if (!user || !newDisplayName.trim()) {
      Alert.alert(t('common.error'), t('profile.displayNameError'));
      return;
    }

    if (newDisplayName.length > 50) {
      Alert.alert('エラー', '表示名は50文字以内で設定してください');
      return;
    }

    try {
      setIsLoading(true);
      await updateProfile({ display_name: newDisplayName });
      Alert.alert('成功', '表示名を更新しました');
      setIsEditingDisplayName(false);
    } catch (error: any) {
      console.error('❌ 表示名更新エラー:', error);
      Alert.alert('エラー', error.message || '表示名の更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 画像ピッカーを開いてアバターを変更
   */
  const handleChangeAvatar = async () => {
    if (!user) return;

    try {
      // パーミッションをリクエスト
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('権限が必要です', '写真ライブラリへのアクセス権限を許可してください。');
        return;
      }

      // 画像を選択
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) return;

      // アップロード開始
      setIsUploadingAvatar(true);

      const newAvatarUrl = await StorageService.updateAvatar(
        user.id,
        result.assets[0].uri,
        profile?.avatar_url || null
      );

      // プロフィールを再取得して最新の状態に
      await refreshProfile();

      Alert.alert(t('common.success'), t('profile.avatarUpdated'));
    } catch (error) {
      console.error('Error changing avatar:', error);
      Alert.alert(t('common.error'), t('profile.avatarUpdateError'));
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title={t('profile.title')} />
      <ScrollView className="flex-1 p-6">
        <View className="items-center mt-4">
          {/* アバター */}
          <View className="relative">
            <Avatar uri={profile?.avatar_url} size={100} />
            {isUploadingAvatar && (
              <View className="absolute inset-0 bg-black/50 rounded-full items-center justify-center">
                <ActivityIndicator color="white" size="large" />
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={handleChangeAvatar}
            disabled={isUploadingAvatar}
            className={`mt-4 px-4 py-2 rounded-lg ${
              isUploadingAvatar ? 'bg-gray-400' : 'bg-blue-500'
            }`}
          >
            <Text className="text-white font-semibold">
              {isUploadingAvatar ? t('common.uploading') : t('profile.changeAvatar')}
            </Text>
          </TouchableOpacity>

          <View className="mt-8 w-full">
            <View className="bg-gray-50 p-4 rounded-lg mb-4">
              <Text className="text-sm text-gray-500 mb-2">{t('profile.userId')}</Text>
              {isEditingUserId ? (
                <View>
                  <TextInput
                    className="text-lg text-gray-800 border border-gray-300 rounded px-3 py-2 mb-2"
                    value={newUserId}
                    onChangeText={setNewUserId}
                    placeholder="ユーザーIDを入力"
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={handleUpdateUserId}
                      disabled={isLoading}
                      className="flex-1 bg-app-primary py-2 rounded"
                    >
                      <Text className="text-white text-center font-semibold">
                        {isLoading ? t('common.saving') : t('common.save')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setIsEditingUserId(false);
                        setNewUserId(profile?.user_id || '');
                      }}
                      disabled={isLoading}
                      className="flex-1 bg-gray-300 py-2 rounded"
                    >
                      <Text className="text-gray-700 text-center font-semibold">
                        {t('common.cancel')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View className="flex-row justify-between items-center">
                  <Text className="text-lg text-gray-800">{profile?.user_id || '未設定'}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setNewUserId(profile?.user_id || '');
                      setIsEditingUserId(true);
                    }}
                  >
                    <Text className="text-app-primary font-semibold">{t('common.edit')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View className="bg-gray-50 p-4 rounded-lg mb-4">
              <Text className="text-sm text-gray-500 mb-2">{t('profile.displayName')}</Text>
              {isEditingDisplayName ? (
                <View>
                  <TextInput
                    className="text-lg text-gray-800 border border-gray-300 rounded px-3 py-2 mb-2"
                    value={newDisplayName}
                    onChangeText={setNewDisplayName}
                    placeholder="表示名を入力"
                    editable={!isLoading}
                  />
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={handleUpdateDisplayName}
                      disabled={isLoading}
                      className="flex-1 bg-app-primary py-2 rounded"
                    >
                      <Text className="text-white text-center font-semibold">
                        {isLoading ? t('common.saving') : t('common.save')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setIsEditingDisplayName(false);
                        setNewDisplayName(profile?.display_name || '');
                      }}
                      disabled={isLoading}
                      className="flex-1 bg-gray-300 py-2 rounded"
                    >
                      <Text className="text-gray-700 text-center font-semibold">
                        {t('common.cancel')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View className="flex-row justify-between items-center">
                  <Text className="text-lg text-gray-800">
                    {profile?.display_name || 'No name'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setNewDisplayName(profile?.display_name || '');
                      setIsEditingDisplayName(true);
                    }}
                  >
                    <Text className="text-app-primary font-semibold">{t('common.edit')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View className="bg-gray-50 p-4 rounded-lg mb-4">
              <Text className="text-sm text-gray-500 mb-2">{t('profile.email')}</Text>
              <Text className="text-lg text-gray-800">{user?.email || 'No email'}</Text>
            </View>

            {profile?.bio && (
              <View className="bg-gray-50 p-4 rounded-lg mb-4">
                <Text className="text-sm text-gray-500 mb-2">{t('profile.bio')}</Text>
                <Text className="text-lg text-gray-800">{profile.bio}</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleNavigateLanguageSettings}
              className="bg-gray-50 p-4 rounded-lg flex-row items-center justify-between"
            >
              <View>
                <Text className="text-sm text-gray-500">{t('settings.language.title')}</Text>
                <Text className="text-lg text-gray-800 mt-1">{languageLabel}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleSignOut}
            className="mt-8 bg-red-500 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">{t('auth.logout')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
