import { InfoBox } from '@/components/ui/InfoBox';
import { CapsuleType } from '@/types';
import { Ionicons } from '@expo/vector-icons';
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
  const getCapsuleTypeLabel = () => {
    switch (capsuleType) {
      case CapsuleType.Personal:
        return '個人';
      case CapsuleType.OneToOne:
        return '1対1';
      case CapsuleType.Group:
        return 'グループ';
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
            カプセルを作成しますか？
          </Text>

          {/* カプセル情報 */}
          <View className="bg-gray-50 rounded-xl p-4 mb-4">
            <View className="flex-row items-center mb-3">
              <Ionicons name="document-text-outline" size={20} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-2 flex-1">タイトル</Text>
            </View>
            <Text className="text-base font-semibold text-gray-900 mb-4">{title}</Text>

            <View className="flex-row items-center mb-3">
              <Ionicons name="people-outline" size={20} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-2">タイプ</Text>
            </View>
            <Text className="text-base font-semibold text-gray-900 mb-4">
              {getCapsuleTypeLabel()}
              {capsuleType !== 'personal' && ` (${friendCount}人)`}
            </Text>

            <View className="flex-row items-center mb-3">
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-2">開封日</Text>
            </View>
            <Text className="text-base font-semibold text-gray-900">
              {unlockDate.toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>

          {/* 注意事項 */}
          <InfoBox
            type="warning"
            title="注意事項"
            message={`• 作成後、日付は変更できません\n• 開封日以前は他の人の内容は見れません\n• 開封日になると自動的に開封されます`}
          />

          <View className="gap-2 mt-6">
            <Pressable onPress={onConfirm} className="p-4 rounded-xl bg-app-primary">
              <Text className="text-center text-base font-semibold text-white">作成する</Text>
            </Pressable>

            <Pressable onPress={onCancel} className="p-4 rounded-xl bg-gray-100">
              <Text className="text-center text-base font-medium text-gray-700">キャンセル</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
