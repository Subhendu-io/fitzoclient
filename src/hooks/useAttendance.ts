import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { markAttendance } from '../services/memberService';
import { useAuthStore } from '../store/useAuthStore';

export const useAttendance = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuthStore();
  const tenantId = profile?.activeGym;
  const branchId = profile?.activeBranchId;

  // Mutation to mark attendance
  const markPresent = useMutation({
    mutationFn: async (memberId: string) => {
      if (!tenantId) throw new Error('Not authenticated');
      return markAttendance(tenantId, memberId, branchId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });

  return {
    markPresent,
  };
};
