import { Text, View } from 'react-native';

export default function CapsulesScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-gray-800">タイムカプセル一覧</Text>
      <Text className="mt-4 text-gray-600">あなたのタイムカプセルがここに表示されます</Text>
    </View>
  );
}
