import { create } from 'zustand';
import { Pedometer } from 'expo-sensors';
import { startOfDay } from 'date-fns';
import { 
  getTodayDateString, 
  calculateCaloriesFromSteps, 
  getLocalDailySteps, 
  saveLocalDailySteps, 
  syncDailyStepsToFirebase,
  StepData
} from '@/services/stepTrackingService';

interface StepStoreState {
  isAvailable: boolean;
  hasPermissions: boolean;
  todayTotalSteps: number;
  todayCalories: number;
  isSyncing: boolean;
  
  initializeTracking: () => Promise<void>;
  stopTracking: () => void;
  forceSync: () => Promise<void>;
}

// Global subscription tracker
let pedometerSubscription: Pedometer.Subscription | null = null;
let syncTimeout: NodeJS.Timeout | null = null;

export const useStepStore = create<StepStoreState>((set, get) => ({
  isAvailable: false,
  hasPermissions: false,
  todayTotalSteps: 0,
  todayCalories: 0,
  isSyncing: false,

  initializeTracking: async () => {
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      set({ isAvailable });

      if (!isAvailable) {
        console.warn("Pedometer is not available on this device.");
        return;
      }

      // Request permissions
      const permission = await Pedometer.requestPermissionsAsync();
      if (!permission.granted) {
        set({ hasPermissions: false });
        return;
      }
      set({ hasPermissions: true });

      const todayStr = getTodayDateString();
      const startOfToday = startOfDay(new Date());
      const now = new Date();

      // 1. Fetch exact daily steps natively (HealthKit / Google Fit) if supported
      let historicalSteps = 0;
      try {
        const result = await Pedometer.getStepCountAsync(startOfToday, now);
        if (result && result.steps) historicalSteps = result.steps;
      } catch (e) {
        console.warn("Historical pedometer not available, falling back to local storage.", e);
        // Fallback: check local storage cache if API fails (like Android lacking Google Fit sync)
        const localData = await getLocalDailySteps(todayStr);
        if (localData) historicalSteps = localData.steps;
      }

      set({ 
        todayTotalSteps: historicalSteps,
        todayCalories: calculateCaloriesFromSteps(historicalSteps)
      });

      // 2. Clear old subscription if it exists
      if (pedometerSubscription) {
        pedometerSubscription.remove();
        pedometerSubscription = null;
      }

      // 3. Watch for real-time steps while app is active
      pedometerSubscription = Pedometer.watchStepCount((result) => {
        // Result steps are steps taken *since* the watch started.
        const currentTotal = historicalSteps + result.steps;
        const currentCalories = calculateCaloriesFromSteps(currentTotal);

        set({
          todayTotalSteps: currentTotal,
          todayCalories: currentCalories
        });

        // 4. Trigger debounced local/remote sync
        const state = get();
        state.forceSync();
      });

    } catch (error) {
      console.error("Error initializing pedometer tracking:", error);
    }
  },

  stopTracking: () => {
    if (pedometerSubscription) {
      pedometerSubscription.remove();
      pedometerSubscription = null;
    }
    if (syncTimeout) {
      clearTimeout(syncTimeout);
    }
  },

  // Debounced Sync function
  forceSync: async () => {
    const { todayTotalSteps, todayCalories } = get();
    
    if (syncTimeout) {
      clearTimeout(syncTimeout);
    }
    
    // Save to local instantly immediately, sync to firebase debounced.
    const stepData: StepData = {
      dateString: getTodayDateString(),
      date: new Date(),
      steps: todayTotalSteps,
      caloriesBurned: todayCalories
    };
    
    await saveLocalDailySteps(stepData);

    syncTimeout = setTimeout(async () => {
      set({ isSyncing: true });
      try {
        await syncDailyStepsToFirebase(stepData);
      } catch (err) {
        console.error("Firebase Step Sync Failed:", err);
      } finally {
        set({ isSyncing: false });
      }
    }, 5000); // 5 seconds debounce
  }
}));
