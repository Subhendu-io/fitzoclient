import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Header } from '@/components/layout/Header';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Flame, 
  Trophy,
  History,
  Dumbbell
} from 'lucide-react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { useMemberLink } from '@/hooks/useMemberLink';
import { useRouter } from 'expo-router';
import { getMemberAttendance, getWorkoutHistory } from '../services/historyService';
import { Attendance, MemberWorkoutAssignment } from '@/interfaces/member';
import { getDateStringFromTimestamp, parseAttendanceTimestamp } from '@/utils/attendanceUtils';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export function WorkoutHistoryScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const { data: memberLink } = useMemberLink();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [workouts, setWorkouts] = useState<MemberWorkoutAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      if (!profile?.activeGym || !memberLink?.id) return;

      try {
        setLoading(true);
        const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

        const [attRecords, workRecords] = await Promise.all([
          getMemberAttendance(profile.activeGym, memberLink.id, startOfMonth, endOfMonth, 100, profile.activeBranchId),
          getWorkoutHistory(profile.activeGym, memberLink.id, profile.activeBranchId)
        ]);
        
        setAttendance(attRecords);
        setWorkouts(workRecords);
      } catch (error) {
        console.error('History load error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [profile, memberLink?.id, selectedDate.getMonth(), selectedDate.getFullYear()]);

  const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();
  
  const monthName = selectedDate.toLocaleString('default', { month: 'long' });
  const year = selectedDate.getFullYear();

  const attendanceDates = useMemo(() => {
    return new Set(attendance.map(a => getDateStringFromTimestamp(a.punchedAt || a.timestamp)));
  }, [attendance]);

  const renderCalendar = () => {
    const days = [];
    const prevMonthDays = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 0).getDate();
    
    // Empty days from previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <View key={`prev-${i}`} className="w-[14.28%] aspect-square items-center justify-center opacity-20">
          <Text className="text-white text-xs font-kanit">{prevMonthDays - firstDayOfMonth + i + 1}</Text>
        </View>
      );
    }

    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hasAttended = attendanceDates.has(dateStr);
      const isToday = new Date().toDateString() === new Date(year, selectedDate.getMonth(), d).toDateString();

      days.push(
        <View key={d} className="w-[14.28%] aspect-square items-center justify-center relative">
          <View className={`w-8 h-8 items-center justify-center rounded-full ${isToday ? 'bg-primary' : ''} ${hasAttended && !isToday ? 'border border-primary/40' : ''}`}>
            <Text className={`text-xs font-kanit ${isToday ? 'text-black font-bold' : 'text-white'}`}>
              {d}
            </Text>
          </View>
          {hasAttended && (
             <View className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
          )}
        </View>
      );
    }

    return days;
  };

  const changeMonth = (offset: number) => {
    const next = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + offset, 1);
    setSelectedDate(next);
  };

  if (loading && attendance.length === 0) {
    return (
      <ScreenWrapper className="bg-background items-center justify-center">
        <ActivityIndicator color="#C8FF32" />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper className="bg-background">
      <Header title="Activity History" showBackButton />
      
      <ScrollView 
        className="flex-1 px-6" 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Row */}
        <View className="flex-row space-x-4 mb-8 mt-4">
           <View className="flex-1 bg-card p-4 rounded-3xl border border-white/5 items-center">
              <Flame {...({ size: 20, stroke: "#C8FF32" } as any)} />
              <Text className="text-white text-xl font-bold font-kanit mt-1">{attendance.length}</Text>
              <Text className="text-text-secondary text-[10px] uppercase font-bold font-kanit">Check-ins</Text>
           </View>
           <View className="flex-1 bg-card p-4 rounded-3xl border border-white/5 items-center">
              <Trophy {...({ size: 20, stroke: "#C8FF32" } as any)} />
              <Text className="text-white text-xl font-bold font-kanit mt-1">{workouts.length}</Text>
              <Text className="text-text-secondary text-[10px] uppercase font-bold font-kanit">Workouts</Text>
           </View>
        </View>

        {/* Calendar Card */}
        <Animated.View 
          entering={FadeInDown.delay(200)}
          className="bg-card p-6 rounded-[32px] border border-white/5 mb-8"
        >
           <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white font-bold font-kanit text-lg">{monthName} {year}</Text>
              <View className="flex-row space-x-2">
                 <TouchableOpacity onPress={() => changeMonth(-1)} className="p-2 bg-white/5 rounded-full">
                    <ChevronLeft {...({ size: 20, stroke: "white" } as any)} />
                 </TouchableOpacity>
                 <TouchableOpacity onPress={() => changeMonth(1)} className="p-2 bg-white/5 rounded-full">
                    <ChevronRight {...({ size: 20, stroke: "white" } as any)} />
                 </TouchableOpacity>
              </View>
           </View>

           <View className="flex-row mb-4">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <Text key={i} className="flex-1 text-center text-text-secondary text-xs font-bold font-kanit">{day}</Text>
              ))}
           </View>
           <View className="flex-row flex-wrap">
              {renderCalendar()}
           </View>
        </Animated.View>

        {/* Recent Activity List */}
        <Text className="text-white text-xl font-bold font-kanit mb-4">Recent Sessions</Text>
        <View className="space-y-4">
           {workouts.length > 0 ? (
             workouts.map((work, i) => (
               <TouchableOpacity 
                 key={work.id}
                 onPress={() => router.push(`/workout/${work.id}`)}
               >
                 <Animated.View 
                   entering={FadeInUp.delay(300 + (i * 100))}
                   className="bg-card p-5 rounded-3xl border border-white/5 flex-row items-center mb-4"
                 >
                   <View className="bg-primary/10 p-3 rounded-2xl mr-4">
                      <Dumbbell {...({ size: 24, stroke: "#C8FF32" } as any)} />
                   </View>
                   <View className="flex-1">
                      <Text className="text-white font-bold font-kanit mb-1">{work.snapshot?.title || 'Workout'}</Text>
                      <Text className="text-text-secondary text-xs font-kanit">
                         Assigned on {work.assignedAt ? new Date(work.assignedAt).toLocaleDateString() : 'N/A'}
                      </Text>
                   </View>
                   <ChevronRight {...({ size: 16, stroke: "#616161" } as any)} />
                 </Animated.View>
               </TouchableOpacity>
             ))
           ) : (
             <View className="items-center py-10">
                <History {...({ size: 40, stroke: "#616161" } as any)} />
                <Text className="text-text-secondary font-kanit mt-4">No workout records yet.</Text>
             </View>
           )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
