import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useThemeColors } from "@/hooks/useThemeColors";

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  rightElement?: React.ReactNode;
}

export function Header({ title, showBackButton = false, rightElement }: HeaderProps) {
  const router = useRouter();
  const colors = useThemeColors();

  return (
    <View className="flex-row items-center justify-between px-6 h-20 bg-transparent">
      <View className="w-10">
        {showBackButton && (
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-card rounded-xl items-center justify-center border border-border"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronLeft color={colors.text} {...({ size: 24 } as any)} />
          </TouchableOpacity>
        )}
      </View>

      <Text className="flex-1 text-center text-text text-lg font-bold font-kanit">{title}</Text>

      <View className="w-10 items-end">{rightElement}</View>
    </View>
  );
}
