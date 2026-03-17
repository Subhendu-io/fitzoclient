import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Play } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useThemeColors } from '@/hooks/useThemeColors';

export function WorkoutItem({ title, difficulty, delay }: any) {
  const colors = useThemeColors();
  return (
    <Animated.View 
      entering={FadeInUp.delay(delay)}
      className="bg-card rounded-[32px] overflow-hidden border border-stone-200/5 dark:border-stone-900/5 flex-row items-center p-4"
    >
       <View className="w-16 h-16 rounded-2xl bg-white/5 items-center justify-center">
          <Play {...({ size: 24, stroke: colors.primary } as any)} />
       </View>
       <View className="flex-1 ml-4">
          <Text className="text-text text-lg font-bold font-kanit">{title}</Text>
          <Text className="text-text-secondary text-xs font-kanit">{difficulty}</Text>
       </View>
       <TouchableOpacity className="w-10 h-10 bg-white/5 rounded-full items-center justify-center">
          <Text className="text-text font-bold">→</Text>
       </TouchableOpacity>
    </Animated.View>
  );
}
