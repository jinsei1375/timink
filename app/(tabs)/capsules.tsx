import { CapsuleCard } from '@/components/capsule/CapsuleCard';
import { EmptyState } from '@/components/capsule/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { capsuleService } from '@/services/capsuleService';
import { CapsuleWithMembers } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';

export default function CapsulesScreen() {
  const { user } = useAuth();
  const [capsules, setCapsules] = useState<CapsuleWithMembers[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'locked' | 'unlocked'>('all');

  const loadCapsules = async () => {
    if (!user) return;

    try {
      const data = await capsuleService.getUserCapsules(user.id);
      setCapsules(data);
    } catch (error) {
      console.error('Error loading capsules:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCapsules();
  }, [user]);

  // 画面がフォーカスされた時にリロード（削除後などに対応）
  useFocusEffect(
    useCallback(() => {
      if (user && !loading) {
        loadCapsules();
      }
    }, [user])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadCapsules();
  };

  const handleCapsulePress = (capsuleId: string) => {
    router.push(`/capsule/${capsuleId}` as any);
  };

  const handleCreatePress = () => {
    router.push('/(tabs)/create-capsule' as any);
  };

  const filteredCapsules = capsules.filter((capsule) => {
    if (filter === 'all') return true;
    if (filter === 'locked') return capsule.status === 'locked';
    if (filter === 'unlocked') return capsule.status === 'unlocked';
    return true;
  });

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* ヘッダー */}
      <View className="bg-white border-b border-gray-200 px-6 pt-12 pb-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-gray-900">タイムカプセル</Text>
          <Pressable
            onPress={handleCreatePress}
            className="bg-app-primary rounded-full p-2 active:opacity-70"
          >
            <Ionicons name="add" size={24} color="white" />
          </Pressable>
        </View>

        {/* フィルター */}
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => setFilter('all')}
            className={`px-4 py-2 rounded-full ${
              filter === 'all' ? 'bg-app-primary' : 'bg-gray-100'
            }`}
          >
            <Text
              className={`text-sm font-medium ${filter === 'all' ? 'text-white' : 'text-gray-700'}`}
            >
              すべて
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setFilter('locked')}
            className={`px-4 py-2 rounded-full ${
              filter === 'locked' ? 'bg-app-primary' : 'bg-gray-100'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                filter === 'locked' ? 'text-white' : 'text-gray-700'
              }`}
            >
              ロック中
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setFilter('unlocked')}
            className={`px-4 py-2 rounded-full ${
              filter === 'unlocked' ? 'bg-app-primary' : 'bg-gray-100'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                filter === 'unlocked' ? 'text-white' : 'text-gray-700'
              }`}
            >
              開封済み
            </Text>
          </Pressable>
        </View>
      </View>

      {/* カプセル一覧 */}
      {filteredCapsules.length === 0 ? (
        <ScrollView
          contentContainerStyle={{ flex: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          <EmptyState
            iconName="cube-outline"
            title="カプセルがありません"
            description="右上の + ボタンから新しいタイムカプセルを作成しましょう"
          />
        </ScrollView>
      ) : (
        <FlatList
          data={filteredCapsules}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CapsuleCard capsule={item} onPress={() => handleCapsulePress(item.id)} />
          )}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        />
      )}
    </View>
  );
}
