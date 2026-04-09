/**
 * Service for AI-powered food & drink nutritional analysis.
 * Calls the analyzeFood Cloud Function with a base64-encoded image.
 */

import { getFunctions, httpsCallable } from '@react-native-firebase/functions';

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

/**
 * Call the analyzeFood Cloud Function.
 * Sends a base64-encoded image and receives a nutritional assessment.
 */
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
