import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

type InfoBoxType = 'info' | 'warning' | 'danger';

interface InfoBoxProps {
  type?: InfoBoxType;
  title?: string;
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

const INFO_BOX_STYLES = {
  info: {
    icon: 'information-circle' as keyof typeof Ionicons.glyphMap,
    iconColor: '#3B82F6',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-100',
    textColor: 'text-blue-700',
    titleColor: 'text-blue-900',
  },
  warning: {
    icon: 'warning-outline' as keyof typeof Ionicons.glyphMap,
    iconColor: '#D97706',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    titleColor: 'text-yellow-800',
  },
  danger: {
    icon: 'alert-circle-outline' as keyof typeof Ionicons.glyphMap,
    iconColor: '#DC2626',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    titleColor: 'text-red-800',
  },
};

export function InfoBox({ type = 'info', title, message, icon }: InfoBoxProps) {
  const styles = INFO_BOX_STYLES[type];
  const displayIcon = icon || styles.icon;

  return (
    <View className={`${styles.bgColor} rounded-xl p-4 border ${styles.borderColor}`}>
      <View className="flex-row items-start">
        <Ionicons name={displayIcon} size={20} color={styles.iconColor} />
        <View className="flex-1 ml-2">
          {title && <Text className={`${styles.titleColor} font-semibold mb-1`}>{title}</Text>}
          <Text className={`${styles.textColor} text-sm leading-5`}>{message}</Text>
        </View>
      </View>
    </View>
  );
}
