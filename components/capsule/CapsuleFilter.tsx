import { CapsuleStatus } from '@/types';
import { Pressable, Text, View } from 'react-native';

type FilterType = 'all' | CapsuleStatus.Locked | CapsuleStatus.Unlocked;

type Props = {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
};

export function CapsuleFilter({ filter, onFilterChange }: Props) {
  return (
    <View className="px-4 py-4 bg-gray-50">
      <View className="flex-row gap-2">
        <Pressable
          onPress={() => onFilterChange('all')}
          className={`px-4 py-2 rounded-full border ${
            filter === 'all' ? 'bg-app-primary border-app-primary' : 'bg-white border-gray-200'
          }`}
        >
          <Text
            className={`text-sm font-medium ${filter === 'all' ? 'text-white' : 'text-gray-600'}`}
          >
            すべて
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onFilterChange(CapsuleStatus.Locked)}
          className={`px-4 py-2 rounded-full border ${
            filter === CapsuleStatus.Locked
              ? 'bg-app-primary border-app-primary'
              : 'bg-white border-gray-200'
          }`}
        >
          <Text
            className={`text-sm font-medium ${
              filter === CapsuleStatus.Locked ? 'text-white' : 'text-gray-600'
            }`}
          >
            ロック中
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onFilterChange(CapsuleStatus.Unlocked)}
          className={`px-4 py-2 rounded-full border ${
            filter === CapsuleStatus.Unlocked
              ? 'bg-app-primary border-app-primary'
              : 'bg-white border-gray-200'
          }`}
        >
          <Text
            className={`text-sm font-medium ${
              filter === CapsuleStatus.Unlocked ? 'text-white' : 'text-gray-600'
            }`}
          >
            開封済み
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
