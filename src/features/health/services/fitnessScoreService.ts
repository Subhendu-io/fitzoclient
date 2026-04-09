import { getFunctions, httpsCallable } from '@react-native-firebase/functions';
import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';
import { COLLECTIONS } from '@/constants/collection';

export interface FitnessAssessment {
  score: number;
  analysis: string;
  recommendations: string[];
  todayPlan: string;
  imageUrl?: string;
}

export interface FitnessAssessmentEntry extends FitnessAssessment {
  date: string;
  createdAt: number;
}

const ANALYZE_FITNESS_CALLABLE = 'analyzeFitness';

/**
 * Call the analyzeFitness Cloud Function.
 * Sends a base64-encoded image and receives a fitness assessment
 * with score (0-100), analysis, recommendations, and a daily plan.
 */
export const analyzeFitness = async (
  imageBase64: string,
): Promise<FitnessAssessment> => {
  if (!imageBase64?.trim()) {
    throw new Error('Image data is required');
  }

  const functions = getFunctions();
  const callable = httpsCallable(functions, ANALYZE_FITNESS_CALLABLE);
  const { data } = await callable({ imageBase64 });

  return data as FitnessAssessment;
};

/**
 * Load total active fitness history tracking from Firestore natively via SDK.
 */
export const getFitnessHistory = async (uid: string): Promise<FitnessAssessmentEntry[]> => {
  try {
    const db = getFirestore();
    const docRef = doc(db, COLLECTIONS.APPUSERS, uid, COLLECTIONS.FITNESS, COLLECTIONS.TRACKING);
    const snapshot = await getDoc(docRef);
    
    if (typeof snapshot.exists === 'function' ? snapshot.exists() : snapshot.exists) {
      const data = snapshot.data();
      if (data && data.entries && Array.isArray(data.entries)) {
        // Sort by most recent
        return data.entries.sort((a, b) => b.createdAt - a.createdAt);
      }
    }
    return [];
  } catch (err) {
    console.error('[getFitnessHistory] fetch error:', err);
    throw err;
  }
};
