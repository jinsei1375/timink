import { Text, TextInput, View } from 'react-native';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  maxLength?: number;
};

export function ContentTextArea({ value, onChangeText, maxLength = 1000 }: Props) {
  return (
    <View className="mb-6">
      <Text className="text-gray-700 font-semibold mb-2">メッセージ</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="未来の自分や仲間へのメッセージを書きましょう..."
        placeholderTextColor="#9CA3AF"
        multiline
        numberOfLines={8}
        textAlignVertical="top"
        maxLength={maxLength}
        className="bg-gray-50 rounded-xl p-4 text-gray-900 min-h-[150px]"
      />
      <Text className="text-gray-500 text-xs mt-2">
        {value.length} / {maxLength}文字
      </Text>
    </View>
  );
}
