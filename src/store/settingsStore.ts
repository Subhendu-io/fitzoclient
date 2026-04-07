import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  units: 'metric' | 'imperial';
  language: string;

  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setNotifications: (enabled: boolean) => void;
  setUnits: (units: 'metric' | 'imperial') => void;
  setLanguage: (language: string) => void;
  reset: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      notifications: true,
      units: 'metric',
      language: 'en',

      setTheme: (theme) => set({ theme }),
      setNotifications: (notifications) => set({ notifications }),
      setUnits: (units) => set({ units }),
      setLanguage: (language) => set({ language }),
      reset: () =>
        set({ theme: 'system', notifications: true, units: 'metric', language: 'en' }),
    }),
    {
      name: '@scorefit/settings-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
