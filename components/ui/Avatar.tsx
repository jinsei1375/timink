import { IconSymbol } from '@/components/ui/icon-symbol';
import React from 'react';
import { Image, View } from 'react-native';

interface AvatarProps {
  uri?: string | null;
  size?: number;
  className?: string;
}

/**
 * ユーザーアバター表示コンポーネント
 */
export function Avatar({ uri, size = 40, className = '' }: AvatarProps) {
  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[containerStyle, { backgroundColor: '#e0e0e0' }]}
        className={className}
      />
    );
  }

  return (
    <View style={containerStyle} className={`bg-gray-300 items-center justify-center ${className}`}>
      <IconSymbol name="person.fill" size={size * 0.6} color="#999" />
    </View>
  );
}
