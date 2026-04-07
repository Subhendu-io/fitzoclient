import React, { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { WorkoutCard, WorkoutCardProps } from '@/components/cards/WorkoutCard';

// ─── Default exercise list ────────────────────────────────────────────────────
export const DEFAULT_EXERCISES: WorkoutCardProps[] = [
  {
    name: 'Bench Press',
    description: 'Chest, Shoulders & Triceps',
    sets: [{ reps: 20 }, { reps: 15 }, { reps: 12 }, { reps: 10 }],
    gradientColors: ['#ffb347', '#e8621a'], // warm orange
  },
  {
    name: 'Squat',
    description: 'Quads, Glutes & Hamstrings',
    sets: [{ reps: 15 }, { reps: 12 }, { reps: 10 }, { reps: 8 }],
    gradientColors: ['#f953c6', '#b91d73'], // hot pink → magenta
  },
  {
    name: 'Deadlift',
    description: 'Back, Glutes & Core',
    sets: [{ reps: 12 }, { reps: 10 }, { reps: 8 }],
    gradientColors: ['#4facfe', '#0057d9'], // sky blue → deep blue
  },
  {
    name: 'Pull-up',
    description: 'Lats, Biceps & Upper Back',
    sets: [{ reps: 10 }, { reps: 8 }, { reps: 6 }, { reps: 6 }],
    gradientColors: ['#43e97b', '#008c4a'], // mint green → forest green
  },
  {
    name: 'Plank',
    description: 'Core & Stability',
    sets: [{ reps: 60 }, { reps: 45 }, { reps: 30 }],
    gradientColors: ['#fa8231', '#6c1a9a'], // orange → deep purple
  },
];
// ─────────────────────────────────────────────────────────────────────────────

const SWIPE_VELOCITY_THRESHOLD = 800;
const GAP = 16;

interface WorkoutSliderProps {
  exercises?: WorkoutCardProps[];
}

export function WorkoutSlider({ exercises = DEFAULT_EXERCISES }: WorkoutSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const stepWidth = useSharedValue(0);
  const totalCardsSV = useSharedValue(exercises.length);
  const deckOffset = useSharedValue(0);
  const dragX = useSharedValue(0);

  const updateDot = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      'worklet';
      const step = stepWidth.value;
      const proposed = deckOffset.value + e.translationX;
      const maxOffset = 0;
      const minOffset = -(totalCardsSV.value - 1) * step;

      if (proposed > maxOffset) {
        dragX.value = (e.translationX - (maxOffset - deckOffset.value)) * 0.2;
      } else if (proposed < minOffset) {
        dragX.value = (e.translationX - (minOffset - deckOffset.value)) * 0.2;
      } else {
        dragX.value = e.translationX;
      }
    })
    .onEnd((e) => {
      'worklet';
      const step = stepWidth.value;
      const currentIndex = Math.round(-deckOffset.value / step);
      const dx = dragX.value;
      const vx = e.velocityX;

      const goNext =
        (dx < -(step * 0.3) || vx < -SWIPE_VELOCITY_THRESHOLD) &&
        currentIndex < totalCardsSV.value - 1;
      const goPrev =
        (dx > step * 0.3 || vx > SWIPE_VELOCITY_THRESHOLD) && currentIndex > 0;

      if (goNext) {
        const newIndex = currentIndex + 1;
        deckOffset.value = withTiming(-newIndex * step, { duration: 300 });
        dragX.value = withTiming(0, { duration: 300 }, () => {
          runOnJS(updateDot)(newIndex);
        });
      } else if (goPrev) {
        const newIndex = currentIndex - 1;
        deckOffset.value = withTiming(-newIndex * step, { duration: 300 });
        dragX.value = withTiming(0, { duration: 300 }, () => {
          runOnJS(updateDot)(newIndex);
        });
      } else {
        dragX.value = withSpring(0, { damping: 22, stiffness: 220 });
      }
    });

  const stripStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: deckOffset.value + dragX.value }],
  }));

  return (
    <View style={styles.container}>
      <View
        style={styles.viewport}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          setContainerWidth(w);
          stepWidth.value = w + GAP;
        }}
      >
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.strip, stripStyle]}>
            {exercises.map((exercise, i) => (
              <View
                key={exercise.name}
                style={{
                  flexShrink: 0,
                  width: containerWidth,
                  marginRight: i === exercises.length - 1 ? 0 : GAP,
                }}
              >
                <WorkoutCard {...exercise} />
              </View>
            ))}
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Dot indicators */}
      <View style={styles.dots}>
        {exercises.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === activeIndex ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  viewport: {
    overflow: 'hidden',
    width: '100%',
  },
  strip: {
    flexDirection: 'row',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: '#ffb347',
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#d1d5db',
  },
});
