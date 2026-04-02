import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Zap, ChevronRight, Activity, Camera, Image } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';

interface FitnessScoreCardProps {
  score?: number;
  showScanOptions?: boolean;
}

export function FitnessScoreCard({ score = 90, showScanOptions = false }: FitnessScoreCardProps) {
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
      
      {showScanOptions ? (
        <View
          className="flex-row mt-5 pt-5 border-t border-border"
          style={{ gap: 10 }}
        >
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center py-3 rounded-2xl"
            style={{ backgroundColor: colors.primary + '15', gap: 8 }}
            onPress={() => router.push({ pathname: '/home/fitness-score', params: { source: 'camera' } } as any)}
            activeOpacity={0.8}
          >
            <Camera {...({ size: 16, stroke: colors.primary } as any)} />
            <Text className="font-bold font-kanit text-sm text-primary">Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center py-3 rounded-2xl"
            style={{ backgroundColor: colors.primary + '15', gap: 8 }}
            onPress={() => router.push({ pathname: '/home/fitness-score', params: { source: 'gallery' } } as any)}
            activeOpacity={0.8}
          >
            <Image {...({ size: 16, stroke: colors.primary } as any)} />
            <Text className="font-bold font-kanit text-sm text-primary">Gallery</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="mt-5 pt-5 border-t border-border flex-row items-center justify-between">
          <Text className="text-text-secondary text-[11px] font-bold font-kanit uppercase tracking-wider">
            View Detailed Breakdown
          </Text>
          <ChevronRight {...({ size: 16, stroke: colors.primary, opacity: 0.8 } as any)} />
        </View>
      )}
    </TouchableOpacity>
  );
}
