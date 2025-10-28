import { Avatar } from '@/components/ui/Avatar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Profile } from '@/types';
import React from 'react';
import { Text, View } from 'react-native';

interface MemberAvatarGroupProps {
  members: Profile[];
  maxDisplay?: number;
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
  ({ members, maxDisplay = 3, size = 'medium' }) => {
    const config = SIZE_CONFIG[size];
    const displayMembers = members.slice(0, maxDisplay);
    const remainingCount = members.length - maxDisplay;

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
      <View className={`flex-row ${config.spacing}`}>
        {displayMembers.map((member, index) => (
          <View
            key={member.id}
            style={{ zIndex: 10 - index }}
            className="border-2 border-white rounded-full"
          >
            <Avatar uri={member.avatar_url} size={config.size} />
          </View>
        ))}
        {remainingCount > 0 && (
          <View
            style={{
              width: config.size,
              height: config.size,
              zIndex: 0,
            }}
            className="rounded-full bg-gray-300 items-center justify-center border-2 border-white"
          >
            <Text className="text-gray-600 font-bold text-sm">+{remainingCount}</Text>
          </View>
        )}
      </View>
    );
  }
);

MemberAvatarGroup.displayName = 'MemberAvatarGroup';
