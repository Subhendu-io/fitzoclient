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
}

const ANALYZE_FOOD_CALLABLE = 'analyzeFood';

/**
 * Call the analyzeFood Cloud Function.
 * Sends a base64-encoded image and receives a nutritional assessment.
 */
export const analyzeFood = async (
  imageBase64: string,
): Promise<FoodAssessment> => {
  if (!imageBase64?.trim()) {
    throw new Error('Image data is required');
  }

  const functions = getFunctions();
  const callable = httpsCallable(functions, ANALYZE_FOOD_CALLABLE);
  const { data } = await callable({ imageBase64 });

  return data as FoodAssessment;
};
