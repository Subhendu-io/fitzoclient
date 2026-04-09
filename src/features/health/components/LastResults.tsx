import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import Animated, { FadeIn } from 'react-native-reanimated';
import { FitnessAssessment, FitnessAssessmentEntry, getFitnessHistory } from '../services/fitnessScoreService';

interface LastResultsProps {
  onSelectResult: (result: FitnessAssessment) => void;
}

import { SecureImage } from '@/components/ui/SecureImage';

export function LastResults({ onSelectResult }: LastResultsProps) {
  const user = useAuthStore(s => s.user);
  const colors = useThemeColors();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<FitnessAssessmentEntry[]>([]);

  useEffect(() => {
    async function loadHistory() {
      if (!user?.uid) return;
      try {
        const history = await getFitnessHistory(user.uid);
        console.log(history);
        
        setEntries(history);
      } catch (err) {
        console.log('[LastResults] fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    
    loadHistory();
  }, [user?.uid]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return colors.primary;
    if (score >= 60) return '#60A5FA';
    if (score >= 40) return '#FBBF24';
    return '#F87171';
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
      <Text className="text-text font-black font-kanit text-lg mb-4">Past Assessments</Text>
      
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
                style={{ color: getScoreColor(entry.score) }}
              >
                {entry.score}
              </Text>
              <Text className="text-text-secondary text-[10px] font-kanit uppercase mt-1">
                {entry.date}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );
}
