import { ActivityCard } from '@/components/home/ActivityCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useAuth } from '@/contexts/AuthContext';
import { RefreshEvent, useRefresh } from '@/contexts/RefreshContext';
import { ActivityService } from '@/services/activityService';
import { ActivitySection } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { subscribe } = useRefresh();
  const [sections, setSections] = useState<ActivitySection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadActivities = useCallback(async () => {
    if (!user || !profile) return;

    try {
      const data = await ActivityService.getHomeActivities(user.id, profile.id);
      setSections(data);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user, profile]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  // イベント購読で必要な時だけリロード
  useEffect(() => {
    const unsubscribers = [
      subscribe(RefreshEvent.CAPSULE_CREATED, loadActivities),
      subscribe(RefreshEvent.CAPSULE_UPDATED, loadActivities),
      subscribe(RefreshEvent.CAPSULE_UNLOCKED, loadActivities),
      subscribe(RefreshEvent.DIARY_CREATED, loadActivities),
      subscribe(RefreshEvent.DIARY_UPDATED, loadActivities),
      subscribe(RefreshEvent.FRIEND_ADDED, loadActivities),
      subscribe(RefreshEvent.FRIEND_ACCEPTED, loadActivities),
    ];

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [subscribe, loadActivities]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadActivities();
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title="ホーム" />

      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        <View className="px-6 py-4">
          {/* アクティビティフィード */}
          {sections.length === 0 ? (
            <View className="bg-gray-50 rounded-xl p-8 items-center">
              <IconSymbol name="bell.fill" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 mt-4 text-center font-semibold">
                新しいアクティビティはありません
              </Text>
              <Text className="text-gray-400 text-sm mt-2 text-center">
                交換日記やタイムカプセルの{'\n'}新着情報がここに表示されます
              </Text>
              <View className="flex-row gap-3 w-full mt-4">
                <TouchableOpacity
                  onPress={() => router.push('/capsule/create')}
                  className="flex-1 bg-indigo-100 py-4 rounded-xl items-center"
                >
                  <Ionicons name="hourglass" size={24} color="#6C6EE6" />
                  <Text className="text-indigo-700 font-semibold mt-1">カプセル作成</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push('/diary/create')}
                  className="flex-1 bg-indigo-100 py-4 rounded-xl items-center"
                >
                  <Ionicons name="book" size={24} color="#6C6EE6" />
                  <Text className="text-indigo-700 font-semibold mt-1">日記を始める</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              {sections.map((section, index) => (
                <View key={`section-${index}`} className="mb-6">
                  <Text className="text-lg font-bold text-gray-800 mb-3">{section.title}</Text>
                  {section.activities.map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} />
                  ))}
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
