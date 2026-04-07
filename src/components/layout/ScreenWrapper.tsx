import React, { type ReactNode } from "react";
import { StatusBar, View, Platform } from "react-native";
import { useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSegments } from "expo-router";
import { ScreenBackground, type ScreenVariant } from "./ScreenBackground";

const TAB_VARIANTS: Record<string, ScreenVariant> = {
  home: "home",
  fitness: "fitness",
  scanner: "scanner",
  gym: "gym",
  community: "community",
};

function useScreenVariant(override?: ScreenVariant): ScreenVariant {
  const segments = useSegments();
  if (override) return override;
  // segments example: ['(tabs)', 'home', 'index'] → look for a known tab key
  const tab = segments.find((s) => s in TAB_VARIANTS);
  return tab ? TAB_VARIANTS[tab] : "default";
}

interface ScreenWrapperProps {
  children: ReactNode;
  className?: string;
  withSafeArea?: boolean;
  /** Override the auto-detected background variant */
  backgroundVariant?: ScreenVariant;
  /** Pass false to disable the abstract background entirely */
  showBackground?: boolean;
}

export function ScreenWrapper({
  children,
  className = "",
  withSafeArea = true,
  backgroundVariant,
  showBackground = true,
}: ScreenWrapperProps) {
  const Container = withSafeArea ? SafeAreaView : View;
  const colorScheme = useColorScheme();
  const variant = useScreenVariant(backgroundVariant);

  return (
    <Container className={`flex-1 bg-background ${className}`}>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />
      {/* Abstract SVG background */}
      {showBackground && <ScreenBackground variant={variant} />}
      <View className="flex-1">{children}</View>
    </Container>
  );
}
