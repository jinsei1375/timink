import { Text, View } from 'react-native';

export default function DiariesScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-gray-800">交換日記一覧</Text>
      <Text className="mt-4 text-gray-600">あなたの交換日記がここに表示されます</Text>
    </View>
  );
}
