import { MemberListModal } from '@/components/ui/MemberListModal';
import { PinBadge } from '@/components/ui/PinBadge';
import { capsuleService } from '@/services/capsuleService';

import { CapsuleStatus, CapsuleType, CapsuleWithMembers } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';

interface CapsuleCardProps {
  capsule: CapsuleWithMembers;
  onPress: () => void;
  onLongPress?: () => void;
}

export function CapsuleCard({ capsule, onPress, onLongPress }: CapsuleCardProps) {
  const { t } = useTranslation();
  const [showMembers, setShowMembers] = useState(false);
  const timeRemaining = capsuleService.getTimeUntilUnlock(capsule.unlock_at);
  const isLocked = capsule.status === CapsuleStatus.Locked;

  const getCapsuleTypeLabel = () => {
    switch (capsule.capsule_type) {
      case CapsuleType.Personal:
        return t('capsule.type.personal');
      case CapsuleType.WithFriends:
        return t('capsule.type.withFriends');
      default:
        return '';
    }
  };

  const getTimeRemainingText = () => {
    if (capsule.status === CapsuleStatus.Unlocked) {
      return t('capsule.unlocked_status');
    }

    if (timeRemaining.isUnlockable) {
      return t('capsule.unlockable');
    }

    const parts = [];
    if (timeRemaining.days > 0) parts.push(t('capsule.days', { count: timeRemaining.days }));
    if (timeRemaining.hours > 0) parts.push(t('capsule.hours', { count: timeRemaining.hours }));
    if (timeRemaining.minutes > 0 && timeRemaining.days === 0) {
      parts.push(t('capsule.minutes', { count: timeRemaining.minutes }));
    }

    return t('capsule.unlockAfter', { time: parts.join(' ') });
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={() => {
        if (onLongPress) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          onLongPress();
        }
      }}
      className="bg-white mb-4 rounded-2xl p-4 shadow-sm border border-gray-200 active:opacity-70"
    >
      {/* ヘッダー */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          {capsule.is_pinned && <PinBadge className="mr-1.5" size={12} />}
          <Ionicons
            name={isLocked ? 'lock-closed' : 'lock-open'}
            size={20}
            color={isLocked ? '#EF4444' : '#10B981'}
          />
          <Text className="text-xs font-medium text-gray-500">{getCapsuleTypeLabel()}</Text>
        </View>
        {capsule.contents_count !== undefined && (
          <View className="bg-gray-100 px-2 py-1 rounded-full">
            <Text className="text-xs font-medium text-gray-600">
              {t('capsule.contentsCount', { count: capsule.contents_count })}
            </Text>
          </View>
        )}
      </View>

      {/* タイトル */}
      <Text className="text-lg font-bold text-gray-900 mb-2">{capsule.title}</Text>

      {/* 説明 */}
      {capsule.description && (
        <Text className="text-sm text-gray-600 mb-3" numberOfLines={2}>
          {capsule.description}
        </Text>
      )}

      {/* ステータス */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1">
          <Ionicons name="time-outline" size={16} color="#6B7280" />
          <Text
            className={`text-sm font-medium ${
              capsule.status === CapsuleStatus.Unlocked
                ? 'text-gray-500'
                : timeRemaining.isUnlockable
                  ? 'text-green-600'
                  : 'text-gray-500'
            }`}
          >
            {getTimeRemainingText()}
          </Text>
        </View>

        {/* メンバー数 */}
        {capsule.members && capsule.members.length > 0 && (
          <TouchableOpacity
            className="flex-row items-center gap-1"
            onPress={() => setShowMembers(true)}
          >
            <Ionicons name="people-outline" size={16} color="#6B7280" />
            <Text className="text-sm text-gray-600">
              {t('capsule.membersCount', { count: capsule.members.length })}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 開封日 */}
      <View className="mt-3 pt-3 border-t border-gray-100">
        <Text className="text-xs text-gray-500">
          {t('capsule.unlockDate')}: {new Date(capsule.unlock_at).toLocaleDateString('ja-JP')}
        </Text>
      </View>

      <MemberListModal
        visible={showMembers}
        onClose={() => setShowMembers(false)}
        members={capsule.members?.map((m) => m.profile!).filter(Boolean) || []}
        title={t('capsule.members')}
      />
    </Pressable>
  );
}
