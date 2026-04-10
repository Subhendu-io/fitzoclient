import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Camera, Image, ChevronRight, UtensilsCrossed, AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuthStore } from '@/store/useAuthStore';
import { getDietHistory } from '../services/foodAnalysisService';

interface DietAnalyzerCardProps {
  showScanOptions?: boolean;
}

export function DietAnalyzerCard({ showScanOptions = false }: DietAnalyzerCardProps) {
  const colors = useThemeColors();
  const router = useRouter();
  const user = useAuthStore(s => s.user);

  const [calories, setCalories] = useState<number | null>(null);
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchLastMeal() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }
      try {
        const history = await getDietHistory(user.uid, { limit: 1, offset: 0 });
        if (history && history.length > 0) {
          setCalories(history[0].totalCalories);
          setIsHealthy(history[0].isHealthy);
        }
      } catch (err) {
        console.log('[DietAnalyzerCard] error fetching last meal:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchLastMeal();
  }, [user?.uid]);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push('/(tabs)/(health)/food-analysis')}
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
        <View className="items-end ml-4">
          {loading ? (
             <ActivityIndicator color={colors.warning} size="small" className="my-2" />
          ) : calories !== null ? (
            <>
              <View className="flex-row items-baseline">
                <Text className="text-text text-2xl font-black font-kanit">{calories}</Text>
                <Text className="text-text-secondary text-xs font-bold font-kanit ml-1 uppercase">Kcal</Text>
              </View>
              <View className="flex-row items-center mt-1">
                {isHealthy ? (
                  <CheckCircle2 {...({ size: 10, stroke: '#10b981', fill: '#10b981' } as any)} />              
                ) : (
                  <AlertTriangle {...({ size: 10, stroke: '#ef4444', fill: '#ef4444' } as any)} />
                )}
                <Text 
                  style={{ color: isHealthy ? '#10b981' : '#ef4444' }}
                  className="text-[10px] font-bold font-kanit uppercase ml-1"
                >
                  {isHealthy ? 'Healthy' : 'Limit'}
                </Text>
              </View>
            </>
          ) : (
            <Text className="text-text-secondary text-xl font-bold font-kanit">--</Text>
          )}
        </View>
      </View>

      {showScanOptions ? (
        <View
          className="flex-row mt-5 pt-5 border-t border-border"
          style={{ gap: 10 }}
        >
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center py-3 rounded-2xl"
            style={{ backgroundColor: colors.warning, gap: 8 }}
            onPress={() => router.push({ pathname: '/(tabs)/(health)/food-analysis', params: { source: 'camera' } })}
            activeOpacity={0.8}
          >
            <Camera {...({ size: 16, stroke: colors.text } as any)} />
            <Text className="font-bold font-kanit text-sm text-text">Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center py-3 rounded-2xl"
            style={{ backgroundColor: colors.warning + '15', gap: 8 }}
            onPress={() => router.push({ pathname: '/(tabs)/(health)/food-analysis', params: { source: 'gallery' } })}
            activeOpacity={0.8}
          >
            <Image {...({ size: 16, stroke: colors.warning } as any)} />
            <Text className="font-bold font-kanit text-sm text-orange-500">Gallery</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="mt-5 pt-5 border-t border-border flex-row items-center justify-between">
          <Text className="text-text-secondary text-[11px] font-bold font-kanit uppercase tracking-wider">
            View Diet Timeline
          </Text>
          <ChevronRight {...({ size: 16, stroke: colors.warning, opacity: 0.8 } as any)} />
        </View>
      )}
    </TouchableOpacity>
  );
}
