import { InfoBox } from '@/components/ui/InfoBox';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function EditConfirmModal({ visible, onConfirm, onCancel }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable className="flex-1 bg-black/50 justify-center items-center" onPress={onCancel}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl p-6 m-4 max-w-sm w-full"
        >
          <View className="items-center mb-4">
            <View className="bg-app-primary/10 rounded-full p-4 mb-3">
              <Ionicons name="create-outline" size={32} color="#6C6EE6" />
            </View>
            <Text className="text-xl font-bold text-gray-900 text-center">
              内容を保存しますか？
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-base text-gray-700 text-center mb-4">
              保存すると、この内容で確定されます。
            </Text>
            <InfoBox
              type="danger"
              title="重要"
              message={`保存後は二度と編集できません。\n内容をよく確認してから保存してください。`}
            />
          </View>

          <View className="gap-2">
            <Pressable onPress={onConfirm} className="p-4 rounded-xl bg-app-primary">
              <Text className="text-center text-base font-semibold text-white">保存する</Text>
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
