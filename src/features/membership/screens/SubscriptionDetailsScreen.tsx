import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CreditCard, Calendar, Clock, CheckCircle2, ChevronRight, AlertCircle, History } from 'lucide-react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Header } from '@/components/layout/Header';
import { useAuthStore } from '@/store/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import { getMemberSubscriptions } from '@/services/memberService';
import { useMemberLink } from '@/hooks/useMemberLink';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';

export function SubscriptionDetailsScreen() {
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
      case 'active': return '#C8FF32';
      case 'upcoming': return '#60A5FA';
      case 'expired': return '#F87171';
      default: return '#9CA3AF';
    }
  };

  if (isLoading) {
    return (
      <ScreenWrapper className="bg-background">
        <Header title="Membership" showBackButton />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#C8FF32" size="large" />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper className="bg-background">
      <Header 
        title="Membership" 
        showBackButton 
        rightElement={
          <TouchableOpacity 
            onPress={() => router.push('/payment-history')}
            className="p-2 bg-card rounded-full border border-white/5"
          >
            <History {...({ size: 18, stroke: "#C8FF32" } as any)} />
          </TouchableOpacity>
        }
      />
      
      <ScrollView className="flex-1 px-6 pb-20" showsVerticalScrollIndicator={false}>
        {/* Active Subscription Highlight */}
        {activeSubscription && (
          <Animated.View entering={FadeInUp} className="mt-6 mb-8">
            <View className="bg-primary rounded-[40px] p-8 overflow-hidden">
               <View className="flex-row justify-between items-start mb-6">
                 <View className="bg-black/10 p-4 rounded-3xl">
                   <CreditCard {...({ size: 28, stroke: "black" } as any)} />
                 </View>
                 <View className="bg-black py-1.5 px-3 rounded-full">
                   <Text className="text-primary text-[10px] font-black uppercase tracking-wider">Active</Text>
                 </View>
               </View>
               
               <Text className="text-black text-3xl font-black font-kanit mb-1">
                 {activeSubscription.plan?.name || 'Exclusive Plan'}
               </Text>
               <Text className="text-black/60 font-kanit mb-8">
                 Valid until {format(new Date(activeSubscription.endDate), 'MMM dd, yyyy')}
               </Text>

               <View className="flex-row space-x-4">
                  <View className="flex-1 bg-black/5 rounded-2xl p-4">
                    <Text className="text-black/40 text-[10px] font-bold uppercase mb-1">Price</Text>
                    <Text className="text-black text-lg font-black font-kanit">₹{activeSubscription.plan?.price?.toLocaleString() || '0'}</Text>
                  </View>
                  <View className="flex-1 bg-black/5 rounded-2xl p-4">
                    <Text className="text-black/40 text-[10px] font-bold uppercase mb-1">Duration</Text>
                    <Text className="text-black text-lg font-black font-kanit">{activeSubscription.plan?.duration || '0'} Days</Text>
                  </View>
               </View>
            </View>
          </Animated.View>
        )}

        {/* Tabs for History */}
        <View className="flex-row bg-card p-1.5 rounded-3xl mb-8">
          <TouchableOpacity 
            onPress={() => setFilter('current')}
            className={`flex-1 py-3 items-center rounded-2xl ${filter === 'current' ? 'bg-primary' : ''}`}
          >
            <Text className={`font-bold font-kanit ${filter === 'current' ? 'text-black' : 'text-text-secondary'}`}>UPCOMING</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setFilter('expired')}
            className={`flex-1 py-3 items-center rounded-2xl ${filter === 'expired' ? 'bg-primary' : ''}`}
          >
            <Text className={`font-bold font-kanit ${filter === 'expired' ? 'text-black' : 'text-text-secondary'}`}>EXPIRED</Text>
          </TouchableOpacity>
        </View>

        {/* Subscription List */}
        <View className="space-y-4">
          {filteredSubscriptions.length > 0 ? (
            filteredSubscriptions.map((sub, i) => (
              <Animated.View key={sub.id} entering={FadeInUp.delay(i * 100)}>
                <View className="bg-card border border-white/5 rounded-3xl p-6">
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-white text-lg font-bold font-kanit">{sub.plan?.name || 'Membership Plan'}</Text>
                    <View 
                      style={{ backgroundColor: `${getStatusColor(sub.status)}20` }}
                      className="py-1 px-3 rounded-full"
                    >
                      <Text style={{ color: getStatusColor(sub.status) }} className="text-[10px] font-black uppercase tracking-wider">{sub.status}</Text>
                    </View>
                  </View>
                  
                  <View className="flex-row items-center space-x-6">
                    <View className="flex-row items-center">
                      <Calendar {...({ size: 14, stroke: "#9CA3AF" } as any)} />
                      <Text className="text-text-secondary text-xs font-kanit ml-2">
                        {format(new Date(sub.startDate), 'MMM dd')} - {format(new Date(sub.endDate), 'MMM dd')}
                      </Text>
                    </View>
                    <Text className="text-primary text-sm font-bold font-kanit">₹{sub.plan?.price?.toLocaleString() || '0'}</Text>
                  </View>
                </View>
              </Animated.View>
            ))
          ) : (
            <View className="py-12 items-center">
               <History {...({ size: 48, stroke: "#374151" } as any)} />
               <Text className="text-text-secondary font-kanit mt-4">No {filter} subscriptions found.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
