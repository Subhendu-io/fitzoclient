import { getFunctions, httpsCallable } from '@react-native-firebase/functions';
import { getFirestore, collection, getDocs, query, orderBy } from '@react-native-firebase/firestore';
import { COLLECTIONS } from '@/constants/collection';

export interface FoodAssessment {
  totalCalories: number;
  caloriesBreakdown: string;
  isHealthy: boolean;
  healthNotes: string;
  benefits: string[];
  drawbacks: string[];
  workoutSuggestions: string[];
  imageUrl?: string;
}

export interface FoodAssessmentEntry extends FoodAssessment {
  date: string;
  createdAt: number;
}

const ANALYZE_FOOD_CALLABLE = 'analyzeFood';

export interface AnalysisPayload {
  imageBase64: string;
  userStats?: {
    weight?: number;
    height?: number;
    goal?: string;
    activityLevel?: string;
    dietPreference?: string;
  };
}

export const analyzeFood = async (
  payload: AnalysisPayload,
): Promise<FoodAssessment> => {
  if (!payload.imageBase64?.trim()) {
    throw new Error('Image data is required');
  }

  const functions = getFunctions();
  const callable = httpsCallable(functions, ANALYZE_FOOD_CALLABLE);
  const { data } = await callable(payload);

  return data as FoodAssessment;
};

export const getDietHistory = async (
  uid: string,
  options?: { limit?: number; offset?: number }
): Promise<FoodAssessmentEntry[]> => {
  try {
    const db = getFirestore();
    const logsRef = collection(db, COLLECTIONS.APPUSERS, uid, COLLECTIONS.DIET_ANALYTICS_LOGS);
    
    const q = query(logsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    let results = snapshot.docs.map((doc: any) => doc.data() as FoodAssessmentEntry);
    
    if (options) {
      const start = options.offset || 0;
      const end = options.limit ? start + options.limit : undefined;
      results = results.slice(start, end);
    }
    
    return results;
  } catch (err) {
    console.error('[getDietHistory] fetch error:', err);
    throw err;
  }
};
