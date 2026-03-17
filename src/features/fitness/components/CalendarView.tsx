import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronLeft, ChevronRight, Activity } from 'lucide-react-native';
import { getDateStringFromTimestamp } from '@/utils/attendanceUtils';
import { Attendance } from '@/interfaces/member';
import { useThemeColors } from '@/hooks/useThemeColors';

interface CalendarViewProps {
  records: Attendance[];
  onMonthChange?: (date: Date) => void;
  isLoading?: boolean;
}

export function CalendarView({ records, onMonthChange, isLoading }: CalendarViewProps) {
  const colors = useThemeColors();
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const attendanceDates = useMemo(() => {
    return new Set(records.map(r => getDateStringFromTimestamp(r.punchedAt || r.timestamp)));
  }, [records]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentMonth - 1);
    } else {
      newDate.setMonth(currentMonth + 1);
    }
    setCurrentDate(newDate);
    onMonthChange?.(newDate);
  };

  const renderDays = () => {
    const days = [];
    const today = new Date().toDateString();

    // Empty cells
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<View key={`empty-${i}`} className="w-[14.28%] aspect-square" />);
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isToday = date.toDateString() === today;
      const dateStr = getDateStringFromTimestamp(date);
      const hasAttended = attendanceDates.has(dateStr);

      days.push(
        <TouchableOpacity
          key={day}
          className={`w-[14.28%] aspect-square items-center justify-center rounded-xl mb-1 ${
            isToday ? 'bg-primary' : hasAttended ? 'bg-primary/20' : ''
          }`}
        >
          <Text className={`font-kanit text-sm ${
            isToday ? 'text-black font-bold' : hasAttended ? 'text-primary font-bold' : 'text-text-secondary'
          }`}>
            {day}
          </Text>
          {hasAttended && !isToday && (
            <View className="absolute bottom-1.5 w-1 h-1 rounded-full bg-primary" />
          )}
        </TouchableOpacity>
      );
    }
    return days;
  };

  return (
    <View className="bg-card border border-stone-200/5 dark:border-stone-900/5 rounded-[40px] p-6">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-text text-lg font-bold font-kanit">
          {months[currentMonth]} {currentYear}
        </Text>
        <View className="flex-row space-x-2">
          <TouchableOpacity 
            onPress={() => navigateMonth('prev')}
            className="p-2 bg-white/5 rounded-full"
          >
            <ChevronLeft {...({ size: 20, stroke: colors.primary } as any)} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => navigateMonth('next')}
            className="p-2 bg-white/5 rounded-full"
          >
            <ChevronRight {...({ size: 20, stroke: colors.primary } as any)} />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row mb-4">
        {daysOfWeek.map(day => (
          <View key={day} className="flex-1 items-center">
            <Text className="text-[10px] text-text-secondary font-bold font-kanit uppercase">{day}</Text>
          </View>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {renderDays()}
      </View>

      <View className="mt-6 pt-6 border-t border-stone-200/5 dark:border-stone-900/5 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
            <Activity {...({ size: 18, stroke: colors.primary } as any)} />
          </View>
          <View>
             <Text className="text-text text-base font-bold font-kanit">{records.length}</Text>
             <Text className="text-text-secondary text-[10px] font-kanit uppercase">Check-ins this month</Text>
          </View>
        </View>
        <TouchableOpacity className="bg-primary/10 px-4 py-2 rounded-xl">
           <Text className="text-primary text-[10px] font-bold font-kanit uppercase">View Stats</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
