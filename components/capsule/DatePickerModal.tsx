import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, Text, View } from 'react-native';

type DatePreset = {
  label: string;
  months: number;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelectPreset: (months: number) => void;
  onOpenCalendar: () => void;
};

const datePresets: DatePreset[] = [
  { label: '1ヶ月後', months: 1 },
  { label: '3ヶ月後', months: 3 },
  { label: '6ヶ月後', months: 6 },
  { label: '1年後', months: 12 },
  { label: '2年後', months: 24 },
  { label: '5年後', months: 60 },
];

export function DatePickerModal({ visible, onClose, onSelectPreset, onOpenCalendar }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-center items-center" onPress={onClose}>
        <View className="bg-white rounded-2xl p-6 m-4 w-80">
          <Text className="text-xl font-bold text-gray-900 mb-4">開封日を選択</Text>
          <View className="gap-2">
            {datePresets.map((preset) => (
              <Pressable
                key={preset.label}
                onPress={() => onSelectPreset(preset.months)}
                className="bg-gray-50 p-4 rounded-xl active:bg-gray-100"
              >
                <Text className="text-base font-medium text-gray-900">{preset.label}</Text>
                <Text className="text-sm text-gray-600 mt-1">
                  {(() => {
                    const date = new Date();
                    date.setMonth(date.getMonth() + preset.months);
                    return date.toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    });
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
                  カレンダーから選択
                </Text>
              </View>
            </Pressable>
          </View>

          <Pressable onPress={onClose} className="mt-4 p-3 rounded-xl bg-gray-100">
            <Text className="text-center text-base font-medium text-gray-700">キャンセル</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
