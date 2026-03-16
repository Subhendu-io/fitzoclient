import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, ActivityIndicator } from 'react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Header } from '@/components/layout/Header';
import { CalendarView } from '../components/CalendarView';
import { getMemberAttendance } from '@/services/memberService';
import { useAuthStore } from '@/store/useAuthStore';
import { Attendance } from '@/interfaces/member';

export function AttendanceCalendarScreen() {
  const { user } = useAuthStore();
  const [records, setRecords] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // In a real app, tenantId/memberId would come from context
  // For now using placeholders or identifying from user
  const tenantId = 'fitzo-dev'; // Should be dynamic
  const memberId = user?.uid || ''; // Should be the member record ID

  const fetchAttendance = async (date: Date) => {
    if (!memberId) return;
    
    setIsLoading(true);
    try {
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const data = await getMemberAttendance(tenantId, memberId, startOfMonth, endOfMonth);
      setRecords(data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance(selectedDate);
  }, [selectedDate, memberId]);

  return (
    <ScreenWrapper className="bg-background">
      <Header title="Attendance Calendar" showBackButton />
      <ScrollView className="flex-1 px-6 py-4">
        <View className="mb-6">
          <Text className="text-2xl font-extrabold text-white font-kanit mb-1">
            Activity <Text className="text-primary">Tracking</Text>
          </Text>
          <Text className="text-text-secondary text-sm font-kanit">
            Your monthly gym visit history
          </Text>
        </View>

        <CalendarView 
          records={records} 
          isLoading={isLoading} 
          onMonthChange={setSelectedDate}
        />
        
        {isLoading && (
          <View className="mt-8">
            <ActivityIndicator color="#C8FF32" />
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
