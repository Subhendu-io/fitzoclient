import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  interpolateColor 
} from 'react-native-reanimated';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  className?: string;
  style?: ViewStyle;
}

export const Skeleton = ({ width, height, borderRadius = 8, className, style }: SkeletonProps) => {
  const animatedValue = useSharedValue(0);

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
      ['#1A1A1A', '#2A2A2A']
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
