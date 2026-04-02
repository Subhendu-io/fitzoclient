import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { Header } from "@/components/layout/Header";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  CreditCard,
  PhoneCall,
  Clock,
  Check,
  Sparkles,
} from "lucide-react-native";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useToaster } from "@/providers/useToaster";
import { Skeleton } from "@/components/ui/Skeleton";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useEffect, useState } from "react";
import { getBranchPlans } from "../services/planService";
import type { Plan } from "@/interfaces/member";

export function BuySubscriptionScreen() {
  const { tenantId, branchId, memberId } = useLocalSearchParams<{
    tenantId: string;
    branchId: string;
    memberId: string;
  }>();
  const colors = useThemeColors();
  const router = useRouter();
  const { showToast } = useToaster();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      if (!tenantId) return;
      try {
        setLoading(true);
        const result = await getBranchPlans(tenantId, branchId || "main");
        setPlans(result);
      } catch (error) {
        showToast({
          title: "Error",
          message: "Failed to load plans",
          variant: "danger",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [tenantId, branchId]);

  if (loading) {
    return (
      <ScreenWrapper className="bg-background">
        <Header title="Available Plans" showBackButton />
        <View className="flex-1 px-6 pt-6">
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              width="100%"
              height={220}
              borderRadius={32}
              className="mb-5"
            />
          ))}
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper className="bg-background">
      <Header title="Available Plans" showBackButton />

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero text */}
        <Animated.View entering={FadeInDown.delay(100)} className="mb-6 mt-2">
          <Text className="text-text text-2xl font-bold font-kanit">
            Choose Your Plan
          </Text>
          <Text className="text-text-secondary text-sm font-kanit mt-1">
            Select a plan and contact your gym to activate it.
          </Text>
        </Animated.View>

        {plans.length > 0 ? (
          plans.map((plan, index) => (
            <Animated.View
              key={plan.id}
              entering={FadeInDown.delay(200 + index * 120)}
              className="mb-5"
            >
              <View className="bg-card rounded-[32px] border border-border overflow-hidden">
                {/* Plan header */}
                <View className="p-6 pb-4">
                  <View className="flex-row items-start justify-between mb-4">
                    <View
                      className="p-3 rounded-2xl"
                      style={{ backgroundColor: colors.primary + "15" }}
                    >
                      <Sparkles
                        {...({ size: 22, stroke: colors.primary } as any)}
                      />
                    </View>
                    <View
                      className="flex-row items-end"
                      style={{ gap: 2 }}
                    >
                      <Text className="text-primary text-3xl font-bold font-kanit">
                        ₹{plan.price?.toLocaleString()}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-text text-xl font-bold font-kanit mb-1">
                    {plan.name}
                  </Text>

                  <View className="flex-row items-center" style={{ gap: 6 }}>
                    <Clock
                      {...({
                        size: 14,
                        stroke: colors.textSecondary,
                      } as any)}
                    />
                    <Text className="text-text-secondary text-sm font-kanit">
                      {plan.duration} days
                    </Text>
                  </View>

                  {plan.description ? (
                    <Text className="text-text-secondary text-sm font-kanit mt-3">
                      {plan.description}
                    </Text>
                  ) : null}
                </View>

                {/* Features list */}
                {plan.features && plan.features.length > 0 && (
                  <View className="px-6 pb-4">
                    <View
                      className="rounded-2xl p-4"
                      style={{ backgroundColor: colors.primary + "08" }}
                    >
                      {plan.features.map((feature, fIdx) => (
                        <View
                          key={fIdx}
                          className="flex-row items-center"
                          style={{
                            gap: 10,
                            marginBottom:
                              fIdx < plan.features!.length - 1 ? 10 : 0,
                          }}
                        >
                          <View
                            className="w-5 h-5 rounded-full items-center justify-center"
                            style={{
                              backgroundColor: colors.primary + "25",
                            }}
                          >
                            <Check
                              {...({
                                size: 12,
                                stroke: colors.primary,
                                strokeWidth: 3,
                              } as any)}
                            />
                          </View>
                          <Text className="text-text text-sm font-kanit flex-1">
                            {feature}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* CTA */}
                <View className="px-6 pb-6">
                  <TouchableOpacity
                    className="w-full bg-primary/10 py-4 rounded-2xl items-center flex-row justify-center"
                    style={{ gap: 10 }}
                    onPress={() => {
                      showToast({
                        title: "Contact Gym",
                        message: `Ask your gym manager to activate the "${plan.name}" plan for you.`,
                        variant: "info",
                      });
                    }}
                    activeOpacity={0.8}
                  >
                    <PhoneCall
                      {...({ size: 18, stroke: colors.primary } as any)}
                    />
                    <Text className="text-primary font-bold font-kanit text-base">
                      Contact Gym to Activate
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          ))
        ) : (
          <View className="items-center py-20">
            <View
              className="w-16 h-16 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: colors.muted + "20" }}
            >
              <CreditCard {...({ size: 32, stroke: colors.muted } as any)} />
            </View>
            <Text className="text-text text-lg font-bold font-kanit text-center">
              No Plans Available
            </Text>
            <Text className="text-text-secondary font-kanit mt-2 text-center">
              Contact your gym manager for subscription options.
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
