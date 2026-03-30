import React, { useState } from 'react';
import { TextInput, View, Text, type TextInputProps } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  containerClassName?: string;
  className?: string;
  icon?: any;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
}

export function Input({
  label,
  error,
  containerClassName = '',
  className = '',
  icon: Icon,
  leftComponent,
  rightComponent,
  ...props
}: InputProps) {
  const colors = useThemeColors();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label && <Text className="text-sm font-semibold text-text-secondary mb-2 font-kanit">{label}</Text>}
      <View className={`flex-row items-center bg-card rounded-2xl border ${isFocused ? 'border-primary' : 'border-stone-200/10 dark:border-stone-900/10'} px-4`}>
        {leftComponent && <View className="mr-2">{leftComponent}</View>}
        {Icon && <Icon {...({ size: 20, stroke: isFocused ? colors.primary : colors.muted } as any)} />}
        <TextInput
          className={`flex-1 py-4 px-2 text-base text-text font-kanit ${
            isFocused ? 'text-text' : 'text-text-secondary'
          } ${className}`}
          placeholderTextColor={colors.muted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {rightComponent && <View className="ml-2">{rightComponent}</View>}
      </View>
      {error && <Text className="text-xs text-error mt-1 font-kanit">{error}</Text>}
    </View>
  );
}

