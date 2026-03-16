import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { MapPin, Star } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

export function GymCard({ name, location, rating, image, delay }: any) {
  return (
    <Animated.View 
      entering={FadeInUp.delay(delay)}
      className="bg-card rounded-[32px] overflow-hidden border border-white/5"
    >
       <View className="relative h-48">
          <Image source={{ uri: image }} className="w-full h-full" />
          <View className="absolute top-4 right-4 bg-black/50 px-3 py-1.5 rounded-full flex-row items-center border border-white/10">
             <Star {...({ size: 12, stroke: "#C8FF32", fill: "#C8FF32" } as any)} />
             <Text className="text-white text-xs font-bold font-kanit ml-1">{rating}</Text>
          </View>
       </View>
       <View className="p-6">
          <View className="flex-row justify-between items-start mb-2">
             <View>
                <Text className="text-white text-lg font-bold font-kanit">{name}</Text>
                <View className="flex-row items-center mt-1">
                   <MapPin {...({ size: 12, stroke: "#616161" } as any)} />
                   <Text className="text-text-secondary text-xs font-kanit ml-1">{location}</Text>
                </View>
             </View>
             <TouchableOpacity className="bg-primary/10 px-4 py-2 rounded-xl">
                <Text className="text-primary text-xs font-bold font-kanit">Join</Text>
             </TouchableOpacity>
          </View>
       </View>
    </Animated.View>
  );
}
