import { getFunctions, httpsCallable } from '@react-native-firebase/functions';

export interface FitnessAssessment {
  score: number;
  analysis: string;
  recommendations: string[];
  todayPlan: string;
  imageUrl?: string;
}

const ANALYZE_FITNESS_CALLABLE = 'analyzeFitness';

export interface AnalysisPayload {
  imageBase64: string;
  userStats?: {
    weight?: number;
    height?: number;
    goal?: string;
    activityLevel?: string;
  };
}

/**
 * Call the analyzeFitness Cloud Function.
 * Sends a base64-encoded image and receives a fitness assessment
 * with score (0-100), analysis, recommendations, and a daily plan.
 */
export const analyzeFitness = async (
  payload: AnalysisPayload,
): Promise<FitnessAssessment> => {
  if (!payload.imageBase64?.trim()) {
    throw new Error('Image data is required');
  }

  const functions = getFunctions();
  const callable = httpsCallable(functions, ANALYZE_FITNESS_CALLABLE);
  const { data } = await callable(payload);

  return data as FitnessAssessment;
};
