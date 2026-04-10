import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import Animated, { FadeIn } from 'react-native-reanimated';
import { FoodAssessment, FoodAssessmentEntry, getDietHistory } from '../services/foodAnalysisService';
import { SecureImage } from '@/components/ui/SecureImage';
import { Plus } from 'lucide-react-native';

interface LastDietResultsProps {
  onSelectResult: (result: FoodAssessment) => void;
}

export function LastDietResults({ onSelectResult }: LastDietResultsProps) {
  const user = useAuthStore(s => s.user);
  const colors = useThemeColors();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [entries, setEntries] = useState<FoodAssessmentEntry[]>([]);
  const [hasMore, setHasMore] = useState(true);

  // Initial load
  useEffect(() => {
    async function loadHistory() {
      if (!user?.uid) return;
      try {
        const history = await getDietHistory(user.uid, { limit: 3, offset: 0 });
        setEntries(history);
        if (history.length < 3) {
          setHasMore(false);
        }
      } catch (err) {
        console.log('[LastDietResults] fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    
    loadHistory();
  }, [user?.uid]);

  const loadMore = async () => {
    if (!user?.uid || loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const history = await getDietHistory(user.uid, { limit: 5, offset: entries.length });
      if (history.length > 0) {
        setEntries(prev => [...prev, ...history]);
      }
      if (history.length < 5) {
        setHasMore(false);
      }
    } catch (err) {
      console.log('[LastDietResults] loadMore error:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <View className="items-center py-6">
        <ActivityIndicator color={colors.primary} size="small" />
      </View>
    );
  }

  if (entries.length === 0) {
    return null; // Return empty space seamlessly if no history exists yet
  }

  return (
    <Animated.View entering={FadeIn}>
      <Text className="text-text font-black font-kanit text-lg mb-4">Past Meals Analyzed</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 16, paddingRight: 24 }}
      >
        {entries.map((entry, idx) => (
          <TouchableOpacity
            key={`${entry.createdAt}-${idx}`}
            onPress={() => onSelectResult(entry)}
            activeOpacity={0.8}
            className="w-36 bg-card border border-stone-200/5 dark:border-stone-900/5 rounded-3xl overflow-hidden shadow-sm shadow-black/5"
          >
            {entry.imageUrl ? (
              <SecureImage 
                uri={entry.imageUrl} 
                className="w-full h-24 bg-stone-100 dark:bg-stone-800" 
                resizeMode="cover" 
              />
            ) : (
              <View className="w-full h-24 bg-stone-100 dark:bg-stone-800 items-center justify-center">
                <Text className="text-text-secondary font-kanit text-xs">No Image</Text>
              </View>
            )}
            
            <View className="p-4 items-center">
              <Text 
                className="font-black font-kanit text-2xl"
                style={{ color: entry.isHealthy ? '#10b981' : '#ef4444' }}
              >
                {entry.totalCalories}
              </Text>
              <Text className="text-text-secondary text-[10px] font-kanit uppercase mt-1 text-center" numberOfLines={1}>
                {entry.date}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {hasMore && (
          <TouchableOpacity
            onPress={loadMore}
            activeOpacity={0.8}
            className="w-36 bg-card border border-stone-200/5 dark:border-stone-900/5 rounded-3xl overflow-hidden shadow-sm shadow-black/5 items-center justify-center p-6"
          >
            {loadingMore ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center mb-3">
                  <Plus {...({ size: 24, stroke: colors.primary } as any)} />
                </View>
                <Text className="text-text font-black font-kanit text-center">Load More</Text>
                <Text className="text-text-secondary text-[10px] font-kanit uppercase mt-1 text-center">View 5 more</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </Animated.View>
  );
}
