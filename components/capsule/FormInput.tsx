import { Text, TextInput, View } from 'react-native';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  label: string;
  placeholder: string;
  required?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
};

export function FormInput({
  value,
  onChangeText,
  label,
  placeholder,
  required = false,
  multiline = false,
  numberOfLines = 1,
  maxLength,
}: Props) {
  return (
    <View className="mb-6">
      <Text className="text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <Text className="text-red-500">*</Text>}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        multiline={multiline}
        numberOfLines={numberOfLines}
        className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900"
        style={multiline ? { height: 80, textAlignVertical: 'top' } : undefined}
        maxLength={maxLength}
      />
    </View>
  );
}
