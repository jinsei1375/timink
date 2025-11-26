import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

interface PinBadgeProps {
  size?: number;
  className?: string;
}

export const PinBadge: React.FC<PinBadgeProps> = ({ size = 10, className = '' }) => {
  return (
    <View
      className={`bg-orange-400 rounded-full p-1 transform rotate-45 items-center justify-center ${className}`}
    >
      <Ionicons name="pin" size={size} color="white" />
    </View>
  );
};
