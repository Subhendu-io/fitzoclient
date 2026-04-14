import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useStepStore } from '@/store/useStepStore';
import { getHistoricalSteps, getTodayDateString } from '@/services/stepTrackingService';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';

interface AchievementCardProps {
  startOfWeek?: Date; // Left here for backwards API compat if needed
}

const MAX_GOAL = 10000;

export function AchievementCard({ startOfWeek = new Date() }: AchievementCardProps) {
  const colors = useThemeColors();
  const router = useRouter();
  
  const { todayTotalSteps, isAvailable, hasPermissions } = useStepStore();
  
  const [weeklySteps, setWeeklySteps] = useState<number[]>(Array(7).fill(0));
  const [dates, setDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWeeklyHistory = async () => {
      try {
        setIsLoading(true);
        // We want the last 7 days ending today
        const today = new Date();
        const startOfRange = startOfDay(subDays(today, 6)); // 6 days ago + today = 7 days
        const endOfRange = endOfDay(today);

        // Calculate the Date objects for the x-axis
        const last7Dates = Array.from({ length: 7 }).map((_, i) => subDays(today, 6 - i));
        setDates(last7Dates);

        // Fetch from Firebase
        const historical = await getHistoricalSteps(startOfRange, endOfRange);
        
        // Map data to the correct day index
        const stepsMap = new Map<string, number>();
        historical.forEach(entry => {
          stepsMap.set(entry.dateString, entry.steps);
        });

        // Construct numeric array
        const stepsArray = last7Dates.map(date => {
          const dateStr = format(date, 'yyyy-MM-dd');
          
          // Override today's slot with the live tracker if it's the current date
          if (dateStr === getTodayDateString()) {
            return todayTotalSteps;
          }
          
          return stepsMap.get(dateStr) || 0;
        });

        setWeeklySteps(stepsArray);
      } catch (error) {
        console.error("Failed to load historical steps:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeeklyHistory();
  }, [todayTotalSteps]); // Re-evaluate if today's steps change so the bar goes up live!

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
            {hasPermissions === false ? (
              <Text className="text-white/80 text-xs font-kanit">Pedometer access required</Text>
            ) : (
               <Text className="text-white/60 text-xs font-kanit">{todayTotalSteps} steps today</Text>
            )}
          </View>
        </View>
        <ChevronRight {...({ size: 20, stroke: '#ffffff', opacity: 0.5 } as any)} />
      </TouchableOpacity>

      {/* Divider */}
      <View className="h-[1px] bg-black/5 w-full mb-6" />

      {/* Weekly Steps Representation */}
      <View>
        <View className="flex-row justify-between items-end px-2 h-20 mt-2">
          {isLoading ? (
            <View className="w-full h-full items-center justify-center">
              <ActivityIndicator color="rgba(255,255,255,0.5)" />
            </View>
          ) : (
            dates.map((date, index) => {
              const isToday = format(date, 'yyyy-MM-dd') === getTodayDateString();
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
            })
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

