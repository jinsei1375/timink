import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { Modal, Platform, Pressable, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  value: Date;
  onChange: (date: Date) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export function CalendarPickerModal({ visible, value, onChange, onConfirm, onCancel }: Props) {
  const { t } = useTranslation();

  if (Platform.OS === 'android') {
    // Android用DateTimePicker（ネイティブダイアログ）
    return visible ? (
      <DateTimePicker
        value={value}
        mode="date"
        display="default"
        onChange={(event, selectedDate) => {
          if (event.type === 'set' && selectedDate) {
            onChange(selectedDate);
            onConfirm();
          } else {
            onCancel();
          }
        }}
        minimumDate={new Date(Date.now() + 24 * 60 * 60 * 1000)}
        textColor="#1F2937"
      />
    ) : null;
  }

  // iOS用DateTimePicker（モーダル内に表示）
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable className="flex-1 bg-black/50 justify-center items-center" onPress={onCancel}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl p-6 m-4 w-80"
        >
          <Text className="text-xl font-bold text-gray-900 mb-4 text-center">
            {t('capsule.selectDateTitle')}
          </Text>

          <View className="items-center">
            <DateTimePicker
              value={value}
              mode="date"
              display="spinner"
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  onChange(selectedDate);
                }
              }}
              minimumDate={new Date(Date.now() + 24 * 60 * 60 * 1000)}
              locale="ja-JP"
              textColor="#1F2937"
              style={{ width: 280 }}
            />
          </View>

          <View className="gap-2 mt-4">
            <Pressable onPress={onConfirm} className="p-3 rounded-xl bg-app-primary">
              <Text className="text-center text-base font-semibold text-white">
                {t('common.confirm')}
              </Text>
            </Pressable>

            <Pressable onPress={onCancel} className="p-3 rounded-xl bg-gray-100">
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
