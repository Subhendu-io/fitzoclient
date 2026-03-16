import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { QrCode, ChevronRight } from 'lucide-react-native';
import { Attendance } from '@/interfaces/member';
import { parseAttendanceTimestamp } from '@/utils/attendanceUtils';
import { useRouter } from 'expo-router';

interface HeroCardProps {
  weekAttendance: Attendance[];
  startOfWeek: Date;
  isLoading?: boolean;
}

export function HeroCard({ weekAttendance, startOfWeek, isLoading }: HeroCardProps) {
  const router = useRouter();

  return (
    <View className="bg-primary rounded-[40px] p-6 mb-6 overflow-hidden">
      {/* Scan Row */}
      <TouchableOpacity 
        onPress={() => router.push('/scanner')}
        activeOpacity={0.8}
        className="flex-row items-center justify-between mb-8"
      >
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-full bg-black/10 items-center justify-center mr-4">
            <QrCode {...({ size: 24, stroke: "black" } as any)} />
          </View>
          <View>
            <Text className="text-black text-xl font-bold font-kanit">Scan QR Code</Text>
            <Text className="text-black/60 text-xs font-kanit">Self check-in for your session</Text>
          </View>
        </View>
        <ChevronRight {...({ size: 20, stroke: "black", opacity: 0.5 } as any)} />
      </TouchableOpacity>

      {/* Divider */}
      <View className="h-[1px] bg-black/5 w-full mb-8" />

      {/* Weekly Attendance Strip */}
      <View>
        <Text className="text-black/60 text-[10px] font-bold font-kanit uppercase mb-4 tracking-widest text-center">
          Activity This Week
        </Text>
        <View className="flex-row justify-between px-2">
          {Array.from({ length: 7 }).map((_, index) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + index);
            const isToday = date.toDateString() === new Date().toDateString();

            const hasAttendance = weekAttendance.some((att) => {
              const d = parseAttendanceTimestamp(att.punchedAt || att.timestamp);
              return (
                d.getFullYear() === date.getFullYear() &&
                d.getMonth() === date.getMonth() &&
                d.getDate() === date.getDate()
              );
            });

            return (
              <View key={index} className="items-center">
                <Text className="text-black/40 text-[10px] font-bold font-kanit mb-3 uppercase">
                  {date.toLocaleDateString('en-US', { weekday: 'narrow' })}
                </Text>
                <View 
                  className={`w-9 h-9 rounded-full items-center justify-center ${
                    hasAttendance 
                      ? 'bg-black' 
                      : isToday 
                        ? 'border-2 border-black/30' 
                        : 'bg-black/5'
                  }`}
                >
                  <Text className={`text-[11px] font-bold font-kanit ${
                    hasAttendance ? 'text-primary' : isToday ? 'text-black' : 'text-black/30'
                  }`}>
                    {date.getDate()}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
