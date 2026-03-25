import { getFunctions, httpsCallable } from '@react-native-firebase/functions';

export interface FitnessAssessment {
  score: number;
  analysis: string;
  recommendations: string[];
  todayPlan: string;
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
