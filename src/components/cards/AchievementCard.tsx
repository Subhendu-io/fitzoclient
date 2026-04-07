import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';

interface AchievementCardProps {
  weeklySteps?: number[]; // Array of 7 numbers representing steps from Monday to Sunday, or customized start
  startOfWeek?: Date;
}

// Temporary default mock data for steps
const MOCK_STEPS = [4500, 7200, 10500, 3100, 8900, 12000, 6400];
const MAX_GOAL = 10000;

export function AchievementCard({ weeklySteps = MOCK_STEPS, startOfWeek = new Date() }: AchievementCardProps) {
  const colors = useThemeColors();
  const router = useRouter();

  return (
    <LinearGradient
      colors={['#3da83a', '#d3f687']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 40, padding: 24, marginBottom: 24, overflow: 'hidden' }}
    >
      {/* Top Banner Row */}
      <TouchableOpacity 
        onPress={() => router.push('/(main)/achievements' as any)}
        activeOpacity={0.8}
        className="flex-row items-center justify-between mb-8"
      >
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-full bg-black/10 items-center justify-center mr-4">
            <Trophy {...({ size: 24, stroke: '#ffffff' } as any)} />
          </View>
          <View>
            <Text className="text-white text-xl font-bold font-kanit">Today's Achievements</Text>
            <Text className="text-white/60 text-xs font-kanit">Check your daily fitness progress</Text>
          </View>
        </View>
        <ChevronRight {...({ size: 20, stroke: '#ffffff', opacity: 0.5 } as any)} />
      </TouchableOpacity>

      {/* Divider */}
      <View className="h-[1px] bg-black/5 w-full mb-6" />

      {/* Weekly Steps Representation */}
      <View>
        {/* <Text className="text-white/60 text-[10px] font-bold font-kanit uppercase mb-4 tracking-widest text-center">
          Steps This Week
        </Text> */}
        
        <View className="flex-row justify-between items-end px-2 h-20 mt-8">
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
                <Text className="text-white/50 text-[9px] font-kanit font-bold mb-1">
                  {stepsFormatted}
                </Text>

                {/* Progress Bar */}
                <View className="w-6 h-full justify-end items-center bg-white/10 rounded-full overflow-hidden mb-2">
                  <View 
                    style={{ height: `${barHeightPercentage}%`, width: '100%' }} 
                    className={`rounded-full ${isToday ? 'bg-white' : 'bg-white/40'}`} 
                  />
                </View>

                {/* Day Letter */}
                <Text className={`text-[10px] font-bold font-kanit uppercase ${isToday ? 'text-white' : 'text-white/40'}`}>
                  {date.toLocaleDateString('en-US', { weekday: 'narrow' })}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </LinearGradient>
  );
}
