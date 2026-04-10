import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Scale, Target, Activity, Flame } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { AppUser } from '@/interfaces/member';

interface FoodProfileProps {
  profile: AppUser;
}

export function FoodProfile({ profile }: FoodProfileProps) {
  const colors = useThemeColors();

  return (
    <Animated.View entering={FadeInUp.delay(100)} className="mb-4 bg-card border border-stone-200/5 dark:border-stone-900/5 rounded-[32px] p-6 shadow-xl shadow-black/5">
      <Text className="text-text font-black font-kanit text-lg mb-5">Your Health Profile</Text>
      
      <View className="flex-row flex-wrap">
        {/* Body Stats */}
        <View className="w-[50%] flex-row items-center mb-6 pl-1 pr-2">
          <View className="w-10 h-10 rounded-xl bg-lime-100/20 dark:bg-lime-800/20 items-center justify-center mr-3">
            <Scale {...({ size: 18, stroke: colors.primary } as any)} />
          </View>
          <View className="flex-1">
            <Text className="text-text-secondary text-[10px] uppercase font-bold font-kanit">Body</Text>
            <Text className="text-text font-black font-kanit text-[13px] leading-tight mt-0.5" numberOfLines={2}>
              {profile.bodyStats?.weight ? `${profile.bodyStats?.weight}kg` : '--'} {profile.bodyStats?.height ? `• ${profile.bodyStats?.height}cm` : ''}
            </Text>
          </View>
        </View>

        {/* Goal */}
        <View className="w-[50%] flex-row items-center mb-6 pl-1 pr-2">
          <View className="w-10 h-10 rounded-xl bg-[#60A5FA]/10 items-center justify-center mr-3">
            <Target {...({ size: 18, stroke: '#60A5FA' } as any)} />
          </View>
          <View className="flex-1">
            <Text className="text-text-secondary text-[10px] uppercase font-bold font-kanit">Goal</Text>
            <Text className="text-text font-black font-kanit text-[13px] leading-tight capitalize mt-0.5" numberOfLines={2}>
              {profile.preferences?.fitnessGoal?.replace('_', ' ') || '--'}
            </Text>
          </View>
        </View>

        {/* Activity Level */}
        <View className="w-[50%] flex-row items-center pl-1 pr-2">
          <View className="w-10 h-10 rounded-xl bg-[#FBBF24]/10 items-center justify-center mr-3">
            <Activity {...({ size: 18, stroke: '#FBBF24' } as any)} />
          </View>
          <View className="flex-1">
            <Text className="text-text-secondary text-[10px] uppercase font-bold font-kanit">Activity</Text>
            <Text className="text-text font-black font-kanit text-[13px] leading-tight capitalize mt-0.5" numberOfLines={2}>
              {profile.preferences?.activityLevel?.replace('_', ' ') || '--'}
            </Text>
          </View>
        </View>

        {/* Diet Focus */}
        <View className="w-[50%] flex-row items-center pl-1 pr-2">
          <View className="w-10 h-10 rounded-xl bg-[#34D399]/10 items-center justify-center mr-3">
            <Flame {...({ size: 18, stroke: '#34D399' } as any)} />
          </View>
          <View className="flex-1">
            <Text className="text-text-secondary text-[10px] uppercase font-bold font-kanit">Diet</Text>
            <Text className="text-text font-black font-kanit text-[13px] leading-tight capitalize mt-0.5" numberOfLines={2}>
              {profile.preferences?.dietPreference || '--'}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
