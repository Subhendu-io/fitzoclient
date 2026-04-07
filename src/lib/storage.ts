import AsyncStorage from '@react-native-async-storage/async-storage';

/** Type-safe wrapper around AsyncStorage */
export const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch {
      console.error(`[Storage] Failed to get key: ${key}`);
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.error(`[Storage] Failed to set key: ${key}`);
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      console.error(`[Storage] Failed to remove key: ${key}`);
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch {
      console.error('[Storage] Failed to clear storage');
    }
  },
};

/** Storage keys used throughout the app */
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@scorefit/auth-token',
  USER_PROFILE: '@scorefit/user-profile',
  ONBOARDING_COMPLETE: '@scorefit/onboarding-complete',
  SETTINGS: '@scorefit/settings',
} as const;
