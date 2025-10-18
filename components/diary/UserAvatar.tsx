import { Profile } from '@/types';
import React from 'react';
import { Text, View } from 'react-native';

interface UserAvatarProps {
  user: Profile;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  showName?: boolean;
}

const SIZE_CONFIG = {
  small: { container: 'w-8 h-8', text: 'text-xs', name: 'text-xs' },
  medium: { container: 'w-10 h-10', text: 'text-sm', name: 'text-sm' },
  large: { container: 'w-12 h-12', text: 'text-base', name: 'text-base' },
  xlarge: { container: 'w-16 h-16', text: 'text-2xl', name: 'text-lg' },
};

/**
 * ユーザーアバターを表示するコンポーネント
 */
export const UserAvatar = React.memo<UserAvatarProps>(
  ({ user, size = 'medium', showName = false }) => {
    const config = SIZE_CONFIG[size];

    return (
      <View className="items-center">
        <View
          className={`${config.container} rounded-full bg-app-primary items-center justify-center`}
        >
          <Text className={`text-white font-bold ${config.text}`}>
            {user.display_name?.charAt(0) || '?'}
          </Text>
        </View>
        {showName && (
          <Text className={`${config.name} text-gray-700 font-medium mt-1`} numberOfLines={1}>
            {user.display_name || '名前なし'}
          </Text>
        )}
      </View>
    );
  }
);

UserAvatar.displayName = 'UserAvatar';
