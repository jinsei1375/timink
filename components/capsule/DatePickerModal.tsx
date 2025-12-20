import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, Text, View } from 'react-native';

type DatePreset = {
  key: string;
  months: number;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelectPreset: (months: number) => void;
  onOpenCalendar: () => void;
};

const datePresets: DatePreset[] = [
  { key: 'oneMonth', months: 1 },
  { key: 'threeMonths', months: 3 },
  { key: 'sixMonths', months: 6 },
  { key: 'oneYear', months: 12 },
  { key: 'twoYears', months: 24 },
  { key: 'fiveYears', months: 60 },
];

export function DatePickerModal({ visible, onClose, onSelectPreset, onOpenCalendar }: Props) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-center items-center" onPress={onClose}>
        <View className="bg-white rounded-2xl p-6 m-4 w-80">
          <Text className="text-xl font-bold text-gray-900 mb-4">{t('capsule.selectDate')}</Text>
          <View className="gap-2">
            {datePresets.map((preset) => (
              <Pressable
                key={preset.key}
                onPress={() => onSelectPreset(preset.months)}
                className="bg-gray-50 p-4 rounded-xl active:bg-gray-100"
              >
                <Text className="text-base font-medium text-gray-900">
                  {t(`capsule.period.${preset.key}`)}
                </Text>
                <Text className="text-sm text-gray-600 mt-1">
                  {(() => {
                    const date = new Date();
                    date.setMonth(date.getMonth() + preset.months);
                    return date.toLocaleDateString('ja-JP');
                  })()}
                </Text>
              </Pressable>
            ))}

            {/* カスタム日付選択 */}
            <Pressable
              onPress={onOpenCalendar}
              className="bg-app-primary/10 p-4 rounded-xl border-2 border-app-primary border-dashed active:bg-app-primary/20"
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="calendar" size={20} color="#6C6EE6" />
                <Text className="text-base font-medium text-app-primary ml-2">
                  {t('capsule.selectFromCalendar')}
                </Text>
              </View>
            </Pressable>
          </View>

          <Pressable onPress={onClose} className="mt-4 p-3 rounded-xl bg-gray-100">
            <Text className="text-center text-base font-medium text-gray-700">
              {t('common.cancel')}
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
