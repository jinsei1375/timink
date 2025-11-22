import React from 'react';
import { Text, View } from 'react-native';
import { BackButton } from './BackButton';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  titleIcon?: React.ReactNode;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  className?: string;
}

export function ScreenHeader({
  title,
  subtitle,
  titleIcon,
  onBack,
  rightElement,
  className,
}: ScreenHeaderProps) {
  return (
    <View className={`bg-white px-6 py-4 border-b border-gray-200 ${className}`}>
      <View className="flex-row items-center justify-between">
        <View style={{ width: 40, alignItems: 'flex-start' }}>
          {onBack && <BackButton onPress={onBack} />}
        </View>

        <View className="flex-1 mx-2 items-center">
          <View className="flex-row items-center justify-center">
            {titleIcon && <View className="mr-2">{titleIcon}</View>}
            <Text className="text-xl font-bold text-gray-800 text-center" numberOfLines={1}>
              {title}
            </Text>
          </View>
          {subtitle && <Text className="text-xs text-gray-500 mt-0.5">{subtitle}</Text>}
        </View>

        <View style={{ width: 40, alignItems: 'flex-end' }}>{rightElement}</View>
      </View>
    </View>
  );
}
