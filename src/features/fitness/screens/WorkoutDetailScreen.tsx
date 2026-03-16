import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Header } from '@/components/layout/Header';
import { 
  Trophy, 
  TrendingUp, 
  Calendar as CalendarIcon, 
  Activity, 
  CheckCircle2,
  Info,
  Dumbbell
} from 'lucide-react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { firestore } from '@/lib/firebase';
import { MemberWorkoutAssignment } from '@/interfaces/member';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams();
  const { profile, activeGym, activeBranchId } = useAuthStore();

  const { data: assignment, isLoading } = useQuery({
    queryKey: ['workoutAssignment', id],
    queryFn: async () => {
      const doc = await firestore()
        .collection('tenants')
        .doc(activeGym!)
        .collection('branches')
        .doc(activeBranchId || 'main')
        .collection('workout_assignments')
        .doc(id as string)
        .get();
      
      if (!doc.exists()) throw new Error('Workout not found');
      return { id: doc.id, ...doc.data() } as MemberWorkoutAssignment;
    },
    enabled: !!id && !!activeGym,
  });

  if (isLoading) {
    return (
      <ScreenWrapper className="bg-background items-center justify-center">
        <ActivityIndicator color="#C8FF32" size="large" />
      </ScreenWrapper>
    );
  }

  if (!assignment) {
    return (
      <ScreenWrapper className="bg-background items-center justify-center p-6">
        <Info {...({ size: 48, stroke: "#616161" } as any)} />
        <Text className="text-white text-lg font-kanit mt-4 text-center">Workout not found or unavailable.</Text>
      </ScreenWrapper>
    );
  }

  const snapshot = assignment.snapshot;

  return (
    <ScreenWrapper className="bg-background">
      <Header title={snapshot?.title || 'Workout Details'} showBackButton />
      
      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        {/* Main Info Card */}
        <Animated.View 
          entering={FadeInDown}
          className="bg-card p-6 rounded-[32px] border border-white/5 mb-8"
        >
          <View className="flex-row items-center mb-6">
            <View className="w-14 h-14 rounded-2xl bg-primary items-center justify-center mr-4">
              <Dumbbell {...({ size: 28, stroke: "black" } as any)} />
            </View>
            <View className="flex-1">
              <Text className="text-white text-2xl font-bold font-kanit">{snapshot?.title || 'Workout Plan'}</Text>
              <View className="flex-row items-center mt-1">
                <CalendarIcon {...({ size: 12, stroke: "#C8FF32" } as any)} />
                <Text className="text-text-secondary text-xs font-kanit ml-1">
                  Assigned on {assignment.assignedAt ? new Date(assignment.assignedAt).toLocaleDateString() : 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-4">
            {snapshot?.goal && (
              <View className="bg-white/5 px-4 py-2 rounded-xl flex-row items-center">
                <Trophy {...({ size: 14, stroke: "#C8FF32" } as any)} />
                <Text className="text-white/80 text-xs font-kanit ml-2">{snapshot.goal}</Text>
              </View>
            )}
            {snapshot?.difficulty && (
              <View className="bg-white/5 px-4 py-2 rounded-xl flex-row items-center">
                <TrendingUp {...({ size: 14, stroke: "#C8FF32" } as any)} />
                <Text className="text-white/80 text-xs font-kanit ml-2">{snapshot.difficulty}</Text>
              </View>
            )}
            {snapshot?.scheduleType && (
              <View className="bg-white/5 px-4 py-2 rounded-xl flex-row items-center">
                <Activity {...({ size: 14, stroke: "#C8FF32" } as any)} />
                <Text className="text-white/80 text-xs font-kanit ml-2">{snapshot.scheduleType}</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Description Section */}
        <View className="flex-row items-center mb-4">
          <Info {...({ size: 20, stroke: "#C8FF32" } as any)} />
          <Text className="text-white text-lg font-bold font-kanit ml-2">Description</Text>
        </View>

        <Animated.View 
          entering={FadeInUp.delay(200)}
          className="bg-card p-6 rounded-[32px] border border-white/5 mb-8"
        >
          <Text className="text-white/60 font-kanit leading-6">
            {snapshot?.description && typeof snapshot.description === 'string' 
              ? snapshot.description 
              : 'Detailed exercise instructions and coaching notes for this session will be provided by your trainer during the workout.'}
          </Text>
        </Animated.View>

        {/* Completion Status */}
        <View className="items-center py-10 opacity-30">
          <CheckCircle2 {...({ size: 48, stroke: "#C8FF32" } as any)} />
          <Text className="text-text-secondary font-kanit mt-2">Program In Progress</Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
