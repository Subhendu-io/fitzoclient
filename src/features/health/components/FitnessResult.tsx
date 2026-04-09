import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Target, Zap, ListChecks, CheckCircle2 } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useThemeColors } from '@/hooks/useThemeColors';
import { FitnessAssessment } from '../services/fitnessScoreService';
import { SecureImage } from '@/components/ui/SecureImage';

interface FitnessResultProps {
  result: FitnessAssessment;
  image: string | null;
  onReset: () => void;
}

export function FitnessResult({ result, image, onReset }: FitnessResultProps) {
  const colors = useThemeColors();

  const getScoreColor = (score: number) => {
    if (score >= 80) return colors.primary;
    if (score >= 60) return '#60A5FA';
    if (score >= 40) return '#FBBF24';
    return '#F87171';
  };

  return (
    <View className="py-4">
      <Animated.View entering={FadeInUp} className="mb-10 items-center">
        {/* Show the uploaded user image attractively as a background relative to score */}
        <View className="w-full relative items-center justify-center mb-8">
          <SecureImage 
            uri={result.imageUrl || image || ''} 
            className="w-full aspect-[4/3] rounded-[40px] opacity-80" 
            style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }} 
          />
          
          {/* Score overlaps the image bottom */}
          <View 
            style={{ borderColor: getScoreColor(result.score), elevation: 15 }}
            className="absolute -bottom-10 w-32 h-32 rounded-full border-[8px] items-center justify-center bg-card shadow-2xl shadow-black/50"
          >
            <Text className="text-text text-5xl font-black font-kanit">{result.score}</Text>
            <Text className="text-text-secondary text-[10px] font-bold font-kanit uppercase mt-0">AI Score</Text>
          </View>
        </View>
      </Animated.View>

      <View className="gap-6">
        <View className="bg-card border border-stone-200/5 dark:border-stone-900/5 rounded-[32px] p-6">
          <View className="flex-row items-center mb-4">
            <Target {...({ size: 18, stroke: colors.primary } as any)} />
            <Text className="text-text text-lg font-bold font-kanit ml-3">Today's Focus</Text>
          </View>
          <Text className="text-text-secondary font-kanit leading-relaxed">{result.todayPlan}</Text>
        </View>

        <View className="bg-card border border-stone-200/5 dark:border-stone-900/5 rounded-[32px] p-6">
          <View className="flex-row items-center mb-4">
            <Zap {...({ size: 18, stroke: colors.primary } as any)} />
            <Text className="text-text text-lg font-bold font-kanit ml-3">Phsysique Analysis</Text>
          </View>
          <Text className="text-text-secondary font-kanit leading-relaxed">{result.analysis}</Text>
        </View>

        <View className="bg-card border border-stone-200/5 dark:border-stone-900/5 rounded-[32px] p-6">
          <View className="flex-row items-center mb-6">
            <ListChecks {...({ size: 18, stroke: colors.primary } as any)} />
            <Text className="text-text text-lg font-bold font-kanit ml-3">Action Steps</Text>
          </View>
          <View className="gap-4">
            {result.recommendations.map((rec, i) => (
              <View key={i} className="flex-row gap-4 pr-4">
                 <CheckCircle2 {...({ size: 20, stroke: colors.primary, opacity: 0.6 } as any)} />
                 <Text className="flex-1 text-text-secondary font-kanit leading-5">{rec}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          onPress={onReset}
          className="bg-white/5 py-5 rounded-3xl items-center border border-stone-200/5 dark:border-stone-900/5 mt-2"
        >
          <Text className="text-text font-bold font-kanit">NEW ASSESSMENT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
