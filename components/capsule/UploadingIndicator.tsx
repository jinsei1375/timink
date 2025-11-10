import { ActivityIndicator, Text, View } from 'react-native';

type Props = {
  message: string;
};

export function UploadingIndicator({ message }: Props) {
  return (
    <View className="bg-app-primary/10 rounded-xl p-4 flex-row items-center">
      <ActivityIndicator size="small" color="#6C6EE6" />
      <Text className="text-app-primary ml-3">{message}</Text>
    </View>
  );
}
