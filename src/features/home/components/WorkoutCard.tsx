import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

export function WorkoutCard({ title, trainer, image }: any) {
  return (
    <TouchableOpacity className="mr-4 w-48 rounded-3xl overflow-hidden bg-card border border-stone-200/5 dark:border-stone-900/5">
      <Image source={{ uri: image }} className="w-full h-40" />
      <View className="p-4">
        <Text className="text-text font-bold font-kanit">{title}</Text>
        <Text className="text-text-secondary text-xs font-kanit lowercase">{trainer}</Text>
      </View>
    </TouchableOpacity>
  );
}
