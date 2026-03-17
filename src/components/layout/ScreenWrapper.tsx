import React, { type ReactNode } from "react";
import { StatusBar, View, Platform } from "react-native";

import { useColorScheme } from "react-native";
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
  const colorScheme = useColorScheme();

  return (
    <Container className={`flex-1 bg-background ${className}`}>
      <StatusBar 
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent"
        translucent
      />
      <View className="flex-1">{children}</View>
    </Container>
  );
}
