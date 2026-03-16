import React, { type ReactNode } from "react";
import { StatusBar, View, Platform } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenWrapperProps {
  children: ReactNode;
  className?: string;
  withSafeArea?: boolean;
}

export function ScreenWrapper({
  children,
  className = "",
  withSafeArea = true,
}: ScreenWrapperProps) {
  const Container = withSafeArea ? SafeAreaView : View;

  return (
    <Container className={`flex-1 bg-background ${className}`}>
      <StatusBar barStyle="light-content" />
      <View className="flex-1">{children}</View>
    </Container>
  );
}
