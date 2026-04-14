import React, { useEffect, useState } from 'react';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { ComparisonCard } from './ComparisonCard';
import { useStepStore } from '@/store/useStepStore';
import { getTotalStepsForPeriod } from '@/services/stepTrackingService';
import { startOfWeek, startOfDay } from 'date-fns';

interface StepComparisonCardProps {
  delay?: number;
}

export function StepComparisonCard({ delay = 350 }: StepComparisonCardProps) {
  const { todayTotalSteps } = useStepStore();
  const [thisWeekTotal, setThisWeekTotal] = useState(0);

  useEffect(() => {
    const fetchWeeklyStats = async () => {
      const now = new Date();
      const startOfCurrentWeek = startOfWeek(now, { weekStartsOn: 1 }); // Monday start
      
      const endOfYesterday = startOfDay(now);
      endOfYesterday.setMilliseconds(endOfYesterday.getMilliseconds() - 1);
      
      let historicalThisWeek = 0;
      if (now > startOfCurrentWeek) {
        historicalThisWeek = await getTotalStepsForPeriod(startOfCurrentWeek, endOfYesterday);
      }
      
      setThisWeekTotal(historicalThisWeek);
    };
    
    fetchWeeklyStats();
  }, []);

  const activeThisWeekTotal = thisWeekTotal + todayTotalSteps;

  return (
    <Animated.View entering={FadeInUp.delay(delay)} className="mb-4">
      <ComparisonCard
        left={{
          backgroundColor: '#957eff',
          color: '#ffffff',
          header: 'Today',
          description: `${todayTotalSteps} steps`,
        }}
        right={{
          backgroundColor: '#95d548',
          color: '#2a4d00',
          header: 'This Week',
          description: `${activeThisWeekTotal} steps`,
        }}
      />
    </Animated.View>
  );
}
