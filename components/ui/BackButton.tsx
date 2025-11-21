import { IconSymbol } from '@/components/ui/icon-symbol';
import React from 'react';
import { TouchableOpacity } from 'react-native';

interface BackButtonProps {
  onPress: () => void;
  color?: string;
  size?: number;
}

export function BackButton({ onPress, color = '#6C6EE6', size = 24 }: BackButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} className="mr-3">
      <IconSymbol name="chevron.left" size={size} color={color} />
    </TouchableOpacity>
  );
}
