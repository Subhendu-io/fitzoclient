import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAppUser, updateAppUser } from '../services/userService';
import { useAuthStore } from '../store/useAuthStore';

export const useUserProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const uid = user?.uid;

  const profileQuery = useQuery({
    queryKey: ['profile', uid],
    queryFn: () => {
      if (!uid) return null;
      return getAppUser(uid);
    },
    enabled: !!uid,
  });

  const updateProfile = useMutation({
    mutationFn: (data: any) => {
      if (!uid) throw new Error('Not authenticated');
      return updateAppUser(uid, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', uid] });
    },
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    updateProfile,
  };
};
