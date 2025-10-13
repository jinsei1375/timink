import { useAuth } from '@/contexts/AuthContext';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();

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

  return (
    <View className="flex-1 bg-white p-6">
      <View className="items-center mt-8">
        <Text className="text-2xl font-bold text-gray-800">プロフィール</Text>

        <View className="mt-8 w-full">
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
