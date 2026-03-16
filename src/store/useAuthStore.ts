import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { AppUser } from '../interfaces/member';

interface AuthState {
  user: FirebaseAuthTypes.User | null;
  profile: AppUser | null;
  loading: boolean;
  hasSeenOnboarding: boolean;
  activeGym: string | null;
  activeBranchId: string | null;
  setUser: (user: FirebaseAuthTypes.User | null) => void;
  setProfile: (profile: AppUser | null) => void;
  setActiveGym: (gymId: string | null) => void;
  setActiveBranchId: (branchId: string | null) => void;
  setLoading: (loading: boolean) => void;
  setHasSeenOnboarding: (seen: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      activeGym: null,
      activeBranchId: null,
      loading: true,
      hasSeenOnboarding: false,
      setUser: (user) => set({ user, loading: false }),
      setProfile: (profile) => set({ 
        profile, 
        activeGym: profile?.activeGym || profile?.gyms?.[0] || null,
        activeBranchId: profile?.activeBranchId || profile?.branchIds?.[0] || null
      }),
      setActiveGym: (activeGym) => set({ activeGym }),
      setActiveBranchId: (activeBranchId) => set({ activeBranchId }),
      setLoading: (loading) => set({ loading }),
      setHasSeenOnboarding: (hasSeenOnboarding) => set({ hasSeenOnboarding }),
      signOut: () => set({ user: null, profile: null, activeGym: null, activeBranchId: null, loading: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ hasSeenOnboarding: state.hasSeenOnboarding }),
    }
  )
);
