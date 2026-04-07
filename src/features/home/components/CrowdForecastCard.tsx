import React from 'react';
import { View, Text } from 'react-native';
import { Users, Info, Sun, CloudSun, Cloud, CloudLightning, HelpCircle } from 'lucide-react-native';
import { CrowdForecast, CrowdBand } from '@/interfaces/member';
import { useThemeColors } from '@/hooks/useThemeColors';

interface CrowdForecastCardProps {
  forecast: CrowdForecast | null;
}

export function CrowdForecastCard({ forecast }: CrowdForecastCardProps) {
  const colors = useThemeColors();
  const getBandColor = (band: CrowdBand) => {
    switch (band) {
      case 'quiet': return 'text-green-400';
      case 'moderate': return 'text-blue-400';
      case 'busy': return 'text-orange-400';
      case 'peak': return 'text-red-400';
      default: return 'text-primary';
    }
  };

  const getBandIcon = (band: CrowdBand) => {
    switch (band) {
      case 'quiet': return <Sun {...({ size: 24, stroke: "#4ADE80" } as any)} />;
      case 'moderate': return <CloudSun {...({ size: 24, stroke: "#60A5FA" } as any)} />;
      case 'busy': return <Cloud {...({ size: 24, stroke: colors.warning } as any)} />;
      case 'peak': return <CloudLightning {...({ size: 24, stroke: "#F87171" } as any)} />;
      default: return <HelpCircle {...({ size: 24, stroke: colors.muted } as any)} />;
    }
  };

  if (!forecast) {
    return (
      <View className="bg-card border border-stone-200/5 dark:border-stone-900/5 rounded-3xl p-8 mb-6 items-center justify-center">
        <View className="w-12 h-12 rounded-full bg-white/5 items-center justify-center mb-4">
          <Users {...({ size: 24, stroke: colors.primary, opacity: 0.5 } as any)} />
        </View>
        <Text className="text-text text-center font-bold font-kanit mb-1">Gym Traffic</Text>
        <Text className="text-text-secondary text-center text-xs font-kanit px-4">
          Not enough attendance data yet to forecast crowd levels. Check back soon!
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-card border border-stone-200/5 dark:border-stone-900/5 rounded-3xl p-6 mb-6">
      <View className="flex-row justify-between items-start mb-8">
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-white/5 items-center justify-center mr-3">
            <Users {...({ size: 20, stroke: colors.primary } as any)} />
          </View>
          <View>
            <Text className="text-text text-lg font-bold font-kanit">Gym Traffic</Text>
            <Text className="text-text-secondary text-[10px] font-kanit uppercase">Live Forecast</Text>
          </View>
        </View>
        <View className="bg-white/5 px-3 py-1.5 rounded-full flex-row items-center">
          <Info {...({ size: 12, stroke: colors.primary, opacity: 0.6 } as any)} />
          <Text className="text-text-secondary text-[10px] font-bold font-kanit uppercase ml-1.5">
            {forecast.confidence} confidence
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between mb-8">
        <View>
          <View className="flex-row items-center">
            <Text className="text-text text-5xl font-black font-kanit">
              {forecast.currentCapacityPercent}%
            </Text>
            <View className="ml-4 items-center">
               {getBandIcon(forecast.currentBand)}
               <Text className={`text-xs mt-1 ${getBandColor(forecast.currentBand)} font-bold font-kanit uppercase`}>
                 {forecast.currentBand}
               </Text>
            </View>
          </View>
          <Text className="text-text-secondary text-[11px] font-kanit mt-2">
            {forecast.currentCheckInsThisHour} members checked in this hour
          </Text>
        </View>
      </View>

      {forecast.trendSeries.length > 0 && (
        <View className="flex-row items-end justify-between h-20 mb-8 space-x-1">
          {forecast.trendSeries.map((point) => {
            const maxCount = Math.max(...forecast.trendSeries.map(p => Math.max(p.todayCount, p.typicalCount)), 1);
            const todayHeight = (point.todayCount / maxCount) * 100;
            const typicalHeight = (point.typicalCount / maxCount) * 100;
            
            return (
              <View key={point.hour24} className="flex-1 items-center">
                <View className="w-full flex-row justify-center items-end h-full space-x-0.5">
                  <View 
                    style={{ height: `${typicalHeight}%` }} 
                    className="w-1.5 bg-white/10 rounded-t-full" 
                  />
                  <View 
                    style={{ height: `${todayHeight}%` }} 
                    className="w-1.5 bg-primary rounded-t-full" 
                  />
                </View>
                <Text className="text-[8px] text-text-secondary font-bold font-kanit mt-2">
                  {point.hourLabel.split(' ')[0]}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      <View className="bg-primary/10 rounded-2xl p-4 flex-row items-center">
        <View className="w-8 h-8 rounded-full bg-primary/20 items-center justify-center mr-3">
          <Text className="text-[14px]">💡</Text>
        </View>
        <View className="flex-1">
          <Text className="text-text text-[10px] font-bold font-kanit uppercase">Best Next Window</Text>
          <Text className="text-primary text-xs font-bold font-kanit">
            {forecast.nextBestWindows[0] || 'N/A'}
          </Text>
        </View>
      </View>
    </View>
  );
}
