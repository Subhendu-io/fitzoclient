import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CreditCard, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react-native';
import { Subscription } from '@/interfaces/member';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';

interface MembershipCardProps {
  subscription: Subscription | null;
  daysRemaining: number | null;
  isLoading?: boolean;
}

export function MembershipCard({ subscription, daysRemaining, isLoading }: MembershipCardProps) {
  const colors = useThemeColors();
  const router = useRouter();

  if (isLoading) {
    return (
      <View className="bg-card border border-stone-200/5 dark:border-stone-900/5 rounded-3xl p-6 mb-6 h-40 items-center justify-center">
        <Text className="text-text-secondary font-kanit">Loading membership...</Text>
      </View>
    );
  }

  if (!subscription) {
    return (
      <View className="bg-card border border-stone-200/5 dark:border-stone-900/5 rounded-3xl p-6 mb-6">
        <View className="flex-row items-center mb-4">
          <View className="w-10 h-10 rounded-full bg-white/5 items-center justify-center mr-3">
            <CreditCard {...({ size: 20, stroke: colors.primary } as any)} />
          </View>
          <Text className="text-text text-lg font-bold font-kanit">No Active Plan</Text>
        </View>
        <Text className="text-text-secondary text-xs font-kanit mb-4 leading-tight">
          You don't have an active membership yet. Contact your gym to get started.
        </Text>
        <TouchableOpacity 
          onPress={() => router.push('/(settings)/help')}
          className="bg-primary py-3 rounded-2xl items-center"
        >
          <Text className="text-black font-bold font-kanit">Contact Support</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isExpiringSoon = daysRemaining !== null && daysRemaining <= 7;
  const isExpired = daysRemaining !== null && daysRemaining <= 0;

  return (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPress={() => router.push('/(settings)/subscription-details')}
      className={`bg-card border ${isExpiringSoon ? 'border-orange-500/50' : 'border-stone-200/5 dark:border-stone-900/5'} rounded-3xl p-6 mb-6`}
    >
      <View className="flex-row justify-between items-start mb-6">
        <View className="flex-row items-center">
          <View className={`w-10 h-10 rounded-full ${isExpiringSoon ? 'bg-orange-500/10' : 'bg-primary/10'} items-center justify-center mr-3`}>
            {isExpired ? (
              <AlertCircle {...({ size: 20, stroke: colors.error } as any)} />
            ) : (
              <CreditCard {...({ size: 20, stroke: isExpiringSoon ? colors.warning : colors.primary } as any)} />
            )}
          </View>
          <View>
            <Text className="text-text text-lg font-bold font-kanit">
              {subscription.plan?.name || 'Active Membership'}
            </Text>
            <Text className="text-text-secondary text-[10px] font-kanit uppercase tracking-wider">
              {subscription.status}
            </Text>
          </View>
        </View>
        <View className={`px-3 py-1 rounded-full ${isExpired ? 'bg-red-500/10' : isExpiringSoon ? 'bg-orange-500/10' : 'bg-green-500/10'}`}>
          <Text className={`text-[10px] font-bold font-kanit uppercase ${isExpired ? 'text-red-400' : isExpiringSoon ? 'text-orange-400' : 'text-green-400'}`}>
            {isExpired ? 'Expired' : 'Active'}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between items-end">
        <View>
          <Text className="text-text-secondary text-[10px] font-kanit uppercase mb-1">Days Remaining</Text>
          <View className="flex-row items-baseline">
            <Text className={`text-4xl font-black font-kanit ${isExpiringSoon ? 'text-orange-400' : 'text-text'}`}>
              {daysRemaining !== null ? Math.max(0, daysRemaining) : '--'}
            </Text>
            <Text className="text-text-secondary text-sm font-kanit ml-2">days left</Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-text-secondary text-[10px] font-kanit uppercase mb-1">Valid Till</Text>
          <Text className="text-text font-bold font-kanit text-sm">
            {subscription.endDate ? format(new Date(subscription.endDate), 'MMM dd, yyyy') : 'N/A'}
          </Text>
        </View>
      </View>

      {isExpiringSoon && !isExpired && (
        <View className="mt-4 pt-4 border-t border-stone-200/5 dark:border-stone-900/5 flex-row items-center">
          <AlertCircle {...({ size: 14, stroke: colors.warning } as any)} />
          <Text className="text-orange-400 text-[11px] font-bold font-kanit ml-2">
            Renewal recommended soon to avoid interruption
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
