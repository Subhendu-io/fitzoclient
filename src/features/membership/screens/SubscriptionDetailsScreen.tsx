import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CreditCard, Calendar, History } from 'lucide-react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Header } from '@/components/layout/Header';
import { useAuthStore } from '@/store/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import { getMemberSubscriptions } from '@/services/memberService';
import { useMemberLink } from '@/hooks/useMemberLink';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useThemeColors } from '@/hooks/useThemeColors';

export function SubscriptionDetailsScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { activeGym, activeBranchId } = useAuthStore();
  const { data: memberLink } = useMemberLink();
  const [filter, setFilter] = useState<'current' | 'expired'>('current');

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['subscriptions', activeGym, activeBranchId, memberLink?.id],
    queryFn: () => getMemberSubscriptions(activeGym!, memberLink!.id, activeBranchId || undefined),
    enabled: !!activeGym && !!memberLink?.id,
  });

  const activeSubscription = subscriptions.find(s => s.status === 'active');

  const filteredSubscriptions = subscriptions.filter(s => {
    if (filter === 'current') {
      return (s.status === 'active' || s.status === 'upcoming') && s.id !== activeSubscription?.id;
    }
    return s.status === 'expired' || s.status === 'cancelled' || s.status === 'suspended';
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return colors.primary;
      case 'upcoming': return '#60A5FA';
      case 'expired': return '#F87171';
      default: return '#9CA3AF';
    }
  };

  if (isLoading) {
    return (
      <ScreenWrapper className="bg-background" backgroundVariant="default">
        <Header title="Membership" showBackButton />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper className="bg-background" backgroundVariant="default">
      <Header
        title="Membership"
        showBackButton
        rightElement={
          <TouchableOpacity
            onPress={() => router.push('/payment-history')}
            className="p-2.5 bg-card rounded-full border border-border"
            activeOpacity={0.7}
          >
            <History size={18} stroke={colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView className="flex-1 px-6 pb-20" showsVerticalScrollIndicator={false}>
        {/* Active Subscription Hero Card */}
        {activeSubscription && (
          <Animated.View entering={FadeInUp} className="mt-6 mb-8">
            <View
              className="rounded-[32px] p-6 overflow-hidden border border-border"
              style={{ backgroundColor: colors.primary }}
            >
              <View className="flex-row justify-between items-start mb-5">
                <View
                  className="p-3.5 rounded-2xl"
                  style={{ backgroundColor: colors.onPrimary + '20' }}
                >
                  <CreditCard size={26} stroke={colors.onPrimary} />
                </View>
                <View
                  className="py-1.5 px-3 rounded-full"
                  style={{ backgroundColor: colors.onPrimary + '25' }}
                >
                  <Text
                    className="text-[10px] font-black uppercase tracking-wider"
                    style={{ color: colors.onPrimary }}
                  >
                    Active
                  </Text>
                </View>
              </View>

              <Text
                className="text-2xl font-black font-kanit mb-1"
                style={{ color: colors.onPrimary }}
                numberOfLines={2}
              >
                {activeSubscription.plan?.name || 'Exclusive Plan'}
              </Text>
              <Text
                className="font-kanit mb-6 opacity-90"
                style={{ color: colors.onPrimary, fontSize: 13 }}
              >
                Valid until {format(new Date(activeSubscription.endDate), 'MMM dd, yyyy')}
              </Text>

              <View className="flex-row gap-3">
                <View
                  className="flex-1 rounded-2xl p-4"
                  style={{ backgroundColor: colors.onPrimary + '15' }}
                >
                  <Text
                    className="text-[10px] font-bold uppercase mb-1 opacity-80"
                    style={{ color: colors.onPrimary }}
                  >
                    Price
                  </Text>
                  <Text
                    className="text-lg font-black font-kanit"
                    style={{ color: colors.onPrimary }}
                  >
                    ₹{activeSubscription.plan?.price?.toLocaleString() || '0'}
                  </Text>
                </View>
                <View
                  className="flex-1 rounded-2xl p-4"
                  style={{ backgroundColor: colors.onPrimary + '15' }}
                >
                  <Text
                    className="text-[10px] font-bold uppercase mb-1 opacity-80"
                    style={{ color: colors.onPrimary }}
                  >
                    Duration
                  </Text>
                  <Text
                    className="text-lg font-black font-kanit"
                    style={{ color: colors.onPrimary }}
                  >
                    {activeSubscription.plan?.duration || '0'} days
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Section + Tabs */}
        <Text className="text-text-secondary text-xs font-bold uppercase tracking-widest mb-3">
          Other plans
        </Text>
        <View className="flex-row bg-card p-1.5 rounded-2xl mb-6 border border-border">
          <TouchableOpacity
            onPress={() => setFilter('current')}
            className={`flex-1 py-3 items-center rounded-xl ${filter === 'current' ? '' : ''}`}
            style={filter === 'current' ? { backgroundColor: colors.primary } : undefined}
            activeOpacity={0.8}
          >
            <Text
              className="font-bold font-kanit text-sm"
              style={{ color: filter === 'current' ? colors.onPrimary : colors.textSecondary }}
            >
              Upcoming
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilter('expired')}
            className={`flex-1 py-3 items-center rounded-xl ${filter === 'expired' ? '' : ''}`}
            style={filter === 'expired' ? { backgroundColor: colors.primary } : undefined}
            activeOpacity={0.8}
          >
            <Text
              className="font-bold font-kanit text-sm"
              style={{ color: filter === 'expired' ? colors.onPrimary : colors.textSecondary }}
            >
              Expired
            </Text>
          </TouchableOpacity>
        </View>

        {/* Subscription List */}
        <View className="gap-4">
          {filteredSubscriptions.length > 0 ? (
            filteredSubscriptions.map((sub, i) => (
              <Animated.View key={sub.id} entering={FadeInUp.delay(i * 80)}>
                <View className="bg-card border border-border rounded-3xl p-5 flex-row items-center">
                  <View
                    className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                    style={{ backgroundColor: colors.primary + '15' }}
                  >
                    <CreditCard size={20} stroke={colors.primary} />
                  </View>
                  <View className="flex-1 min-w-0">
                    <Text className="text-text text-base font-bold font-kanit" numberOfLines={1}>
                      {sub.plan?.name || 'Membership Plan'}
                    </Text>
                    <View className="flex-row items-center mt-1.5">
                      <Calendar size={12} stroke={colors.muted} />
                      <Text className="text-text-secondary text-xs font-kanit ml-2">
                        {format(new Date(sub.startDate), 'MMM dd')} – {format(new Date(sub.endDate), 'MMM dd')}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end ml-3">
                    <Text className="text-primary text-sm font-bold font-kanit">
                      ₹{sub.plan?.price?.toLocaleString() || '0'}
                    </Text>
                    <View
                      style={{ backgroundColor: getStatusColor(sub.status) + '22' }}
                      className="py-0.5 px-2 rounded-lg mt-1"
                    >
                      <Text
                        style={{ color: getStatusColor(sub.status) }}
                        className="text-[9px] font-black uppercase tracking-wider"
                      >
                        {sub.status}
                      </Text>
                    </View>
                  </View>
                </View>
              </Animated.View>
            ))
          ) : (
            <View className="py-16 items-center px-4">
              <View
                className="w-16 h-16 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: colors.muted + '20' }}
              >
                <History size={32} stroke={colors.muted} />
              </View>
              <Text className="text-text font-kanit font-semibold text-center">
                No {filter} plans
              </Text>
              <Text className="text-text-secondary text-sm font-kanit mt-1 text-center">
                {filter === 'current'
                  ? 'You don’t have any upcoming subscriptions.'
                  : 'No expired or cancelled plans to show.'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
