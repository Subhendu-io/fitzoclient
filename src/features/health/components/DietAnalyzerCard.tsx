import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Camera, Image, ChevronRight, UtensilsCrossed } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';

export function DietAnalyzerCard() {
  const colors = useThemeColors();
  const router = useRouter();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push('/(main)/food-analysis')}
      className="bg-card border border-stone-200/5 dark:border-stone-900/5 rounded-3xl p-6 mb-6 overflow-hidden"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View
            className="w-14 h-14 rounded-full items-center justify-center mr-4 bg-warning/10 border-2 border-orange-500"
          >
            <UtensilsCrossed {...({ size: 24, stroke: colors.warning } as any)} />
          </View>
          <View className="flex-1">
            <Text className="text-text text-lg font-bold font-kanit">Diet Analyzer</Text>
            <Text className="text-text-secondary text-xs font-kanit leading-tight">
              Snap a photo to analyze calories & nutrients
            </Text>
          </View>
        </View>
        <ChevronRight {...({ size: 18, stroke: colors.muted, opacity: 0.6 } as any)} />
      </View>

      <View
        className="flex-row mt-5 pt-5 border-t border-border"
        style={{ gap: 10 }}
      >
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center py-3 rounded-2xl"
          style={{ backgroundColor: colors.warning, gap: 8 }}
          onPress={() => router.push({ pathname: '/(main)/food-analysis', params: { source: 'camera' } })}
          activeOpacity={0.8}
        >
          <Camera {...({ size: 16, stroke: colors.text } as any)} />
          <Text className="font-bold font-kanit text-sm text-text">Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center py-3 rounded-2xl"
          style={{ backgroundColor: colors.warning + '15', gap: 8 }}
          onPress={() => router.push({ pathname: '/(main)/food-analysis', params: { source: 'gallery' } })}
          activeOpacity={0.8}
        >
          <Image {...({ size: 16, stroke: colors.warning } as any)} />
          <Text className="font-bold font-kanit text-sm text-orange-500">Gallery</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
