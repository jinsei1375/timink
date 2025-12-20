import { ActivityCard } from '@/components/home/ActivityCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useRefresh } from '@/contexts/RefreshContext';
import { ActivityService } from '@/services/activityService';
import { ActivitySection, RefreshEvent } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HomeScreen() {
  const { t } = useTranslation();
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
      <ScreenHeader title={t('home.title')} />

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
                {t('home.noActivity')}
              </Text>
              <Text className="text-gray-400 text-sm mt-2 text-center">
                {t('home.noActivityDescription')}
              </Text>
              <View className="flex-row gap-3 w-full mt-4">
                <TouchableOpacity
                  onPress={() => router.push('/capsule/create')}
                  className="flex-1 bg-indigo-100 py-4 rounded-xl items-center"
                >
                  <Ionicons name="hourglass" size={24} color="#6C6EE6" />
                  <Text className="text-indigo-700 font-semibold mt-1">
                    {t('home.createCapsule')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push('/diary/create')}
                  className="flex-1 bg-indigo-100 py-4 rounded-xl items-center"
                >
                  <Ionicons name="book" size={24} color="#6C6EE6" />
                  <Text className="text-indigo-700 font-semibold mt-1">{t('home.startDiary')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              {sections.map((section, index) => (
                <View key={`section-${index}`} className="mb-6">
                  <Text className="text-lg font-bold text-gray-800 mb-3">
                    {t(section.titleKey)}
                  </Text>
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
