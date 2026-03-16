import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWorkoutAssignments } from '../services/memberService';
import { useAuthStore } from '../store/useAuthStore';
import { useMemberLink } from './useMemberLink';

export const useWorkouts = () => {
  const { profile } = useAuthStore();
  const { data: memberLink } = useMemberLink();
  const tenantId = profile?.activeGym;
  const branchId = profile?.activeBranchId;
  const memberId = memberLink?.id;

  return useQuery({
    queryKey: ['workouts', tenantId, branchId, memberId],
    queryFn: () => {
      if (!tenantId || !memberId) return [];
      return getWorkoutAssignments(tenantId, memberId, branchId);
    },
    enabled: !!tenantId && !!memberId,
  });
};
