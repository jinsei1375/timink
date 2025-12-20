import { InfoBox } from '@/components/ui/InfoBox';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function EditConfirmModal({ visible, onConfirm, onCancel }: Props) {
  const { t } = useTranslation();

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
              {t('capsule.saveConfirm')}
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-base text-gray-700 text-center mb-4">
              {t('capsule.saveNotice')}
            </Text>
            <InfoBox
              type="danger"
              title={t('capsule.important')}
              message={t('capsule.saveWarning')}
            />
          </View>

          <View className="gap-2">
            <Pressable onPress={onConfirm} className="p-4 rounded-xl bg-app-primary">
              <Text className="text-center text-base font-semibold text-white">
                {t('capsule.saveButton')}
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
