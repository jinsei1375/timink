import { MemberListModal } from '@/components/ui/MemberListModal';
import { PinBadge } from '@/components/ui/PinBadge';
import { capsuleService } from '@/services/capsuleService';

import { CapsuleStatus, CapsuleType, CapsuleWithMembers } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';

interface CapsuleCardProps {
  capsule: CapsuleWithMembers;
  onPress: () => void;
  onLongPress?: () => void;
}

export function CapsuleCard({ capsule, onPress, onLongPress }: CapsuleCardProps) {
  const [showMembers, setShowMembers] = useState(false);
  const timeRemaining = capsuleService.getTimeUntilUnlock(capsule.unlock_at);
  const isLocked = capsule.status === CapsuleStatus.Locked;

  const getCapsuleTypeLabel = () => {
    switch (capsule.capsule_type) {
      case CapsuleType.Personal:
        return '個人';
      case CapsuleType.WithFriends:
        return '友達と';
      default:
        return '';
    }
  };

  const getTimeRemainingText = () => {
    if (capsule.status === CapsuleStatus.Unlocked) {
      return '開封済み';
    }

    if (timeRemaining.isUnlockable) {
      return '開封可能';
    }

    const parts = [];
    if (timeRemaining.days > 0) parts.push(`${timeRemaining.days}日`);
    if (timeRemaining.hours > 0) parts.push(`${timeRemaining.hours}時間`);
    if (timeRemaining.minutes > 0 && timeRemaining.days === 0) {
      parts.push(`${timeRemaining.minutes}分`);
    }

    return parts.join(' ') + '後に開封可能';
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
            <Text className="text-xs font-medium text-gray-600">{capsule.contents_count}件</Text>
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
            <Text className="text-sm text-gray-600">{capsule.members.length}人</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 開封日 */}
      <View className="mt-3 pt-3 border-t border-gray-100">
        <Text className="text-xs text-gray-500">
          開封日:{' '}
          {new Date(capsule.unlock_at).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>

      <MemberListModal
        visible={showMembers}
        onClose={() => setShowMembers(false)}
        members={capsule.members?.map((m) => m.profile!).filter(Boolean) || []}
        title="カプセルメンバー"
      />
    </Pressable>
  );
}
