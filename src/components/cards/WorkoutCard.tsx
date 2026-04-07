import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Dumbbell, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export interface WorkoutSet {
  reps: number;
  weight?: number;
}

export interface WorkoutCardProps {
  name: string;
  description?: string;
  sets: WorkoutSet[];
  /** Gradient: [startColor, endColor]. Defaults to orange if omitted. */
  gradientColors?: [string, string];
}

export function WorkoutCard({ name, description, sets, gradientColors }: WorkoutCardProps) {
  const router = useRouter();
  const maxReps = Math.max(...sets.map((s) => s.reps), 1);
  const [colorStart, colorEnd] = gradientColors ?? ['#ffb347', '#e8621a'];

  return (
    <LinearGradient
      colors={[colorStart, colorEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 40, padding: 24, marginBottom: 24, overflow: 'hidden' }}
    >
      {/* Header Row */}
      <TouchableOpacity
        onPress={() => router.push('/(main)/workouts' as any)}
        activeOpacity={0.8}
        className="flex-row items-center justify-between mb-8"
      >
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-full bg-black/15 items-center justify-center mr-4">
            <Dumbbell {...({ size: 24, stroke: '#ffffff' } as any)} />
          </View>
          <View>
            <Text className="text-white text-xl font-bold font-kanit">{name}</Text>
            <Text className="text-white/60 text-xs font-kanit">
              {description ?? 'Strength Training'}
            </Text>
          </View>
        </View>
        <ChevronRight {...({ size: 20, stroke: '#ffffff', opacity: 0.5 } as any)} />
      </TouchableOpacity>

      {/* Divider */}
      <View className="h-[1px] bg-white/15 w-full mb-6" />

      {/* Section label */}
      {/* <Text className="text-white/60 text-[10px] font-bold font-kanit uppercase mb-4 tracking-widest text-center">
        Sets Breakdown
      </Text> */}

      {/* Bar chart — one bar per set */}
      <View className="flex-row justify-between items-end px-2 h-20 mt-8">
        {sets.map((set, i) => {
          const barPct = Math.round((set.reps / maxReps) * 100);
          const isLast = i === sets.length - 1;

          return (
            <View key={i} className="items-center justify-end h-full">
              {/* Rep count above bar */}
              <Text className="text-white/60 text-[9px] font-kanit font-bold mb-1">
                {set.reps}
              </Text>

              {/* Progress bar */}
              <View className="w-7 h-full justify-end items-center bg-white/10 rounded-full overflow-hidden mb-2">
                <View
                  style={{ height: `${barPct}%`, width: '100%' }}
                  className={`rounded-full ${isLast ? 'bg-white' : 'bg-white/50'}`}
                />
              </View>

              {/* Set label */}
              <Text className="text-white/50 text-[10px] font-bold font-kanit uppercase">
                S{i + 1}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Optional weight row */}
      {sets.some((s) => s.weight) && (
        <Text className="text-white/40 text-[10px] font-kanit text-center mt-2">
          {sets.map((s) => (s.weight ? `${s.weight} kg` : '—')).join('  ·  ')}
        </Text>
      )}
    </LinearGradient>
  );
}
