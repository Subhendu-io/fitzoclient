import React, { useState } from 'react';
import { TextInput, View, Text, type TextInputProps } from 'react-native';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  containerClassName?: string;
  className?: string;
  icon?: any;
}

export function Input({
  label,
  error,
  containerClassName = '',
  className = '',
  icon: Icon,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label && <Text className="text-sm font-semibold text-text-secondary mb-2 font-kanit">{label}</Text>}
      <View className="flex-row items-center bg-card rounded-2xl border-1.5 px-4">
        {Icon && <Icon {...({ size: 20, stroke: isFocused ? '#C8FF32' : '#616161' } as any)} />}
        <TextInput
          className={`flex-1 py-4 px-2 text-base text-text font-kanit ${
            isFocused ? 'text-text' : 'text-text-secondary'
          } ${className}`}
          placeholderTextColor="#616161"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </View>
      {error && <Text className="text-xs text-error mt-1 font-kanit">{error}</Text>}
    </View>
  );
}
