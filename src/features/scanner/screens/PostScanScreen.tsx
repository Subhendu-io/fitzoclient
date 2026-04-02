import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { Header } from "@/components/layout/Header";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  CreditCard,
  UserPlus,
} from "lucide-react-native";
import { useThemeColors } from "@/hooks/useThemeColors";
import Animated, { FadeInDown } from "react-native-reanimated";
import type { ScanFlowResult } from "../services/scanFlowService";

interface ResultConfig {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  primaryLabel: string;
  primaryAction: () => void;
  secondaryLabel?: string;
  secondaryAction?: () => void;
}

export function PostScanScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { result: resultParam } = useLocalSearchParams<{ result: string }>();

  let flowResult: ScanFlowResult | null = null;
  try {
    flowResult = resultParam ? JSON.parse(resultParam) : null;
  } catch {
    flowResult = null;
  }

  const navigateHome = () => {
    router.dismissAll();
    router.replace("/(tabs)/home");
  };

  const getResultConfig = (): ResultConfig | null => {
    if (!flowResult) return null;

    switch (flowResult.type) {
      case "ATTENDANCE_MARKED":
        return {
          icon: (
            <CheckCircle2
              {...({ size: 44, stroke: "#22c55e", strokeWidth: 2.5 } as any)}
            />
          ),
          iconBg: "rgba(34, 197, 94, 0.15)",
          title: "Checked In!",
          description: `Welcome to ${flowResult.gymName}. Your attendance has been recorded successfully.`,
          primaryLabel: "Done",
          primaryAction: navigateHome,
        };

      case "LEAD_PENDING":
        return {
          icon: (
            <UserPlus
              {...({ size: 44, stroke: "#3b82f6", strokeWidth: 2 } as any)}
            />
          ),
          iconBg: "rgba(59, 130, 246, 0.15)",
          title: "Join Request Sent",
          description: `${flowResult.gymName} will review your details. You'll be notified once your membership is ready.`,
          primaryLabel: "Okay",
          primaryAction: navigateHome,
        };

      case "PHONE_REQUIRED":
        return {
          icon: (
            <PhoneCall
              {...({ size: 44, stroke: "#f59e0b", strokeWidth: 2 } as any)}
            />
          ),
          iconBg: "rgba(245, 158, 11, 0.15)",
          title: "Phone Number Needed",
          description: `Add a verified phone number in your profile so we can match you to ${flowResult.gymName}.`,
          primaryLabel: "Okay",
          primaryAction: navigateHome,
        };

      case "NO_SUBSCRIPTION":
        return {
          icon: (
            <CreditCard
              {...({ size: 44, stroke: "#eab308", strokeWidth: 2 } as any)}
            />
          ),
          iconBg: "rgba(234, 179, 8, 0.15)",
          title: "No Active Plan",
          description:
            "You need an active subscription to check in at this gym. Browse available plans below.",
          primaryLabel: "Browse Plans",
          primaryAction: () => {
            router.replace({
              pathname: "/(main)/home/buy-subscription",
              params: {
                tenantId: flowResult!.tenantId,
                branchId: flowResult!.branchId,
                memberId: (flowResult as any).memberId,
              },
            });
          },
          secondaryLabel: "Go Home",
          secondaryAction: navigateHome,
        };

      default:
        return null;
    }
  };

  const config = getResultConfig();

  if (!config) {
    return (
      <ScreenWrapper className="bg-background">
        <Header title="Scan Result" showBackButton />
        <View className="flex-1 items-center justify-center px-8">
          <AlertCircle
            {...({ size: 48, stroke: colors.muted } as any)}
          />
          <Text className="text-text text-lg font-bold font-kanit mt-4 text-center">
            Something Went Wrong
          </Text>
          <Text className="text-text-secondary font-kanit mt-2 text-center">
            We couldn't process the scan result. Please try again.
          </Text>
          <TouchableOpacity
            className="mt-8 bg-primary py-4 px-12 rounded-2xl"
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text className="text-black font-bold font-kanit">Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper className="bg-background">
      <Header title="Scan Result" showBackButton />

      <View className="flex-1 px-8 justify-center items-center">
        {/* Icon */}
        <Animated.View entering={FadeInDown.delay(150).springify()}>
          <View
            className="w-24 h-24 rounded-full items-center justify-center mb-6"
            style={{ backgroundColor: config.iconBg }}
          >
            {config.icon}
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <Text className="text-text text-3xl font-bold font-kanit text-center mb-3">
            {config.title}
          </Text>
        </Animated.View>

        {/* Description */}
        <Animated.View entering={FadeInDown.delay(450)}>
          <Text className="text-text-secondary text-base font-kanit text-center leading-6 px-2">
            {config.description}
          </Text>
        </Animated.View>
      </View>

      {/* Bottom Actions */}
      <Animated.View
        entering={FadeInDown.delay(600)}
        className="px-8 pb-12"
        style={{ gap: 12 }}
      >
        <TouchableOpacity
          className="w-full bg-primary py-4 rounded-2xl items-center"
          onPress={config.primaryAction}
          activeOpacity={0.8}
        >
          <Text className="text-black font-bold font-kanit text-lg">
            {config.primaryLabel}
          </Text>
        </TouchableOpacity>

        {config.secondaryLabel && config.secondaryAction && (
          <TouchableOpacity
            className="w-full bg-card border border-border py-4 rounded-2xl items-center"
            onPress={config.secondaryAction}
            activeOpacity={0.8}
          >
            <Text className="text-text font-bold font-kanit text-lg">
              {config.secondaryLabel}
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </ScreenWrapper>
  );
}
