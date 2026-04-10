import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Zap, ChevronRight, Activity, Camera, Image } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuthStore } from '@/store/useAuthStore';
import { getFitnessHistory } from '../services/fitnessScoreService';

interface FitnessScoreCardProps {
  showScanOptions?: boolean;
}

export function FitnessScoreCard({ showScanOptions = false }: FitnessScoreCardProps) {
  const colors = useThemeColors();
  const router = useRouter();
  const user = useAuthStore(s => s.user);
  
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchLastScore() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }
      try {
        const history = await getFitnessHistory(user.uid);
        if (history && history.length > 0) {
          setScore(history[0].score);
        }
      } catch (err) {
        console.log('[FitnessScoreCard] error fetching last score:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchLastScore();
  }, [user?.uid]);

  return (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPress={() => router.push('/(tabs)/(health)/fitness-score')}
      className="bg-card border border-stone-200/5 dark:border-stone-900/5 rounded-3xl p-6 mb-6 overflow-hidden"
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
          {loading ? (
             <ActivityIndicator color={colors.primary} size="small" className="my-2" />
          ) : score !== null ? (
            <>
              <View className="flex-row items-baseline">
                <Text className="text-text text-3xl font-black font-kanit">{score}</Text>
                <Text className="text-primary text-lg font-bold font-kanit ml-1">%</Text>
              </View>
              <View className="flex-row items-center">
                <Zap {...({ size: 10, stroke: colors.primary, fill: colors.primary } as any)} />
                <Text className="text-primary text-[10px] font-bold font-kanit uppercase ml-1">
                  {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Focus'}
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
          className="flex-row mt-5 pt-5 border-t border-border dark:border-border"
          style={{ gap: 10 }}
        >
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center py-3 rounded-2xl"
            style={{ backgroundColor: colors.primary, gap: 8 }}
            onPress={() => router.push({ pathname: '/(tabs)/(health)/fitness-score', params: { source: 'camera' } } as any)}
            activeOpacity={0.8}
          >
            <Camera {...({ size: 16, stroke: 'black' } as any)} />
            <Text className="font-bold font-kanit text-sm text-black">Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center py-3 rounded-2xl"
            style={{ backgroundColor: colors.primary + '15', gap: 8 }}
            onPress={() => router.push({ pathname: '/(tabs)/(health)/fitness-score', params: { source: 'gallery' } } as any)}
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
