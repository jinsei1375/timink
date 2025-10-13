import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const [isEditingUserId, setIsEditingUserId] = useState(false);
  const [newUserId, setNewUserId] = useState(profile?.user_id || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = () => {
    Alert.alert('ログアウト', 'ログアウトしますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: 'ログアウト',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (error) {
            Alert.alert('エラー', 'ログアウトに失敗しました');
          }
        },
      },
    ]);
  };

  const handleUpdateUserId = async () => {
    if (!user || !newUserId.trim()) {
      Alert.alert('エラー', 'ユーザーIDを入力してください');
      return;
    }

    // バリデーション
    if (!/^[a-zA-Z0-9_]+$/.test(newUserId)) {
      Alert.alert('エラー', 'ユーザーIDは英数字とアンダースコアのみ使用できます');
      return;
    }

    if (newUserId.length < 4 || newUserId.length > 20) {
      Alert.alert('エラー', 'ユーザーIDは4文字以上20文字以内で設定してください');
      return;
    }

    try {
      setIsLoading(true);
      await updateProfile({ user_id: newUserId });
      Alert.alert('成功', 'ユーザーIDを更新しました');
      setIsEditingUserId(false);
    } catch (error: any) {
      console.error('❌ ユーザーID更新エラー:', error);
      Alert.alert('エラー', error.message || 'ユーザーIDの更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white p-6">
      <View className="items-center mt-8">
        <Text className="text-2xl font-bold text-gray-800">プロフィール</Text>

        <View className="mt-8 w-full">
          <View className="bg-gray-50 p-4 rounded-lg mb-4">
            <Text className="text-sm text-gray-500 mb-2">ユーザーID</Text>
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
                      {isLoading ? '保存中...' : '保存'}
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
                    <Text className="text-gray-700 text-center font-semibold">キャンセル</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View className="flex-row justify-between items-center">
                <Text className="text-lg text-gray-800">{profile?.user_id || '未設定'}</Text>
                <TouchableOpacity onPress={() => setIsEditingUserId(true)}>
                  <Text className="text-app-primary font-semibold">編集</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View className="bg-gray-50 p-4 rounded-lg mb-4">
            <Text className="text-sm text-gray-500 mb-2">表示名</Text>
            <Text className="text-lg text-gray-800">{profile?.display_name || 'No name'}</Text>
          </View>

          <View className="bg-gray-50 p-4 rounded-lg mb-4">
            <Text className="text-sm text-gray-500 mb-2">メールアドレス</Text>
            <Text className="text-lg text-gray-800">{user?.email || 'No email'}</Text>
          </View>

          {profile?.bio && (
            <View className="bg-gray-50 p-4 rounded-lg mb-4">
              <Text className="text-sm text-gray-500 mb-2">自己紹介</Text>
              <Text className="text-lg text-gray-800">{profile.bio}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity onPress={handleSignOut} className="mt-8 bg-red-500 px-6 py-3 rounded-lg">
          <Text className="text-white font-semibold">ログアウト</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
