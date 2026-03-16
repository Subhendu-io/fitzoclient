import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Receipt, CreditCard, Banknote, Landmark, Wallet, Filter, ChevronRight, CheckCircle2, XCircle, AlertCircle } from 'lucide-react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Header } from '@/components/layout/Header';
import { useAuthStore } from '@/store/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import { getMemberPayments } from '@/services/memberService';
import { useMemberLink } from '@/hooks/useMemberLink';
import { Payment } from '@/interfaces/member';
import { format } from 'date-fns';
import Animated, { FadeInUp } from 'react-native-reanimated';

export function PaymentHistoryScreen() {
  const { activeGym, activeBranchId } = useAuthStore();
  const { data: memberLink } = useMemberLink();
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'failed'>('all');

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments', activeGym, activeBranchId, memberLink?.id, filter],
    queryFn: async () => {
      const all = await getMemberPayments(activeGym!, memberLink!.id, 50, activeBranchId || undefined);
      if (filter === 'all') return all;
      return all.filter((p: Payment) => p.status === filter);
    },
    enabled: !!activeGym && !!memberLink?.id,
  });

  const totalPaid = payments
    .filter((p: Payment) => p.status === 'paid')
    .reduce((sum: number, p: Payment) => sum + p.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#C8FF32';
      case 'pending': return '#FBBF24';
      case 'failed': return '#F87171';
      default: return '#9CA3AF';
    }
  };

  const getMethodIcon = (method: string) => {
    const props = { size: 18, stroke: "#C8FF32" } as any;
    switch (method) {
      case 'upi': return <Wallet {...props} />;
      case 'card': return <CreditCard {...props} />;
      case 'cash': return <Banknote {...props} />;
      case 'bank_transfer': return <Landmark {...props} />;
      default: return <Receipt {...props} />;
    }
  };

  if (isLoading) {
    return (
      <ScreenWrapper className="bg-background">
        <Header title="Transactions" showBackButton />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#C8FF32" size="large" />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper className="bg-background">
      <Header title="Transactions" showBackButton />
      
      <ScrollView className="flex-1 px-6 pb-20" showsVerticalScrollIndicator={false}>
        {/* Investment Summary */}
        <Animated.View entering={FadeInUp} className="mt-6 mb-8">
           <View className="bg-card border border-white/5 rounded-[40px] p-8">
              <Text className="text-text-secondary text-xs font-black uppercase tracking-widest mb-2">Total Invested</Text>
              <Text className="text-white text-4xl font-black font-kanit mb-4">₹{totalPaid.toLocaleString()}</Text>
              <View className="flex-row items-center bg-white/5 rounded-2xl py-2 px-4 self-start">
                 <CheckCircle2 {...({ size: 14, stroke: "#C8FF32" } as any)} />
                 <Text className="text-text-secondary text-xs font-bold ml-2">{payments.length} Transactions</Text>
              </View>
           </View>
        </Animated.View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6 mb-8">
           <View className="flex-row space-x-3">
             {['all', 'paid', 'pending', 'failed'].map((opt) => (
               <TouchableOpacity 
                 key={opt}
                 onPress={() => setFilter(opt as any)}
                 className={`py-2.5 px-6 rounded-full border ${filter === opt ? 'bg-primary border-primary' : 'bg-transparent border-white/10'}`}
               >
                 <Text className={`font-bold font-kanit ${filter === opt ? 'text-black' : 'text-text-secondary'}`}>
                   {opt.toUpperCase()}
                 </Text>
               </TouchableOpacity>
             ))}
           </View>
        </ScrollView>

        {/* Payment History List */}
        <View className="space-y-4">
           {payments.length > 0 ? (
             payments.map((p: Payment, i: number) => (
               <Animated.View key={p.id} entering={FadeInUp.delay(i * 50)}>
                 <View className="bg-card border border-white/5 rounded-3xl p-6 flex-row items-center">
                    <View className="w-12 h-12 rounded-2xl bg-white/5 items-center justify-center mr-4">
                       {getMethodIcon(p.paymentMethod || '')}
                    </View>
                    <View className="flex-1">
                       <Text className="text-white font-bold font-kanit uppercase tracking-tighter">
                         {p.paymentMethod?.replace('_', ' ') || 'Payment'}
                       </Text>
                       <Text className="text-text-secondary text-[10px] font-kanit mt-1">
                         {format(new Date(p.paymentDate), 'MMM dd, yyyy • HH:mm')}
                       </Text>
                    </View>
                    <View className="items-end">
                       <Text className="text-white font-black font-kanit">₹{p.amount.toLocaleString()}</Text>
                       <View 
                         style={{ backgroundColor: `${getStatusColor(p.status || 'pending')}20` }}
                         className="py-0.5 px-2 rounded-lg mt-1"
                       >
                         <Text style={{ color: getStatusColor(p.status || 'pending') }} className="text-[8px] font-black uppercase tracking-wider">
                           {p.status}
                         </Text>
                       </View>
                    </View>
                 </View>
               </Animated.View>
             ))
           ) : (
             <View className="py-20 items-center">
                <Receipt {...({ size: 48, stroke: "#374151" } as any)} />
                <Text className="text-text-secondary font-kanit mt-4">No records found for "{filter}".</Text>
             </View>
           )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
