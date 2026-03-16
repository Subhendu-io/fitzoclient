export interface Workout {
  id: string;
  name: string;
  description?: string;
  type: WorkoutType;
  duration: number;        // minutes
  caloriesBurned: number;
  exercises: Exercise[];
  createdAt: string;
  completedAt?: string;
}

export type WorkoutType =
  | 'strength'
  | 'cardio'
  | 'flexibility'
  | 'hiit'
  | 'yoga'
  | 'custom';

export interface Exercise {
  id: string;
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;  // kg
  duration?: number; // seconds
  restTime?: number; // seconds
}
