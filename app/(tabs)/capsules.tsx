import { CapsuleCard } from '@/components/capsule/CapsuleCard';
import { CapsuleFilter } from '@/components/capsule/CapsuleFilter';
import { EmptyState } from '@/components/capsule/EmptyState';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useRefresh } from '@/contexts/RefreshContext';
import { capsuleService } from '@/services/capsuleService';
import { CapsuleStatus, CapsuleWithMembers, RefreshEvent } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  View,
} from 'react-native';

export default function CapsulesScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { subscribe } = useRefresh();
  const [capsules, setCapsules] = useState<CapsuleWithMembers[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | CapsuleStatus.Locked | CapsuleStatus.Unlocked>(
    'all'
  );

  const loadCapsules = useCallback(async () => {
    if (!user) return;

    try {
      const data = await capsuleService.getUserCapsules(user.id);
      // ピン留め順 > 作成日順 でソート
      const sortedData = data.sort((a, b) => {
        if (a.is_pinned === b.is_pinned) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return a.is_pinned ? -1 : 1;
      });
      setCapsules(sortedData);
    } catch (error) {
      console.error('Error loading capsules:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadCapsules();
  }, [loadCapsules]);

  // カプセル関連イベントを購読
  useEffect(() => {
    const unsubscribers = [
      subscribe(RefreshEvent.CAPSULE_CREATED, loadCapsules),
      subscribe(RefreshEvent.CAPSULE_UPDATED, loadCapsules),
      subscribe(RefreshEvent.CAPSULE_UNLOCKED, loadCapsules),
    ];

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [subscribe, loadCapsules]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadCapsules();
  };

  const handleCapsulePress = (capsuleId: string) => {
    router.push(`/capsule/${capsuleId}` as any);
  };

  const handleLongPress = (capsule: CapsuleWithMembers) => {
    Alert.alert(
      capsule.title,
      capsule.is_pinned ? t('capsule.unpinConfirm') : t('capsule.pinConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: capsule.is_pinned ? t('capsule.unpin') : t('capsule.pin'),
          onPress: async () => {
            if (!user) return;
            try {
              await capsuleService.togglePin(capsule.id, user.id, !!capsule.is_pinned);
              loadCapsules(); // リロード
            } catch (error) {
              console.error(error);
              Alert.alert(t('common.error'), t('capsule.pinError'));
            }
          },
        },
      ]
    );
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
        title={t('capsules.title')}
        rightElement={
          <TouchableOpacity onPress={handleCreatePress}>
            <Ionicons name="add-circle-outline" size={28} color="#6C6EE6" />
          </TouchableOpacity>
        }
      />
      <CapsuleFilter filter={filter} onFilterChange={setFilter} />
      <FlatList
        data={filteredCapsules}
        renderItem={({ item }) => (
          <CapsuleCard
            capsule={item}
            onPress={() => handleCapsulePress(item.id)}
            onLongPress={() => handleLongPress(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <EmptyState title={t('capsule.empty')} description={t('capsule.emptyDescription')} />
        }
      />
    </View>
  );
}
