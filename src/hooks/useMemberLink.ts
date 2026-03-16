import { useQuery } from '@tanstack/react-query';
import { getMemberByUid } from '../services/memberService';
import { useAuthStore } from '../store/useAuthStore';

export const useMemberLink = () => {
  const { profile, user } = useAuthStore();
  const tenantId = profile?.activeGym;
  const uid = user?.uid;

  return useQuery({
    queryKey: ['memberLink', tenantId, uid],
    queryFn: () => {
      if (!tenantId || !uid) return null;
      return getMemberByUid(tenantId, uid);
    },
    enabled: !!tenantId && !!uid,
  });
};
