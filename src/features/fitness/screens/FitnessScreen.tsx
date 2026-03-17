import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Play, History } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useWorkouts } from '@/hooks/useWorkouts';
import { WorkoutItem } from '../components/WorkoutItem';

import { Skeleton } from '@/components/ui/Skeleton';
import { useThemeColors } from '@/hooks/useThemeColors';

export function FitnessScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { data: workouts, isLoading } = useWorkouts();

  const days = [
    { day: '18', label: 'Fri' },
    { day: '19', label: 'Sat', active: true },
    { day: '20', label: 'Sun' },
    { day: '21', label: 'Mon' },
    { day: '22', label: 'Tue' },
  ];

  const featuredSession = workouts?.[0];

  if (isLoading) {
    return (
      <ScreenWrapper className="bg-background px-6">
        <View className="flex-row items-center justify-between mt-6 mb-8">
           <Skeleton width="70%" height={60} borderRadius={30} />
           <Skeleton width="20%" height={40} borderRadius={10} />
        </View>

        <Skeleton width={150} height={24} className="mb-4" />
        <Skeleton width="100%" height={260} borderRadius={40} className="mb-8" />

        <View className="flex-row justify-between items-center mb-6">
           <Skeleton width={100} height={24} />
           <Skeleton width={80} height={32} borderRadius={12} />
        </View>

        <View className="space-y-4">
           {[1, 2, 3].map(i => (
             <Skeleton key={i} width="100%" height={80} borderRadius={24} />
           ))}
        </View>
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
        {/* Weekly Activity Header */}
        <Animated.View 
          entering={FadeInDown.delay(200)}
          className="mt-6 mb-8"
        >
          <TouchableOpacity 
            onPress={() => router.push('/home/attendance-calendar')}
            activeOpacity={0.7}
            className="flex-row items-center justify-between"
          >
            <View className="flex-row items-center bg-card p-2 rounded-full border border-stone-200/5 dark:border-stone-900/5 space-x-4">
               {days.map((item, i) => (
                 <View key={i} className={`items-center justify-center w-12 h-16 rounded-full ${item.active ? 'bg-primary' : ''}`}>
                    <Text className={`text-xs font-kanit ${item.active ? 'text-black font-bold' : 'text-text-secondary'}`}>{item.label}</Text>
                    <Text className={`text-sm font-bold font-kanit ${item.active ? 'text-black' : 'text-text'}`}>{item.day}</Text>
                 </View>
               ))}
            </View>
            <View className="items-end">
               <Text className="text-primary font-bold font-kanit">Activity</Text>
               <View className="flex-row space-x-1 mt-1">
                  {[1, 2, 3].map(i => <View key={i} className="w-1.5 h-1.5 rounded-full bg-primary" />)}
               </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Today's Session Card */}
        <Text className="text-text text-xl font-bold font-kanit mb-4">Today's Session</Text>
        <Animated.View 
          entering={FadeInUp.delay(400)}
          className="bg-card rounded-[40px] overflow-hidden border border-stone-200/5 dark:border-stone-900/5 mb-8"
        >
           <View className="p-6">
              <View className="bg-white/10 self-start px-3 py-1 rounded-full mb-4">
                 <Text className="text-text text-[10px] font-bold font-kanit uppercase">Day 10</Text>
              </View>
              <Text className="text-text text-2xl font-bold font-kanit mb-1">
                {featuredSession?.snapshot?.title || "Strength Training"}
              </Text>
              <Text className="text-text-secondary text-sm font-kanit mb-4">
                 {featuredSession?.snapshot?.goal || "Joyden center"}
              </Text>
              
              <View className="flex-row space-x-4">
                 <Text className="text-primary text-xs font-bold font-kanit">⚡ {featuredSession?.snapshot?.difficulty || '25 min'}</Text>
                 <Text className="text-primary text-xs font-bold font-kanit">🔥 530 kcal</Text>
              </View>
           </View>
           <View className="relative h-48 w-full">
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800' }} 
                className="w-full h-full"
              />
              <TouchableOpacity className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full items-center justify-center shadow-lg shadow-primary/40">
                 <Play {...({ size: 24, stroke: colors.onPrimary, fill: "black" } as any)} />
              </TouchableOpacity>
           </View>
        </Animated.View>

        {/* Assignments List */}
        <View className="flex-row justify-between items-center mb-6">
            <Text className="text-text text-xl font-bold font-kanit">Your Plan</Text>
            <TouchableOpacity 
              onPress={() => router.push('/fitness/workout-history')}
              className="flex-row items-center space-x-2 bg-white/5 px-4 py-2 rounded-xl"
            >
               <History {...({ size: 16, stroke: colors.primary } as any)} />
               <Text className="text-primary text-xs font-bold font-kanit uppercase ml-1">History</Text>
            </TouchableOpacity>
        </View>

        <View className="space-y-4">
            {workouts?.length === 0 && (
              <Text className="text-text-secondary font-kanit text-center py-10">No workouts assigned yet.</Text>
            )}
            {workouts?.slice(1).map((workout: any, i: number) => (
              <WorkoutItem 
                 key={workout.id}
                 title={workout.snapshot?.title} 
                 difficulty={workout.snapshot?.difficulty} 
                 delay={600 + (i * 100)}
              />
            ))}
         </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
