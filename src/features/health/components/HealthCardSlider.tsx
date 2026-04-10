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
import { FitnessGraphCard } from '@/components/cards/FitnessGraphCard';
import { AchievementCard } from '@/components/cards/AchievementCard';

const TOTAL_CARDS = 2; // Fixed to 2 cards for Health Screen
const SWIPE_VELOCITY_THRESHOLD = 800;
const GAP = 16;

interface HealthCardSliderProps {
  startOfWeek: Date;
}

export function HealthCardSlider({ startOfWeek }: HealthCardSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const stepWidth = useSharedValue(0);
  const totalCardsSV = useSharedValue(TOTAL_CARDS);
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

  const slotStyle = (isLast: boolean) => ({
    flexShrink: 0 as const,
    width: containerWidth,
    marginRight: isLast ? 0 : GAP,
  });

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

            {/* Card 1 — Fitness Graph */}
            <View style={slotStyle(false)}>
              <FitnessGraphCard />
            </View>

            {/* Card 2 — Achievement */}
            <View style={slotStyle(true)}>
              <AchievementCard startOfWeek={startOfWeek} />
            </View>

          </Animated.View>
        </GestureDetector>
      </View>

      {/* Dot indicators */}
      <View style={styles.dots}>
        {Array.from({ length: TOTAL_CARDS }).map((_, i) => (
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
    backgroundColor: '#81e300',
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#d1d5db',
  },
});
