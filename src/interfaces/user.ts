export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;
  updatedAt: string;
  onboardingComplete: boolean;
  profile?: UserProfile;
}

export interface UserProfile {
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height?: number;       // cm
  weight?: number;       // kg
  targetWeight?: number; // kg
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  fitnessGoal?: 'lose_weight' | 'gain_muscle' | 'maintain' | 'improve_health';
}
