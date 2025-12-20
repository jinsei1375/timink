import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, Text, View } from 'react-native';

type Props = {
  imageUri: string | null;
  onPickImage: () => void;
  onRemoveImage: () => void;
};

export function ImageUploader({ imageUri, onPickImage, onRemoveImage }: Props) {
  const { t } = useTranslation();
  if (imageUri) {
    return (
      <View className="relative">
        <Image source={{ uri: imageUri }} className="w-full h-64 rounded-xl" />
        <Pressable
          onPress={onRemoveImage}
          className="absolute top-3 right-3 bg-black/50 rounded-full p-2"
        >
          <Ionicons name="close" size={20} color="white" />
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPickImage}
      className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl h-48 items-center justify-center"
    >
      <Ionicons name="image-outline" size={48} color="#9CA3AF" />
      <Text className="text-gray-500 mt-2">{t('capsule.imageUpload')}</Text>
    </Pressable>
  );
}
