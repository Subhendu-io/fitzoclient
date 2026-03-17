import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Zap, ChevronRight, Activity } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';

interface FitnessScoreCardProps {
  score?: number;
}

export function FitnessScoreCard({ score = 90 }: FitnessScoreCardProps) {
  const colors = useThemeColors();
  const router = useRouter();

  return (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPress={() => router.push('/home/fitness-score')}
      className="bg-card border border-stone-200/5 dark:border-stone-900/5 rounded-[40px] p-6 mb-6 overflow-hidden"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className="w-14 h-14 rounded-full border-2 border-primary items-center justify-center mr-4">
             <Activity {...({ size: 24, stroke: colors.primary } as any)} />
          </View>
          <View className="flex-1">
            <Text className="text-text text-lg font-bold font-kanit">Fitness Score</Text>
            <Text className="text-text-secondary text-xs font-kanit leading-tight">
              Your overall physical health & performance index
            </Text>
          </View>
        </View>
        <View className="items-end ml-4">
          <View className="flex-row items-baseline">
            <Text className="text-text text-3xl font-black font-kanit">{score}</Text>
            <Text className="text-primary text-lg font-bold font-kanit ml-1">%</Text>
          </View>
          <View className="flex-row items-center">
            <Zap {...({ size: 10, stroke: colors.primary, fill: colors.primary } as any)} />
            <Text className="text-primary text-[10px] font-bold font-kanit uppercase ml-1">Excellent</Text>
          </View>
        </View>
      </View>
      
      <View className="mt-5 pt-5 border-t border-stone-200/5 dark:border-stone-900/5 flex-row items-center justify-between">
        <Text className="text-text-secondary text-[11px] font-bold font-kanit uppercase tracking-wider">
          View Detailed Breakdown
        </Text>
        <ChevronRight {...({ size: 16, stroke: colors.primary, opacity: 0.8 } as any)} />
      </View>
    </TouchableOpacity>
  );
}
