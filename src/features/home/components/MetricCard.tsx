import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

export function MetricCard({ title, value, unit, trend, delay }: any) {
  return (
    <Animated.View 
      entering={FadeInUp.delay(delay)}
      className="w-1/2 p-2"
    >
      <View className="bg-card rounded-3xl p-5 border border-stone-200/5 dark:border-stone-900/5">
        <View className="flex-row justify-between mb-4">
          <Text className="text-text-secondary text-xs font-kanit">{title}</Text>
          <View className="w-2 h-2 rounded-full bg-primary" />
        </View>
        <Text className="text-text text-2xl font-bold font-kanit">
          {value} <Text className="text-text-secondary text-xs font-normal">{unit}</Text>
        </Text>
        <View className="w-full h-12 mt-4 bg-white/5 rounded-lg overflow-hidden flex-row items-end px-1 space-x-1">
           {[4, 7, 5, 8, 6, 9, 7].map((h, i) => (
             <View key={i} className="flex-1 bg-primary/40 rounded-t-sm" style={{ height: `${h * 10}%` }} />
           ))}
        </View>
      </View>
    </Animated.View>
  );
}
