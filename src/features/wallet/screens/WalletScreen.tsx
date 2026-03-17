import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Header } from '@/components/layout/Header';
import {
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Receipt,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { useMemberLink } from '@/hooks/useMemberLink';
import { getMemberSubscriptions, getMemberPayments } from '../services/walletService';
import { Subscription, Payment } from '@/interfaces/member';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Skeleton } from '@/components/ui/Skeleton';
import { useThemeColors } from '@/hooks/useThemeColors';

export function WalletScreen() {
  const colors = useThemeColors();
  const { profile } = useAuthStore();
  const { data: memberLink } = useMemberLink();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'plans' | 'payments'>('plans');

  const activeSubscription = subscriptions.find(s => s.status === 'active');

  useEffect(() => {
    const loadWalletData = async () => {
      if (!profile?.activeGym || !memberLink?.id) return;

      try {
        setLoading(true);
        const [subs, pays] = await Promise.all([
          getMemberSubscriptions(profile.activeGym!, memberLink.id, profile.activeBranchId),
          getMemberPayments(profile.activeGym!, memberLink.id, 50, profile.activeBranchId)
        ]);
        setSubscriptions(subs);
        setPayments(pays);
      } catch (error) {
        console.error('Wallet load error:', error);
        Alert.alert('Error', 'Failed to load wallet information');
      } finally {
        setLoading(false);
      }
    };

    loadWalletData();
  }, [profile, memberLink?.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-primary';
      case 'paid': return 'text-primary';
      case 'expired': return 'text-text-secondary';
      case 'failed': return 'text-red-500';
      case 'pending': return 'text-yellow-500';
      default: return 'text-text-secondary';
    }
  };

  if (loading) {
    return (
      <ScreenWrapper className="bg-background px-6">
        <Header title="My Wallet" showBackButton />
        <Skeleton width="100%" height={240} borderRadius={32} className="mb-8" />
        <View className="flex-row space-x-4 mb-6">
           <Skeleton width="48%" height={50} borderRadius={16} />
           <Skeleton width="48%" height={50} borderRadius={16} />
        </View>
        <View className="space-y-4">
           {[1, 2, 3, 4].map(i => (
             <Skeleton key={i} width="100%" height={80} borderRadius={24} />
           ))}
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper className="bg-background">
      <Header title="My Wallet" showBackButton />
      
      <ScrollView 
        className="flex-1 px-6" 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Active Plan Card */}
        {activeSubscription ? (
          <Animated.View 
            entering={FadeInDown.delay(200)}
            className="bg-card p-6 rounded-[32px] border border-stone-200/5 dark:border-stone-900/5 mb-8 overflow-hidden"
          >
            <View className="flex-row justify-between items-start mb-6">
              <View className="bg-primary/10 p-4 rounded-2xl">
                <Award {...({ size: 24, stroke: colors.primary } as any)} />
              </View>
              <View className="bg-primary px-3 py-1 rounded-full">
                <Text className="text-black text-[10px] font-bold font-kanit uppercase">Active</Text>
              </View>
            </View>

            <Text className="text-text text-2xl font-bold font-kanit mb-1">
              {activeSubscription.plan?.name}
            </Text>
            <Text className="text-text-secondary text-sm font-kanit mb-6">
              Membership expires on {formatDate(activeSubscription.endDate)}
            </Text>

            <View className="flex-row items-center justify-between pt-6 border-t border-stone-200/5 dark:border-stone-900/5">
              <View>
                <Text className="text-text-secondary text-[10px] font-bold font-kanit uppercase mb-1">Price</Text>
                <Text className="text-text text-lg font-bold font-kanit">₹{activeSubscription.plan?.price?.toLocaleString()}</Text>
              </View>
              <View className="items-end">
                <Text className="text-text-secondary text-[10px] font-bold font-kanit uppercase mb-1">Started</Text>
                <Text className="text-text text-lg font-bold font-kanit">{formatDate(activeSubscription.startDate)}</Text>
              </View>
            </View>
          </Animated.View>
        ) : (
          <Animated.View 
            entering={FadeInDown.delay(200)}
            className="bg-card p-8 rounded-[32px] border border-stone-200/5 dark:border-stone-900/5 mb-8 items-center"
          >
            <AlertCircle {...({ size: 48, stroke: colors.muted } as any)} />
            <Text className="text-text text-lg font-bold font-kanit mt-4">No Active Plan</Text>
            <Text className="text-text-secondary text-sm font-kanit text-center mt-1">
              Contact your gym manager to subscribe.
            </Text>
          </Animated.View>
        )}

        {/* Tab Switcher */}
        <View className="flex-row bg-card p-1.5 rounded-2xl border border-stone-200/5 dark:border-stone-900/5 mb-6">
          <TouchableOpacity 
            onPress={() => setActiveTab('plans')}
            className={`flex-1 py-3 items-center rounded-xl ${activeTab === 'plans' ? 'bg-white/10' : ''}`}
          >
            <Text className={`font-bold font-kanit ${activeTab === 'plans' ? 'text-primary' : 'text-text-secondary'}`}>
              Plans
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab('payments')}
            className={`flex-1 py-3 items-center rounded-xl ${activeTab === 'payments' ? 'bg-white/10' : ''}`}
          >
            <Text className={`font-bold font-kanit ${activeTab === 'payments' ? 'text-primary' : 'text-text-secondary'}`}>
              Payments
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content List */}
        <View className="space-y-4">
          {activeTab === 'plans' ? (
            subscriptions.filter(s => s.status !== 'active').length > 0 ? (
              subscriptions.filter(s => s.status !== 'active').map((sub, i) => (
                <Animated.View 
                  key={sub.id}
                  entering={FadeInUp.delay(300 + (i * 100))}
                  className="bg-card p-5 rounded-3xl border border-stone-200/5 dark:border-stone-900/5 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center space-x-4">
                    <View className="bg-white/5 p-3 rounded-xl ml-2">
                      <Clock {...({ size: 20, stroke: colors.muted } as any)} />
                    </View>
                    <View className="ml-2">
                       <Text className="text-text font-bold font-kanit">{sub.plan?.name}</Text>
                       <Text className="text-text-secondary text-xs font-kanit">Ended {formatDate(sub.endDate)}</Text>
                    </View>
                  </View>
                  <Text className={`font-bold font-kanit ${getStatusColor(sub.status)} uppercase text-[10px]`}>
                    {sub.status}
                  </Text>
                </Animated.View>
              ))
            ) : (
              <Text className="text-text-secondary text-center py-10 font-kanit">No plan history found.</Text>
            )
          ) : (
            payments.length > 0 ? (
              payments.map((pay, i) => (
                <Animated.View 
                  key={pay.id}
                  entering={FadeInUp.delay(300 + (i * 100))}
                  className="bg-card p-5 rounded-3xl border border-stone-200/5 dark:border-stone-900/5 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center space-x-4">
                    <View className="bg-white/5 p-3 rounded-xl ml-2">
                      <Receipt {...({ size: 20, stroke: colors.muted } as any)} />
                    </View>
                    <View className="ml-2">
                       <Text className="text-text font-bold font-kanit uppercase">{pay.paymentMethod || 'Payment'}</Text>
                       <Text className="text-text-secondary text-xs font-kanit">{formatDate(pay.paymentDate)}</Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-text font-bold font-kanit">₹{pay.amount.toLocaleString()}</Text>
                    <Text className={`font-bold font-kanit ${getStatusColor(pay.status || 'paid')} uppercase text-[10px]`}>
                      {pay.status || 'PAID'}
                    </Text>
                  </View>
                </Animated.View>
              ))
            ) : (
              <Text className="text-text-secondary text-center py-10 font-kanit">No payment history found.</Text>
            )
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
