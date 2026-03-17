import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  interpolateColor 
} from 'react-native-reanimated';
import { useColorScheme } from 'react-native';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  className?: string;
  style?: ViewStyle;
}

export const Skeleton = ({ width, height, borderRadius = 8, className, style }: SkeletonProps) => {
  const animatedValue = useSharedValue(0);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    animatedValue.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      animatedValue.value,
      [0, 1],
      isDark ? ['#1A1A1A', '#2A2A2A'] : ['#E5E7EB', '#F3F4F6']
    );
    return { backgroundColor };
  });

  return (
    <Animated.View 
      className={className}
      style={[
        {
          width,
          height,
          borderRadius,
        },
        animatedStyle,
        style,
      ]} 
    />
  );
};
