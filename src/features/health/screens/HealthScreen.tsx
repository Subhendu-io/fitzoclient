import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { HealthCard } from '../components/HealthCard';
import { FitnessScoreCard } from '@/features/home/components/FitnessScoreCard';
import { DietAnalyzerCard } from '../components/DietAnalyzerCard';
import { useDashboard } from '@/hooks/useDashboard';
import { Skeleton } from '@/components/ui/Skeleton';
import { useThemeColors } from '@/hooks/useThemeColors';
import { HeartPulse } from 'lucide-react-native';

export function HealthScreen() {
  const colors = useThemeColors();
  const {
    currentWeekAttendance,
    weekRange,
    isLoading,
  } = useDashboard();

  if (isLoading) {
    return (
      <ScreenWrapper className="bg-background px-6">
        <View className="mt-6 mb-6">
          <Skeleton width={120} height={28} className="mb-2" />
          <Skeleton width={200} height={14} />
        </View>
        <Skeleton width="100%" height={240} borderRadius={40} className="mb-6" />
        <Skeleton width="100%" height={100} borderRadius={40} className="mb-6" />
        <Skeleton width="100%" height={120} borderRadius={32} className="mb-6" />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper className="bg-background">
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(150)} className="mt-6 mb-6">
          <View className="flex-row items-center" style={{ gap: 10 }}>
            <View
              className="w-10 h-10 rounded-2xl items-center justify-center"
              style={{ backgroundColor: colors.primary + '15' }}
            >
              <HeartPulse {...({ size: 20, stroke: colors.primary } as any)} />
            </View>
            <View>
              <Text className="text-text text-2xl font-bold font-kanit">Health</Text>
              <Text className="text-text-secondary text-xs font-kanit">
                Track, analyze & improve
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Achievements + Weekly Steps Tracking */}
        <Animated.View entering={FadeInUp.delay(250)}>
          <HealthCard startOfWeek={weekRange.start} />
        </Animated.View>

        {/* Fitness Score */}
        <Animated.View entering={FadeInUp.delay(400)}>
          <FitnessScoreCard score={90} showScanOptions />
        </Animated.View>

        {/* Diet Analyzer */}
        <Animated.View entering={FadeInUp.delay(550)}>
          <DietAnalyzerCard />
        </Animated.View>
      </ScrollView>
    </ScreenWrapper>
  );
}
