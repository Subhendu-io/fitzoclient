import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Header } from '@/components/layout/Header';
import { Ticket, History as HistoryIcon, User, Calendar, Clock, ChevronRight } from 'lucide-react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import { getMemberSessionPlans, getMemberRedemptionHistory } from '@/services/memberService';
import { useMemberLink } from '@/hooks/useMemberLink';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useThemeColors } from '@/hooks/useThemeColors';

export function SessionDetailsScreen() {
  const colors = useThemeColors();
  const { activeGym, activeBranchId } = useAuthStore();
  const { data: memberLink } = useMemberLink();
  const [refreshing, setRefreshing] = useState(false);

  const { data: plans = [], isLoading: loadingPlans, refetch: refetchPlans } = useQuery({
    queryKey: ['sessionPlans', activeGym, activeBranchId, memberLink?.id],
    queryFn: () => getMemberSessionPlans(activeGym!, memberLink!.id, activeBranchId || undefined),
    enabled: !!activeGym && !!memberLink?.id,
  });

  const { data: history = [], isLoading: loadingHistory, refetch: refetchHistory } = useQuery({
    queryKey: ['redemptionHistory', activeGym, activeBranchId, memberLink?.id],
    queryFn: () => getMemberRedemptionHistory(activeGym!, memberLink!.id, 20, activeBranchId || undefined),
    enabled: !!activeGym && !!memberLink?.id,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchPlans(), refetchHistory()]);
    setRefreshing(false);
  };

  const formatDateTime = (value?: string) => {
    if (!value) return '—';
    const date = new Date(value);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <ScreenWrapper className="bg-background">
      <Header title="My Sessions" showBackButton />
      
      <ScrollView 
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Active Plans Section */}
        <View className="flex-row items-center mt-6 mb-4">
          <Ticket {...({ size: 20, stroke: colors.primary } as any)} />
          <Text className="text-text text-lg font-bold font-kanit ml-2">Active Plans</Text>
        </View>

        {loadingPlans ? (
          <ActivityIndicator color={colors.primary} className="py-10" />
        ) : plans.length > 0 ? (
          <View className="space-y-4">
            {plans.map((plan, i) => (
              <Animated.View 
                key={plan.id}
                entering={FadeInDown.delay(i * 100)}
                className="bg-card p-6 rounded-[32px] border border-stone-200/5 dark:border-stone-900/5"
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1 mr-4">
                    <Text className="text-text text-xl font-bold font-kanit mb-1">{plan.planName}</Text>
                    <Text className="text-text-secondary text-xs font-kanit">
                      {plan.redeemedSessions} of {plan.totalSessions} sessions used
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-primary text-3xl font-bold font-kanit">{plan.leftClasses}</Text>
                    <Text className="text-text-secondary text-[10px] font-bold font-kanit uppercase">Left</Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View className="h-1.5 w-full bg-white/5 rounded-full mt-6 overflow-hidden">
                  <View 
                    className="h-full bg-primary" 
                    style={{ width: `${(plan.redeemedSessions / plan.totalSessions) * 100}%` }} 
                  />
                </View>

                <View className="flex-row justify-between items-center mt-6">
                  <View className={`px-3 py-1 rounded-full ${plan.status === 'active' ? 'bg-primary/10' : 'bg-white/5'}`}>
                    <Text className={`text-[10px] font-bold font-kanit uppercase ${plan.status === 'active' ? 'text-primary' : 'text-text-secondary'}`}>
                      {plan.status}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>
        ) : (
          <View className="bg-card p-8 rounded-[32px] border border-stone-200/5 dark:border-stone-900/5 items-center">
            <Text className="text-text-secondary font-kanit text-center">No active session plans found.</Text>
          </View>
        )}

        {/* Redemption History Section */}
        <View className="flex-row items-center mt-10 mb-4">
          <HistoryIcon {...({ size: 20, stroke: colors.primary } as any)} />
          <Text className="text-text text-lg font-bold font-kanit ml-2">Redemption History</Text>
        </View>

        {loadingHistory ? (
          <ActivityIndicator color={colors.primary} className="py-10" />
        ) : history.length > 0 ? (
          <View className="space-y-4 pb-20">
            {history.map((item, i) => (
              <Animated.View 
                key={item.id}
                entering={FadeInUp.delay(i * 50)}
                className="bg-card p-5 rounded-3xl border border-stone-200/5 dark:border-stone-900/5 flex-row items-center"
              >
                <View className="w-10 h-10 rounded-2xl bg-white/5 items-center justify-center mr-4">
                   <User {...({ size: 18, stroke: colors.primary } as any)} />
                </View>
                <View className="flex-1">
                   <Text className="text-text font-bold font-kanit mb-1">Trainer: {item.trainerName}</Text>
                   <View className="flex-row items-center">
                      <Clock {...({ size: 10, stroke: colors.muted } as any)} />
                      <Text className="text-text-secondary text-[10px] font-kanit ml-1">
                        {formatDateTime(item.redeemedAt)}
                      </Text>
                   </View>
                </View>
                <Text className="text-primary text-[10px] font-bold font-kanit uppercase">
                  #{item.receiptNumber.slice(-6).toUpperCase()}
                </Text>
              </Animated.View>
            ))}
          </View>
        ) : (
          <View className="bg-card p-8 rounded-[32px] border border-stone-200/5 dark:border-stone-900/5 items-center mb-20">
            <Text className="text-text-secondary font-kanit text-center">No redemption history yet.</Text>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
