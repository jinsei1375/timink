import { IconSymbol } from '@/components/ui/icon-symbol';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // TODO: アクティビティフィードのデータを再取得
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title="ホーム" />

      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        <View className="px-6 py-4">
          {/* アクティビティフィード（今後実装） */}
          <View className="bg-gray-50 rounded-xl p-8 items-center">
            <IconSymbol name="bell.fill" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 mt-4 text-center font-semibold">
              新しいアクティビティはありません
            </Text>
            <Text className="text-gray-400 text-sm mt-2 text-center">
              交換日記やタイムカプセルの{'\n'}新着情報がここに表示されます
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
