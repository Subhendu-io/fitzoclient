import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import {
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
  Flame,
} from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { FoodAssessment } from '../services/foodAnalysisService';

interface FoodResultProps {
  result: FoodAssessment;
  onReset: () => void;
}

export function FoodResult({ result, onReset }: FoodResultProps) {
  const colors = useThemeColors();

  return (
    <Animated.View entering={FadeInUp.delay(200)} className="space-y-4 pb-6">
      {result.imageUrl && (
        <View className="w-full relative items-center justify-center mb-2 mt-4">
          <Image
            source={{ uri: result.imageUrl }}
            className="w-full aspect-[4/3] rounded-[32px] opacity-90"
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.05)',
            }}
          />
        </View>
      )}

      {/* Calories Card */}
      <LinearGradient
        colors={
          result.isHealthy
            ? ['#10b981', '#059669'] // Emerald green
            : ['#ef4444', '#b91c1c'] // Red
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-[32px] p-6 items-center mb-4 mt-2"
      >
        <View className="flex-row items-center bg-black/20 px-3 py-1.5 rounded-full mb-4 space-x-2">
          {result.isHealthy ? (
            <CheckCircle2 {...({ size: 16, stroke: '#FFFFFF' } as any)} />
          ) : (
            <AlertTriangle {...({ size: 16, stroke: '#FFFFFF' } as any)} />
          )}
          <Text className="text-white text-xs font-bold font-kanit tracking-wider ml-1">
            {result.isHealthy ? 'HEALTHY CHOICE' : 'CONSUME IN MODERATION'}
          </Text>
        </View>
        <Text className="text-white text-6xl font-black font-kanit leading-tight">
          {result.totalCalories}
        </Text>
        <Text className="text-white text-lg font-bold font-kanit mt-1">Calories</Text>
        <Text className="text-white/80 text-xs font-kanit text-center mt-4 leading-5">
          {result.caloriesBreakdown}
        </Text>
      </LinearGradient>

      {/* Health Notes */}
      <View className="bg-card border border-stone-200/5 dark:border-stone-900/5 rounded-3xl p-5 mb-4 shadow-sm shadow-black/5">
        <View className="flex-row items-center mb-3">
          <View className="w-10 h-10 rounded-xl bg-blue-500/10 items-center justify-center mr-3">
            <ShieldCheck {...({ size: 20, stroke: '#3b82f6' } as any)} />
          </View>
          <Text className="text-text text-lg font-bold font-kanit">Dietitian's Verdict</Text>
        </View>
        <Text className="text-text-secondary font-kanit leading-6">
          {result.healthNotes}
        </Text>
      </View>

      {/* Benefits & Drawbacks */}
      <View className="flex-row space-x-4 mb-4" style={{ gap: 16 }}>
        {result.benefits && result.benefits.length > 0 && (
          <View className="flex-1 bg-card border border-stone-200/5 dark:border-stone-900/5 rounded-3xl p-5 shadow-sm shadow-black/5">
            <View className="flex-row items-center mb-3 flex-wrap">
              <ThumbsUp {...({ size: 16, stroke: '#10b981' } as any)} />
              <Text className="text-text font-bold font-kanit ml-2">Benefits</Text>
            </View>
            {result.benefits.map((item, i) => (
              <Text key={i} className="text-text-secondary text-xs font-kanit mb-1 leading-5">
                • {item}
              </Text>
            ))}
          </View>
        )}
        {result.drawbacks && result.drawbacks.length > 0 && (
          <View className="flex-1 bg-card border border-stone-200/5 dark:border-stone-900/5 rounded-3xl p-5 shadow-sm shadow-black/5">
            <View className="flex-row items-center mb-3 flex-wrap">
              <ThumbsDown {...({ size: 16, stroke: '#ef4444' } as any)} />
              <Text className="text-text font-bold font-kanit ml-2">Drawbacks</Text>
            </View>
            {result.drawbacks.map((item, i) => (
              <Text key={i} className="text-text-secondary text-xs font-kanit mb-1 leading-5">
                • {item}
              </Text>
            ))}
          </View>
        )}
      </View>

      {/* Workout Suggestions */}
      {result.workoutSuggestions && result.workoutSuggestions.length > 0 && (
        <View className="bg-card border border-stone-200/5 dark:border-stone-900/5 rounded-3xl p-5 mb-4 shadow-sm shadow-black/5">
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 rounded-xl bg-orange-500/10 items-center justify-center mr-3">
              <Flame {...({ size: 20, stroke: '#f97316' } as any)} />
            </View>
            <Text className="text-text text-lg font-bold font-kanit">Burn It Off</Text>
          </View>
          {result.workoutSuggestions.map((rec, index) => (
            <View key={index} className="flex-row items-start mb-3 pr-2">
              <View className="w-6 h-6 rounded-full bg-primary/10 items-center justify-center mt-0.5 mr-3">
                <Text className="text-primary text-xs font-bold font-kanit">{index + 1}</Text>
              </View>
              <Text className="text-text-secondary font-kanit leading-5 flex-1 pr-4">{rec}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Scan Again Button */}
      <TouchableOpacity
        className="bg-white/5 py-5 rounded-3xl items-center border border-stone-200/5 dark:border-stone-900/5 mt-4 lg:mb-12"
        onPress={onReset}
        activeOpacity={0.8}
      >
        <Text className="text-text font-bold font-kanit">NEW ASSESSMENT</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
