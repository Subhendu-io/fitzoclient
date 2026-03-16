import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Play } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

export function WorkoutItem({ title, difficulty, delay }: any) {
  return (
    <Animated.View 
      entering={FadeInUp.delay(delay)}
      className="bg-card rounded-[32px] overflow-hidden border border-white/5 flex-row items-center p-4"
    >
       <View className="w-16 h-16 rounded-2xl bg-white/5 items-center justify-center">
          <Play {...({ size: 24, stroke: "#C8FF32" } as any)} />
       </View>
       <View className="flex-1 ml-4">
          <Text className="text-white text-lg font-bold font-kanit">{title}</Text>
          <Text className="text-text-secondary text-xs font-kanit">{difficulty}</Text>
       </View>
       <TouchableOpacity className="w-10 h-10 bg-white/5 rounded-full items-center justify-center">
          <Text className="text-white font-bold">→</Text>
       </TouchableOpacity>
    </Animated.View>
  );
}
