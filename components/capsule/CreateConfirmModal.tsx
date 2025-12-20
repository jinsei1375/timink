import { InfoBox } from '@/components/ui/InfoBox';
import { CapsuleType } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  title: string;
  capsuleType: CapsuleType;
  unlockDate: Date;
  friendCount: number;
  onConfirm: () => void;
  onCancel: () => void;
};

export function CreateConfirmModal({
  visible,
  title,
  capsuleType,
  unlockDate,
  friendCount,
  onConfirm,
  onCancel,
}: Props) {
  const { t } = useTranslation();

  const getCapsuleTypeLabel = () => {
    switch (capsuleType) {
      case CapsuleType.Personal:
        return t('capsule.type.personal');
      case CapsuleType.WithFriends:
        return t('capsule.type.withFriends');
      default:
        return '';
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable className="flex-1 bg-black/50 justify-center items-center" onPress={onCancel}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl p-6 m-4 max-w-sm w-full"
        >
          <Text className="text-xl font-bold text-gray-900 mb-4 text-center">
            {t('capsule.createConfirm')}
          </Text>

          {/* カプセル情報 */}
          <View className="bg-gray-50 rounded-xl p-4 mb-4">
            <View className="flex-row items-center mb-3">
              <Ionicons name="document-text-outline" size={20} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-2 flex-1">{t('common.noTitle')}</Text>
            </View>
            <Text className="text-base font-semibold text-gray-900 mb-4">{title}</Text>

            <View className="flex-row items-center mb-3">
              <Ionicons name="people-outline" size={20} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-2">{t('capsule.type.personal')}</Text>
            </View>
            <Text className="text-base font-semibold text-gray-900 mb-4">
              {getCapsuleTypeLabel()}
              {capsuleType !== 'personal' &&
                ` (${t('capsule.membersCount', { count: friendCount })})`}
            </Text>

            <View className="flex-row items-center mb-3">
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-2">{t('capsule.unlockDate')}</Text>
            </View>
            <Text className="text-base font-semibold text-gray-900">
              {unlockDate.toLocaleDateString('ja-JP')}
            </Text>
          </View>

          {/* 注意事項 */}
          <InfoBox type="warning" title={t('capsule.notice')} message={t('capsule.createNotice')} />

          <View className="gap-2 mt-6">
            <Pressable onPress={onConfirm} className="p-4 rounded-xl bg-app-primary">
              <Text className="text-center text-base font-semibold text-white">
                {t('capsule.createButton')}
              </Text>
            </Pressable>

            <Pressable onPress={onCancel} className="p-4 rounded-xl bg-gray-100">
              <Text className="text-center text-base font-medium text-gray-700">
                {t('common.cancel')}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
