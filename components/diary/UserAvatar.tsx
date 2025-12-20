import { Avatar } from '@/components/ui/Avatar';
import { Profile } from '@/types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

interface UserAvatarProps {
  user: Profile;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  showName?: boolean;
}

const SIZE_CONFIG = {
  small: { size: 32, name: 'text-xs' },
  medium: { size: 40, name: 'text-sm' },
  large: { size: 48, name: 'text-base' },
  xlarge: { size: 64, name: 'text-lg' },
};

/**
 * ユーザーアバターを表示するコンポーネント
 */
export const UserAvatar = React.memo<UserAvatarProps>(
  ({ user, size = 'medium', showName = false }) => {
    const { t } = useTranslation();
    const config = SIZE_CONFIG[size];

    return (
      <View className="items-center">
        <Avatar uri={user.avatar_url} size={config.size} />
        {showName && (
          <Text className={`${config.name} text-gray-700 font-medium mt-1`} numberOfLines={1}>
            {user.display_name || t('common.noName')}
          </Text>
        )}
      </View>
    );
  }
);

UserAvatar.displayName = 'UserAvatar';
