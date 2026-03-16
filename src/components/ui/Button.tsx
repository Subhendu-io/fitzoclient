import React from "react";
import { Text, ActivityIndicator, Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  textClassName?: string;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  textClassName = "",
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const getVariantClass = () => {
    switch (variant) {
      case "primary":
        return "bg-primary";
      case "secondary":
        return "bg-card";
      case "outline":
        return "bg-transparent border border-primary";
      case "ghost":
        return "bg-transparent";
      default:
        return "bg-primary";
    }
  };

  const getTextClass = () => {
    switch (variant) {
      case "primary":
        return "text-black font-bold";
      case "secondary":
        return "text-white font-semibold";
      case "outline":
      case "ghost":
        return "text-primary font-semibold";
      default:
        return "text-black font-bold";
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "py-2 px-4";
      case "md":
        return "py-4 px-6";
      case "lg":
        return "py-5 px-8";
      default:
        return "py-4 px-6";
    }
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      className={`rounded-2xl flex-row items-center justify-center ${getVariantClass()} ${getSizeClass()} ${isDisabled ? "opacity-50" : ""} ${className}`}
      style={animatedStyle}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#000" : "#C8FF32"} size="small" />
      ) : (
        <Text className={`text-center font-kanit ${getTextClass()} ${textClassName}`}>{title}</Text>
      )}
    </AnimatedPressable>
  );
}
