import { create } from 'zustand';
import type { FitnessData, FitnessGoal } from '../interfaces/fitness';

interface FitnessState {
  todayData: FitnessData | null;
  goals: FitnessGoal[];
  isTracking: boolean;

  setTodayData: (data: FitnessData) => void;
  setGoals: (goals: FitnessGoal[]) => void;
  addGoal: (goal: FitnessGoal) => void;
  removeGoal: (goalId: string) => void;
  setTracking: (tracking: boolean) => void;
  reset: () => void;
}

export const useFitnessStore = create<FitnessState>()((set) => ({
  todayData: null,
  goals: [],
  isTracking: false,

  setTodayData: (todayData) => set({ todayData }),

  setGoals: (goals) => set({ goals }),

  addGoal: (goal) =>
    set((state) => ({ goals: [...state.goals, goal] })),

  removeGoal: (goalId) =>
    set((state) => ({ goals: state.goals.filter((g) => g.id !== goalId) })),

  setTracking: (isTracking) => set({ isTracking }),

  reset: () =>
    set({ todayData: null, goals: [], isTracking: false }),
}));
