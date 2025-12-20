import { IconSymbol } from '@/components/ui/icon-symbol';
import { Activity, ActivityType } from '@/types';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

interface ActivityCardProps {
  activity: Activity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const handlePress = () => {
    if (!activity.actionable) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    switch (activity.type) {
      case ActivityType.CapsuleUnlockable:
      case ActivityType.CapsulePending:
        router.push(`/capsule/${activity.data.capsuleId}` as any);
        break;
      case ActivityType.DiaryAvailable:
      case ActivityType.DiaryMemory:
        router.push(`/diary/${activity.data.diaryId}` as any);
        break;
      case ActivityType.FriendRequest:
        router.push('/(tabs)/friends');
        break;
    }
  };

  const getIcon = (): any => {
    switch (activity.type) {
      case ActivityType.CapsuleUnlockable:
      case ActivityType.CapsulePending:
        return 'hourglass.fill'; // タイムカプセルタブと同じ
      case ActivityType.DiaryAvailable:
      case ActivityType.DiaryMemory:
        return 'book.fill'; // 交換日記タブと同じ
      case ActivityType.FriendRequest:
        return 'person.2.fill'; // 友達タブと同じ
      default:
        return 'bell.fill';
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100 active:opacity-80"
    >
      <View className="flex-row items-start">
        {/* アイコン */}
        <View className="w-12 h-12 bg-indigo-50 rounded-full items-center justify-center mr-3">
          <IconSymbol name={getIcon()} size={24} color="#6C6EE6" />
        </View>

        {/* コンテンツ */}
        <View className="flex-1">
          <Text className="font-bold text-gray-800 text-base mb-1">
            {t(activity.titleKey, activity.params)}
          </Text>
          <Text className="text-sm text-gray-600" numberOfLines={2}>
            {t(activity.descriptionKey, activity.params)}
          </Text>
          {activity.timestampKey && (
            <Text className="text-xs text-gray-400 mt-1">
              {t(activity.timestampKey, activity.timestampParams)}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}
