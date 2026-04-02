import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Trophy, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';

interface HealthCardProps {
  weeklySteps?: number[]; // Array of 7 numbers representing steps from Monday to Sunday, or customized start
  startOfWeek?: Date;
}

// Temporary default mock data for steps
const MOCK_STEPS = [4500, 7200, 10500, 3100, 8900, 12000, 6400];
const MAX_GOAL = 10000;

export function HealthCard({ weeklySteps = MOCK_STEPS, startOfWeek = new Date() }: HealthCardProps) {
  const colors = useThemeColors();
  const router = useRouter();

  return (
    <View className="bg-primary rounded-[40px] p-6 mb-6 overflow-hidden">
      {/* Top Banner Row */}
      <TouchableOpacity 
        onPress={() => router.push('/(main)/achievements' as any)}
        activeOpacity={0.8}
        className="flex-row items-center justify-between mb-8"
      >
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-full bg-black/10 items-center justify-center mr-4">
            <Trophy {...({ size: 24, stroke: colors.onPrimary } as any)} />
          </View>
          <View>
            <Text className="text-black text-xl font-bold font-kanit">Today's Achievements</Text>
            <Text className="text-black/60 text-xs font-kanit">Check your daily fitness progress</Text>
          </View>
        </View>
        <ChevronRight {...({ size: 20, stroke: colors.onPrimary, opacity: 0.5 } as any)} />
      </TouchableOpacity>

      {/* Divider */}
      <View className="h-[1px] bg-black/5 w-full mb-6" />

      {/* Weekly Steps Representation */}
      <View>
        <Text className="text-black/60 text-[10px] font-bold font-kanit uppercase mb-4 tracking-widest text-center">
          Steps This Week
        </Text>
        
        <View className="flex-row justify-between items-end px-2 h-20 mb-2">
          {Array.from({ length: 7 }).map((_, index) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + index);
            const isToday = date.toDateString() === new Date().toDateString();
            
            const steps = weeklySteps[index] || 0;
            const barHeightPercentage = Math.min((steps / MAX_GOAL) * 100, 100);
            
            // Format steps to '1.2k' format if > 1000
            const stepsFormatted = steps >= 1000 ? `${(steps / 1000).toFixed(1)}k` : steps.toString();

            return (
              <View key={index} className="items-center justify-end h-full">
                {/* Steps Number Above Bar */}
                <Text className="text-black/40 text-[9px] font-kanit font-bold mb-1">
                  {stepsFormatted}
                </Text>

                {/* Progress Bar */}
                <View className="w-6 h-full justify-end items-center bg-black/5 rounded-full overflow-hidden mb-2">
                  <View 
                    style={{ height: `${barHeightPercentage}%`, width: '100%' }} 
                    className={`rounded-full ${isToday ? 'bg-black' : 'bg-black/40'}`} 
                  />
                </View>

                {/* Day Letter */}
                <Text className={`text-[10px] font-bold font-kanit uppercase ${isToday ? 'text-black' : 'text-black/40'}`}>
                  {date.toLocaleDateString('en-US', { weekday: 'narrow' })}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
