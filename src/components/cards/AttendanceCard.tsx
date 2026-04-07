import React from 'react';
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { QrCode, ChevronRight } from 'lucide-react-native';
import { Attendance } from '@/interfaces/member';
import { parseAttendanceTimestamp } from '@/utils/attendanceUtils';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';

interface AttendanceCardProps {
  weekAttendance: Attendance[];
  startOfWeek: Date;
  isLoading?: boolean;
}

const DAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function AttendanceCard({ weekAttendance, startOfWeek, isLoading }: AttendanceCardProps) {
  const colors = useThemeColors();
  const router = useRouter();

  function hasAttendanceOnDate(date: Date): boolean {
    return weekAttendance.some((att) => {
      const d = parseAttendanceTimestamp(att.punchedAt || att.timestamp);
      return (
        d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate()
      );
    });
  }

  function isTodayDate(date: Date): boolean {
    return date.toDateString() === new Date().toDateString();
  }

  function buildTwoWeekDates(): Date[] {
    const origin = new Date(startOfWeek);
    origin.setDate(origin.getDate() - 7);
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(origin);
      d.setDate(origin.getDate() + i);
      return d;
    });
  }

  function renderScanRow() {
    return (
      <TouchableOpacity
        onPress={() => router.push('/scanner')}
        activeOpacity={0.8}
        className="flex-row items-center justify-between mb-4"
      >
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-full bg-black/10 items-center justify-center mr-4">
            <QrCode {...({ size: 24, stroke: 'white' } as any)} />
          </View>
          <View>
            <Text className="text-white text-xl font-bold font-kanit">Scan QR Code</Text>
            <Text className="text-white/60 text-xs font-kanit">Self check-in for your session</Text>
          </View>
        </View>
        <ChevronRight {...({ size: 20, stroke: '#ffffff', opacity: 0.5 } as any)} />
      </TouchableOpacity>
    );
  }

  function renderDot(date: Date, key: number) {
    const attended = hasAttendanceOnDate(date);
    const today = isTodayDate(date);

    const circleStyle = attended
      ? 'bg-white'
      : today
      ? 'border-2 border-white/40'
      : 'bg-white/5';

    const textStyle = attended
      ? 'text-primary'
      : today
      ? 'text-white'
      : 'text-white/30';

    return (
      <View key={key} className={`w-9 h-9 rounded-full items-center justify-center ${circleStyle}`}>
        <Text className={`text-[10px] font-bold font-kanit ${textStyle}`}>
          {date.getDate()}
        </Text>
      </View>
    );
  }

  function renderGrid() {
    const dates = buildTwoWeekDates();
    const week1 = dates.slice(0, 7);
    const week2 = dates.slice(7, 14);

    return (
      <View>
        <Text className="text-white/60 text-[10px] font-bold font-kanit uppercase mb-4 tracking-widest text-center">
          Activity · Last 2 Weeks
        </Text>

        {/* Single weekday header row */}
        <View className="flex-row justify-between px-1 mb-2">
          {DAY_HEADERS.map((d, i) => (
            <View key={i} className="w-9 items-center">
              <Text className="text-white/35 text-[10px] font-bold font-kanit uppercase">{d}</Text>
            </View>
          ))}
        </View>

        {/* Previous week */}
        <View className="flex-row justify-between px-1 mb-3">
          {week1.map((date, i) => renderDot(date, i))}
        </View>

        {/* Current week */}
        <View className="flex-row justify-between px-1">
          {week2.map((date, i) => renderDot(date, i))}
        </View>
      </View>
    );
  }

  const colorScheme = useColorScheme(); // 'light' | 'dark' | null
  const isDark = colorScheme === 'dark';

  return (
    <LinearGradient
      colors={isDark ? ['#5e3ed8', '#a886d8'] : ['#3da83a', '#d3f687']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 40, padding: 24, marginBottom: 24, overflow: 'hidden' }}
    >
      {renderScanRow()}
      <View className="h-[1px] bg-white/5 w-full mb-4" />
      {renderGrid()}
    </LinearGradient>
  );
}
