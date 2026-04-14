import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc, getDocs, collection, query, where, orderBy, Timestamp } from '@react-native-firebase/firestore';
import { getAuth, getFirestore } from '@/lib/firebase';
import { COLLECTIONS } from '@/constants/collection';
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

const db = getFirestore();
const ASYNC_STORAGE_STEP_KEY = '@fitzo_step_tracking';

export interface StepData {
  dateString: string; // YYYY-MM-DD
  date: Date;
  steps: number;
  caloriesBurned: number;
}

/**
 * Generates a YYYY-MM-DD string for local and doc ID usage.
 */
export const getTodayDateString = (date: Date = new Date()) => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * Calculates estimated calories burned from steps.
 * Using a rough estimate of 0.04 calories per step.
 */
export const calculateCaloriesFromSteps = (steps: number) => {
  return parseFloat((steps * 0.04).toFixed(2));
};

// --- Firebase Sync Methods ---

const getStepLogsCollection = () => {
  const authUid = getAuth().currentUser?.uid;
  if (!authUid) throw new Error("User must be logged in to access step logs.");
  return collection(db, COLLECTIONS.APPUSERS, authUid, 'step-analytics-logs');
};

/**
 * Synchronize daily steps to Firebase `/appusers/{uid}/step-analytics-logs/{YYYY-MM-DD}`
 */
export const syncDailyStepsToFirebase = async (data: StepData): Promise<void> => {
  try {
    const authUid = getAuth().currentUser?.uid;
    if (!authUid) return; // Silent return if not logged in yet
    
    // We use dateString as the document ID so it naturally dedupes per day
    const docRef = doc(db, COLLECTIONS.APPUSERS, authUid, 'step-analytics-logs', data.dateString);
    
    // We merge to avoid overwriting other potential fields if they exist later
    await setDoc(docRef, {
      dateString: data.dateString,
      date: Timestamp.fromDate(data.date), // Storing exact Date for range queries
      steps: data.steps,
      caloriesBurned: data.caloriesBurned,
      lastSyncedAt: Timestamp.now(),
    }, { merge: true });
    
  } catch (error) {
    console.error("Error syncing steps to Firebase:", error);
  }
};

/**
 * DEV: Seeds random step data for the past 7 days.
 */
export const seedPast7DaysSteps = async (): Promise<void> => {
  try {
    for (let i = 1; i <= 7; i++) {
      const date = subDays(new Date(), i);
      const steps = Math.floor(Math.random() * (12000 - 3000 + 1)) + 3000; // random btn 3000-12000
      
      const stepData: StepData = {
        dateString: format(date, 'yyyy-MM-dd'),
        date,
        steps,
        caloriesBurned: calculateCaloriesFromSteps(steps)
      };
      
      await syncDailyStepsToFirebase(stepData);
    }
    console.log("Seeded past 7 days of step data.");
  } catch (err) {
    console.error("Failed to seed steps:", err);
  }
};

/**
 * Get historical steps from Firebase between two dates
 */
export const getHistoricalSteps = async (startDate: Date, endDate: Date): Promise<StepData[]> => {
  try {
    const colRef = getStepLogsCollection();
    const q = query(
      colRef,
      where("date", ">=", Timestamp.fromDate(startDate)),
      where("date", "<=", Timestamp.fromDate(endDate)),
      orderBy("date", "asc")
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        dateString: data.dateString,
        date: (data.date as Timestamp).toDate(),
        steps: data.steps || 0,
        caloriesBurned: data.caloriesBurned || 0,
      };
    });
  } catch (error) {
    console.error("Error fetching historical steps:", error);
    return [];
  }
};

/**
 * Aggregates steps for total comparison (e.g., Last month vs This month)
 */
export const getTotalStepsForPeriod = async (startDate: Date, endDate: Date): Promise<number> => {
  const documents = await getHistoricalSteps(startDate, endDate);
  return documents.reduce((acc, curr) => acc + curr.steps, 0);
};

// --- Local Offline Storage Methods ---

/**
 * Fetch local step count cache for the active day to maintain persistence across boots.
 */
export const getLocalDailySteps = async (dateString: string): Promise<StepData | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(`${ASYNC_STORAGE_STEP_KEY}_${dateString}`);
    if (jsonValue != null) {
      const parsed = JSON.parse(jsonValue);
      return {
        ...parsed,
        date: new Date(parsed.date)
      };
    }
    return null;
  } catch (e) {
    console.error("Error fetching local daily steps:", e);
    return null;
  }
};

/**
 * Save current steps sequence to local cache.
 */
export const saveLocalDailySteps = async (data: StepData): Promise<void> => {
  try {
    const jsonValue = JSON.stringify({
      ...data,
      date: data.date.toISOString(),
    });
    await AsyncStorage.setItem(`${ASYNC_STORAGE_STEP_KEY}_${data.dateString}`, jsonValue);
  } catch (e) {
    console.error("Error saving local daily steps:", e);
  }
};

/**
 * Completely clean local steps if needed (e.g. on logout)
 */
export const clearAllLocalSteps = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const stepKeys = keys.filter(k => k.startsWith(ASYNC_STORAGE_STEP_KEY));
    if (stepKeys.length > 0) {
      await AsyncStorage.multiRemove(stepKeys);
    }
  } catch (e) {
    console.error("Error clearing local steps:", e);
  }
};
