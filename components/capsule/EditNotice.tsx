import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

export function EditNotice() {
  return (
    <View className="bg-yellow-50 rounded-xl p-4 mt-4">
      <View className="flex-row">
        <Ionicons name="information-circle" size={20} color="#F59E0B" />
        <View className="flex-1 ml-2">
          <Text className="text-yellow-800 text-sm font-semibold mb-1">注意</Text>
          <Text className="text-yellow-700 text-xs">
            • 1人1つのコンテンツのみ投稿できます{'\n'}• 保存は1度のみ可能で、保存後は編集できません
            {'\n'}• 開封日時前は自分のコンテンツのみ閲覧可能です{'\n'}• 開封後も編集はできません
          </Text>
        </View>
      </View>
    </View>
  );
}
