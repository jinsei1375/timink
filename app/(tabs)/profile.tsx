import { Text, View } from 'react-native';

export default function ProfileScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-gray-800">プロフィール</Text>
      <Text className="mt-4 text-gray-600">あなたのプロフィール情報がここに表示されます</Text>
    </View>
  );
}
