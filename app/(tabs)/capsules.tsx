import { CapsuleCard } from '@/components/capsule/CapsuleCard';
import { EmptyState } from '@/components/capsule/EmptyState';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useAuth } from '@/contexts/AuthContext';
import { capsuleService } from '@/services/capsuleService';
import { CapsuleStatus, CapsuleWithMembers } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function CapsulesScreen() {
  const { user } = useAuth();
  const [capsules, setCapsules] = useState<CapsuleWithMembers[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | CapsuleStatus.Locked | CapsuleStatus.Unlocked>(
    'all'
  );

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
    router.push('/capsule/create');
  };

  const filteredCapsules = capsules.filter((capsule) => {
    if (filter === 'all') return true;
    if (filter === CapsuleStatus.Locked) return capsule.status === CapsuleStatus.Locked;
    if (filter === CapsuleStatus.Unlocked) return capsule.status === CapsuleStatus.Unlocked;
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
      <ScreenHeader
        title="タイムカプセル"
        rightElement={
          <TouchableOpacity onPress={handleCreatePress}>
            <Ionicons name="add-circle-outline" size={28} color="#6C6EE6" />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={filteredCapsules}
        renderItem={({ item }) => (
          <CapsuleCard capsule={item} onPress={() => handleCapsulePress(item.id)} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListHeaderComponent={
          <View className="flex-row gap-2 mb-4">
            <Pressable
              onPress={() => setFilter('all')}
              className={`px-4 py-2 rounded-full border ${
                filter === 'all' ? 'bg-app-primary border-app-primary' : 'bg-white border-gray-200'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  filter === 'all' ? 'text-white' : 'text-gray-600'
                }`}
              >
                すべて
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setFilter(CapsuleStatus.Locked)}
              className={`px-4 py-2 rounded-full border ${
                filter === CapsuleStatus.Locked
                  ? 'bg-app-primary border-app-primary'
                  : 'bg-white border-gray-200'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  filter === CapsuleStatus.Locked ? 'text-white' : 'text-gray-600'
                }`}
              >
                ロック中
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setFilter(CapsuleStatus.Unlocked)}
              className={`px-4 py-2 rounded-full border ${
                filter === CapsuleStatus.Unlocked
                  ? 'bg-app-primary border-app-primary'
                  : 'bg-white border-gray-200'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  filter === CapsuleStatus.Unlocked ? 'text-white' : 'text-gray-600'
                }`}
              >
                開封済み
              </Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title="タイムカプセルがありません"
            description="新しいタイムカプセルを作成して、未来の自分や友達にメッセージを送りましょう"
          />
        }
      />
    </View>
  );
}
