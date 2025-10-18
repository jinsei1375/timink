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
  small: { size: 'w-8 h-8', text: 'text-xs', spacing: '-space-x-1.5' },
  medium: { size: 'w-10 h-10', text: 'text-sm', spacing: '-space-x-2' },
  large: { size: 'w-12 h-12', text: 'text-base', spacing: '-space-x-2.5' },
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
        <View className={`${config.size} rounded-full bg-gray-200 items-center justify-center`}>
          <IconSymbol name="person.fill" size={16} color="#9CA3AF" />
        </View>
      );
    }

    return (
      <View className={`flex-row ${config.spacing}`}>
        {displayMembers.map((member, index) => (
          <View
            key={member.id}
            className={`${config.size} rounded-full bg-app-primary items-center justify-center border-2 border-white`}
            style={{ zIndex: 10 - index }}
          >
            <Text className={`text-white font-bold ${config.text}`}>
              {member.display_name?.charAt(0) || '?'}
            </Text>
          </View>
        ))}
        {remainingCount > 0 && (
          <View
            className={`${config.size} rounded-full bg-gray-300 items-center justify-center border-2 border-white`}
            style={{ zIndex: 0 }}
          >
            <Text className={`text-gray-600 font-bold ${config.text}`}>+{remainingCount}</Text>
          </View>
        )}
      </View>
    );
  }
);

MemberAvatarGroup.displayName = 'MemberAvatarGroup';
