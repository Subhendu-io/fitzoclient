import React from 'react';
import { View, Text } from 'react-native';
import { UtensilsCrossed } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function DietHeroSection() {
  return (
    <LinearGradient
      colors={['#5e3ed8', '#81e300']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 40, marginBottom: 10, overflow: 'hidden' }}
    >
      <View className="p-8 items-center mb-2 relative overflow-hidden">
        <View className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <View className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-2xl" />
        
        <View className="w-20 h-20 rounded-[32px] bg-white/20 items-center justify-center mb-6 shadow-sm border border-white/20 z-10">
          <UtensilsCrossed {...({ size: 40, stroke: '#FFFFFF' } as any)} />
        </View>
        
        <Text className="text-white text-3xl font-black font-kanit text-center mb-3 z-10" style={{ letterSpacing: 0.5 }}>
          DIET AI PRO
        </Text>
        <Text className="text-white/90 text-[15px] font-kanit text-center leading-6 px-2 z-10 font-medium">
          Unlock an instant, clinical-grade analysis of your meal, calorie breakdown, and tailored workout ideas.
        </Text>
      </View>
    </LinearGradient>
  );
}
