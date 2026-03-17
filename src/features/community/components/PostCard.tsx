import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Heart, Share2, MessageCircle } from "lucide-react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useThemeColors } from "@/hooks/useThemeColors";

export function PostCard({ name, time, avatar, content, image, likes, comments }: any) {
  const colors = useThemeColors();
  return (
    <Animated.View
      entering={FadeInUp.delay(300)}
      className="bg-card rounded-[40px] overflow-hidden border border-stone-200/5 dark:border-stone-900/5 mb-6"
    >
      <View className="p-6">
        <View className="flex-row items-center mb-4">
          <Image source={{ uri: avatar }} className="w-10 h-10 rounded-full" />
          <View className="ml-3">
            <Text className="text-text font-bold font-kanit">{name}</Text>
            <Text className="text-text-secondary text-[10px] font-kanit">{time}</Text>
          </View>
        </View>
        <Text className="text-text text-sm font-kanit leading-relaxed">{content}</Text>
      </View>
      <Image source={{ uri: image }} className="w-full h-64" />
      <View className="p-6 flex-row items-center space-x-6">
        <TouchableOpacity className="flex-row items-center mr-4">
          <Heart {...({ size: 20, stroke: colors.primary, fill: colors.primary } as any)} />
          <Text className="text-text text-xs font-bold font-kanit ml-2">{likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center">
          <MessageCircle {...({ size: 20, stroke: colors.text, fill: colors.text } as any)} />
          <Text className="text-text text-xs font-bold font-kanit ml-2">{comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 items-end">
          <Share2 {...({ size: 20, stroke: colors.text } as any)} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
