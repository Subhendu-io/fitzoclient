import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ticket, Calendar, User } from 'lucide-react-native';
import { MemberSessionRedemption } from '@/interfaces/member';
import { useThemeColors } from '@/hooks/useThemeColors';

interface SessionVoucherCardProps {
  redemption: MemberSessionRedemption;
}

export function SessionVoucherCard({ redemption }: SessionVoucherCardProps) {
  const colors = useThemeColors();
  const isExpired = redemption.validTill ? new Date(redemption.validTill) < new Date() : false;

  return (
    <TouchableOpacity 
      activeOpacity={0.9}
      className={`rounded-[32px] overflow-hidden border border-stone-200/5 dark:border-stone-900/5 mb-6 ${
        isExpired ? 'opacity-80' : ''
      }`}
    >
      <View className="bg-primary/10 p-6">
        <View className="flex-row justify-between items-start mb-6">
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-2xl bg-primary items-center justify-center mr-4">
              <Ticket {...({ size: 24, stroke: colors.onPrimary } as any)} />
            </View>
            <View>
              <Text className="text-text text-lg font-bold font-kanit">Active Session</Text>
              <View className="bg-primary/20 self-start px-2 py-0.5 rounded-md mt-1">
                <Text className="text-primary text-[10px] font-bold font-kanit uppercase">
                  {redemption.status || 'Active'}
                </Text>
              </View>
            </View>
          </View>
          
          <View className="items-end">
            <Text className="text-primary text-3xl font-black font-kanit">
              {redemption.leftClasses ?? '-'}
            </Text>
            <Text className="text-text-secondary text-[10px] font-kanit uppercase">Classes left</Text>
          </View>
        </View>

        <View className="flex-row space-x-6">
          <View className="flex-row items-center">
            <User {...({ size: 14, stroke: colors.primary, opacity: 0.6 } as any)} />
            <Text className="text-text-secondary text-xs font-kanit ml-2">{redemption.trainerName}</Text>
          </View>
          <View className="flex-row items-center">
            <Calendar {...({ size: 14, stroke: colors.primary, opacity: 0.6 } as any)} />
            <Text className={`text-xs font-kanit ml-2 ${isExpired ? 'text-red-400' : 'text-text-secondary'}`}>
              Valid till: {redemption.validTill ? new Date(redemption.validTill).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
        </View>
      </View>
      
      <View className="bg-white/5 px-6 py-4 flex-row justify-between items-center">
        <Text className="text-text-secondary text-[10px] font-kanit uppercase">Receipt: {redemption.receiptNumber}</Text>
        <Text className="text-primary text-[10px] font-bold font-kanit uppercase">View Details</Text>
      </View>
    </TouchableOpacity>
  );
}
