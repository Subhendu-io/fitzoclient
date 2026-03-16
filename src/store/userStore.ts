import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile } from '../interfaces/user';

interface UserState {
  profile: UserProfile | null;
  onboardingComplete: boolean;

  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setOnboardingComplete: (complete: boolean) => void;
  reset: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: null,
      onboardingComplete: false,

      setProfile: (profile) => set({ profile }),

      updateProfile: (updates) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : (updates as UserProfile),
        })),

      setOnboardingComplete: (onboardingComplete) =>
        set({ onboardingComplete }),

      reset: () =>
        set({ profile: null, onboardingComplete: false }),
    }),
    {
      name: '@fitzo/user-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
