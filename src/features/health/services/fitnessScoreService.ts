import { getFunctions, httpsCallable } from '@react-native-firebase/functions';
import { getFirestore, collection, getDocs, query, orderBy } from '@react-native-firebase/firestore';
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

export const getFitnessHistory = async (
  uid: string,
  options?: { limit?: number; offset?: number }
): Promise<FitnessAssessmentEntry[]> => {
  try {
    const db = getFirestore();
    const logsRef = collection(db, COLLECTIONS.APPUSERS, uid, COLLECTIONS.FITNESS_ANALYTICS_LOGS);
    
    // Natively query the collection ordered by newest first
    const q = query(logsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    // Map documents
    let results = snapshot.docs.map((doc: any) => doc.data() as FitnessAssessmentEntry);
    
    if (options) {
      const start = options.offset || 0;
      const end = options.limit ? start + options.limit : undefined;
      results = results.slice(start, end);
    }
    
    return results;
  } catch (err) {
    console.error('[getFitnessHistory] fetch error:', err);
    throw err;
  }
};
