import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { useMemberLink } from '@/hooks/useMemberLink';
import {
  getActiveSubscription,
  getAttendanceStreakBoard,
  getAttendanceStats,
  getCrowdForecast,
  getLatestMemberSessionRedemption,
  getMemberAttendance,
  getTenantInfo,
} from '@/services/memberService';
import { 
  Attendance,
} from '@/interfaces/member';

const getWeekRange = () => {
  const start = new Date();
  start.setDate(start.getDate() - start.getDay());
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const getSubscriptionProgress = (startDate?: string, endDate?: string) => {
  if (!startDate || !endDate) {
    return 0;
  }

  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();

  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
    return 0;
  }

  const elapsed = Math.min(Math.max(now - start, 0), end - start);
  return Math.round((elapsed / (end - start)) * 100);
};

export function useDashboard() {
  const { activeGym, activeBranchId } = useAuthStore();
  const { data: memberLink } = useMemberLink();
  const tenantId = activeGym;
  const branchId = activeBranchId || undefined;
  const memberId = memberLink?.id;
  const weekRange = useMemo(() => getWeekRange(), []);

  const tenantQuery = useQuery({
    queryKey: ['tenantInfo', tenantId],
    queryFn: () => getTenantInfo(tenantId!),
    enabled: !!tenantId,
  });

  const subscriptionQuery = useQuery({
    queryKey: ['activeSubscription', tenantId, branchId, memberId],
    queryFn: () => getActiveSubscription(tenantId!, memberId!, branchId),
    enabled: !!tenantId && !!memberId,
  });

  const streakQuery = useQuery({
    queryKey: ['streakBoard', tenantId, branchId, memberId],
    queryFn: () => getAttendanceStreakBoard(tenantId!, memberId!, 3, branchId),
    enabled: !!tenantId && !!memberId,
  });

  const redemptionQuery = useQuery({
    queryKey: ['latestRedemption', tenantId, memberId, branchId],
    queryFn: () => getLatestMemberSessionRedemption(tenantId!, memberId!, branchId),
    enabled: !!tenantId && !!memberId,
  });

  const forecastQuery = useQuery({
    queryKey: ['crowdForecast', tenantId, branchId],
    queryFn: () => getCrowdForecast(tenantId!, branchId),
    enabled: !!tenantId && !!branchId,
  });

  const statsQuery = useQuery({
    queryKey: ['attendanceStats', tenantId, memberId, branchId],
    queryFn: () => getAttendanceStats(tenantId!, memberId!, branchId),
    enabled: !!tenantId && !!memberId,
  });

  const weekAttendanceQuery = useQuery<Attendance[]>({
    queryKey: ['currentWeekAttendance', tenantId, memberId, branchId],
    queryFn: () =>
      getMemberAttendance(
        tenantId!,
        memberId!,
        weekRange.start,
        weekRange.end,
        50,
        branchId,
      ),
    enabled: !!tenantId && !!memberId,
  });

  const activeSubscription = subscriptionQuery.data;
  const daysRemaining = activeSubscription?.endDate
    ? Math.ceil((new Date(activeSubscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  const subscriptionProgress = getSubscriptionProgress(
    activeSubscription?.startDate,
    activeSubscription?.endDate,
  );

  return {
    tenantInfo: tenantQuery.data,
    activeSubscription,
    daysRemaining,
    subscriptionProgress,
    streakBoard: streakQuery.data || [],
    latestRedemption: redemptionQuery.data,
    crowdForecast: forecastQuery.data,
    attendanceStats: statsQuery.data,
    currentWeekAttendance: weekAttendanceQuery.data || [],
    weekRange,
    isLoading:
      tenantQuery.isLoading ||
      subscriptionQuery.isLoading ||
      streakQuery.isLoading ||
      redemptionQuery.isLoading ||
      forecastQuery.isLoading ||
      statsQuery.isLoading ||
      weekAttendanceQuery.isLoading,
    refetch: async () => {
      await Promise.all([
        tenantQuery.refetch(),
        subscriptionQuery.refetch(),
        weekAttendanceQuery.refetch(),
        streakQuery.refetch(),
        redemptionQuery.refetch(),
        forecastQuery.refetch(),
        statsQuery.refetch(),
      ]);
    },
    refetchQueries: {
      tenant: tenantQuery.refetch,
      subscription: subscriptionQuery.refetch,
      weekAttendance: weekAttendanceQuery.refetch,
      streakBoard: streakQuery.refetch,
      latestRedemption: redemptionQuery.refetch,
      crowdForecast: forecastQuery.refetch,
      attendanceStats: statsQuery.refetch,
    },
    isFetching:
      tenantQuery.isFetching ||
      subscriptionQuery.isFetching ||
      weekAttendanceQuery.isFetching ||
      streakQuery.isFetching ||
      redemptionQuery.isFetching ||
      forecastQuery.isFetching ||
      statsQuery.isFetching,
    hasMemberContext: !!tenantId && !!memberId,
    memberId,
    tenantId,
    branchId,
  };
}
