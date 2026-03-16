import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  rightElement?: React.ReactNode;
}

export function Header({ title, showBackButton = false, rightElement }: HeaderProps) {
  const router = useRouter();

  return (
    <View className="flex-row items-center justify-between px-6 h-20 bg-background">
      <View className="w-10">
        {showBackButton && (
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-card rounded-xl items-center justify-center border border-white/5"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronLeft {...({ size: 24, stroke: "white" } as any)} />
          </TouchableOpacity>
        )}
      </View>

      <Text className="flex-1 text-center text-white text-lg font-bold font-kanit">
        {title}
      </Text>

      <View className="w-10 items-end">
        {rightElement}
      </View>
    </View>
  );
}
