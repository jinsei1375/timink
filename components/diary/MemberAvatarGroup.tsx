import { Avatar } from '@/components/ui/Avatar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Profile } from '@/types';
import React from 'react';
import { Text, View } from 'react-native';

interface MemberAvatarGroupProps {
  members: Profile[];
  size?: 'small' | 'medium' | 'large';
}

const SIZE_CONFIG = {
  small: { size: 32, spacing: '-space-x-1.5' },
  medium: { size: 40, spacing: '-space-x-2' },
  large: { size: 48, spacing: '-space-x-2.5' },
};

/**
 * メンバーのアバターをグループ表示するコンポーネント
 */
export const MemberAvatarGroup = React.memo<MemberAvatarGroupProps>(
  ({ members, size = 'medium' }) => {
    const config = SIZE_CONFIG[size];

    if (members.length === 0) {
      return (
        <View
          style={{ width: config.size, height: config.size }}
          className="rounded-full bg-gray-200 items-center justify-center"
        >
          <IconSymbol name="person.fill" size={16} color="#9CA3AF" />
        </View>
      );
    }

    return (
      <View className="flex-row flex-wrap gap-1">
        {members.map((member) => (
          <View key={member.id} className="items-center w-16">
            <Avatar uri={member.avatar_url} size={config.size} />
            <Text className="text-[8px] text-gray-600 mt-1 text-center" numberOfLines={1}>
              {member.display_name || '未設定'}
            </Text>
          </View>
        ))}
      </View>
    );
  }
);

MemberAvatarGroup.displayName = 'MemberAvatarGroup';
