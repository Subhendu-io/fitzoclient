import React from 'react'
import { View, Text } from 'react-native'
import { Zap } from 'lucide-react-native'

const HeroSection = () => {
  return (
    <View className="bg-primary rounded-[40px] p-8 items-center shadow-2xl shadow-primary/40 relative overflow-hidden">
      <View className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
      <View className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-2xl" />
      <View className="w-20 h-20 rounded-[32px] bg-white/20 items-center justify-center mb-6 shadow-sm border border-white/20 z-10">
        <Zap {...({ size: 40, stroke: '#FFFFFF' } as any)} />
      </View>
      
      <Text className="text-black text-3xl font-black font-kanit text-center mb-3 z-10" style={{ letterSpacing: 0.5 }}>
        FITNESS AI PRO
      </Text>
      <Text className="text-black/80 text-[15px] font-kanit text-center leading-6 px-2 z-10 font-medium">
        Unlock an instant, clinical-grade analysis of your physique, posture, and muscle definition.
      </Text>
    </View>
  )
}

export default HeroSection