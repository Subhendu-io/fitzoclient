export interface FitnessData {
  userId: string;
  date: string;
  steps: number;
  caloriesBurned: number;
  activeMinutes: number;
  heartRate?: HeartRateData;
  bodyMetrics?: BodyMetrics;
}

export interface HeartRateData {
  resting: number;
  average: number;
  max: number;
}

export interface BodyMetrics {
  weight: number;
  bodyFat?: number;
  muscleMass?: number;
  bmi?: number;
}

export interface FitnessGoal {
  id: string;
  type: 'steps' | 'calories' | 'active_minutes' | 'weight';
  target: number;
  current: number;
  startDate: string;
  endDate: string;
}
