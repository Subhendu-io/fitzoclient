import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { MessageSquare, Heart, Share2 } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

export function PostCard({ name, time, avatar, content, image, likes, comments }: any) {
  return (
    <Animated.View 
      entering={FadeInUp.delay(300)}
      className="bg-card rounded-[40px] overflow-hidden border border-white/5"
    >
       <View className="p-6">
          <View className="flex-row items-center mb-4">
             <Image source={{ uri: avatar }} className="w-10 h-10 rounded-full" />
             <View className="ml-3">
                <Text className="text-white font-bold font-kanit">{name}</Text>
                <Text className="text-text-secondary text-[10px] font-kanit">{time}</Text>
             </View>
          </View>
          <Text className="text-white text-sm font-kanit leading-relaxed mb-4">{content}</Text>
       </View>
       <Image source={{ uri: image }} className="w-full h-64" />
       <View className="p-6 flex-row items-center space-x-6">
          <TouchableOpacity className="flex-row items-center">
             <Heart {...({ size: 20, stroke: "#C8FF32", fill: "#C8FF32" } as any)} />
             <Text className="text-white text-xs font-bold font-kanit ml-2">{likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center">
             <MessageSquare {...({ size: 20, stroke: "white" } as any)} />
             <Text className="text-white text-xs font-bold font-kanit ml-2">{comments}</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 items-end">
             <Share2 {...({ size: 20, stroke: "white" } as any)} />
          </TouchableOpacity>
       </View>
    </Animated.View>
  );
}
