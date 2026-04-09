import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Header } from '@/components/layout/Header';
import { Receipt, Search, Download, Calendar, ExternalLink } from 'lucide-react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import { getMemberPayments } from '../services/walletService';
import { useMemberLink } from '@/hooks/useMemberLink';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useThemeColors } from '@/hooks/useThemeColors';

export function PaymentHistoryScreen() {
  const colors = useThemeColors();
  const { activeGym, activeBranchId } = useAuthStore();
  const { data: memberLink } = useMemberLink();
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'failed'>('all');

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments', activeGym, activeBranchId, memberLink?.id],
    queryFn: () => getMemberPayments(activeGym!, memberLink!.id, 50, activeBranchId || undefined),
    enabled: !!activeGym && !!memberLink?.id,
  });

  const filteredPayments = payments.filter(p => filter === 'all' || p.status === filter);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return colors.primary;
      case 'failed': return '#EF4444';
      case 'pending': return '#F59E0B';
      default: return colors.muted;
    }
  };

  if (isLoading) {
    return (
      <ScreenWrapper className="bg-background">
        <Header title="Payment History" showBackButton />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper className="bg-background">
      <Header title="Receipts" showBackButton />

      {/* Stats Summary */}
      <View className="px-6 pt-4 mb-6">
        <Animated.View 
          entering={FadeInDown}
          className="flex-row bg-card rounded-3xl border border-stone-200/5 dark:border-stone-900/5 p-5 items-center justify-between"
        >
          <View>
            <Text className="text-text-secondary text-xs font-bold font-kanit uppercase tracking-widest mb-1">
              Total Spent
            </Text>
            <Text className="text-text text-3xl font-black font-kanit">
              ₹{payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
            </Text>
          </View>
          <View className="w-14 h-14 rounded-full bg-primary/10 items-center justify-center">
            <Receipt {...({ size: 24, stroke: colors.primary } as any)} />
          </View>
        </Animated.View>
      </View>

      {/* Filters */}
      <View className="px-6 mb-6">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row" contentContainerStyle={{ paddingRight: 20 }}>
          {['all', 'paid', 'pending', 'failed'].map((f, i) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f as any)}
              className={`px-5 py-2.5 rounded-full border mr-3 ${
                filter === f 
                  ? 'bg-primary border-primary' 
                  : 'bg-card border-border dark:border-stone-800'
              }`}
            >
              <Text className={`font-bold font-kanit capitalize ${
                filter === f ? 'text-black' : 'text-text-secondary'
              }`}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView className="flex-1 px-6 pb-12" showsVerticalScrollIndicator={false}>
        <View className="space-y-4">
          {filteredPayments.length > 0 ? (
            filteredPayments.map((payment, i) => (
              <Animated.View 
                key={payment.id} 
                entering={FadeInUp.delay(i * 50)}
                className="bg-card p-5 rounded-3xl border border-stone-200/5 dark:border-stone-900/5"
              >
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-row items-center flex-1 pr-4">
                    <View className="w-12 h-12 rounded-2xl bg-white/5 items-center justify-center mr-4">
                      <Receipt {...({ size: 20, stroke: colors.text } as any)} />
                    </View>
                    <View>
                      <Text className="text-text font-bold font-kanit text-base uppercase">
                        {payment.paymentMethod || 'Payment'}
                      </Text>
                      <Text className="text-text-secondary text-xs font-kanit mt-0.5 max-w-[200px]" numberOfLines={1}>
                         {payment.transactionId ? `INV-${payment.transactionId.slice(-6).toUpperCase()}` : 'Invoice'}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-text text-lg font-black font-kanit">
                      ₹{payment.amount.toLocaleString()}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <View className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: getStatusColor(payment.status || 'paid') }} />
                      <Text 
                        className="text-[10px] font-bold font-kanit uppercase tracking-wider"
                        style={{ color: getStatusColor(payment.status || 'paid') }}
                      >
                        {payment.status || 'Paid'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="flex-row items-center justify-between border-t border-stone-200/5 dark:border-stone-900/5 pt-4 mt-2">
                  <View className="flex-row items-center">
                    <Calendar {...({ size: 12, stroke: colors.muted } as any)} />
                    <Text className="text-text-secondary text-xs font-kanit ml-1.5">
                      {formatDateTime(payment.paymentDate)}
                    </Text>
                  </View>
                  
                  {payment.receiptUrl && (
                    <TouchableOpacity 
                      className="flex-row items-center bg-primary/10 px-3 py-1.5 rounded-full"
                      onPress={() => Linking.openURL(payment.receiptUrl!)}
                    >
                      <Download {...({ size: 12, stroke: colors.primary } as any)} />
                      <Text className="text-primary text-[10px] font-bold font-kanit uppercase tracking-wider ml-1">Receipt</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Animated.View>
            ))
          ) : (
            <View className="py-20 items-center justify-center px-4">
              <View className="w-16 h-16 rounded-full bg-white/5 items-center justify-center mb-4">
                <Search {...({ size: 24, stroke: colors.muted } as any)} />
              </View>
              <Text className="text-text font-bold font-kanit text-lg">No payments found</Text>
              <Text className="text-text-secondary font-kanit text-center mt-1">
                You don't have any {filter !== 'all' ? filter : ''} payments to show.
              </Text>
            </View>
          )}
        </View>
        <View className="h-10" />
      </ScrollView>
    </ScreenWrapper>
  );
}
