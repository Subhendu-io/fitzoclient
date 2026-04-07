import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { Header } from "@/components/layout/Header";
import { Building2, CheckCircle2, ChevronRight, MapPin, Sparkles } from "lucide-react-native";
import { useAuthStore } from "@/store/useAuthStore";
import { getTenantInfo } from "@/services/memberService";
import { useRouter } from "expo-router";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useToaster } from "@/providers/useToaster";

export function GymListScreen() {
  const { showToast } = useToaster();
  const colors = useThemeColors();
  const router = useRouter();
  const { profile, activeGym, setActiveGym } = useAuthStore();
  const [gymDetails, setGymDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { activeGymData, otherGyms } = useMemo(() => {
    if (!gymDetails.length) return { activeGymData: null, otherGyms: [] };
    const active = gymDetails.find((g) => g.id === activeGym) ?? gymDetails[0];
    const others = gymDetails.filter((g) => g.id !== active.id);
    return { activeGymData: active, otherGyms: others };
  }, [gymDetails, activeGym]);

  useEffect(() => {
    const loadGyms = async () => {
      if (!profile?.gyms || profile.gyms.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const details = await Promise.all(
          profile.gyms.map(async (gymId) => {
            const info = await getTenantInfo(gymId);
            return { id: gymId, ...info };
          }),
        );
        setGymDetails(details);
      } catch (error) {
        console.error("Error loading gym details:", error);
      } finally {
        setLoading(false);
      }
    };

    loadGyms();
  }, [profile?.gyms]);

  const handleSwitchGym = async (gymId: string) => {
    if (gymId === activeGym) return;

    try {
      setLoading(true);
      setActiveGym(gymId);
      showToast({ title: "Success", message: "Active gym switched successfully", variant: "success" });
      router.back();
    } catch (error) {
      showToast({ title: "Error", message: "Failed to switch gym", variant: "danger" });
    } finally {
      setLoading(false);
    }
  };

  const onPrimary = colors.onPrimary;

  return (
    <ScreenWrapper className="bg-background">
      <Header title="My Gyms" showBackButton />
      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        <Text className="text-text-secondary text-xs font-bold font-kanit uppercase tracking-widest mb-4">
          Your Memberships
        </Text>

        {loading ? (
          <View className="py-20 items-center">
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : gymDetails.length === 0 ? (
          <Animated.View entering={FadeInUp} className="py-20 items-center">
            <View className="w-20 h-20 rounded-full bg-card items-center justify-center mb-4">
              <Building2 {...({ size: 40, stroke: colors.muted, opacity: 0.5 } as any)} />
            </View>
            <Text className="text-text font-kanit text-lg font-semibold text-center">
              No gyms yet
            </Text>
            <Text className="text-text-secondary font-kanit mt-2 text-center px-6">
              Scan a QR code at your gym to add it here and get started!
            </Text>
          </Animated.View>
        ) : (
          <View className="pb-8">
            {/* Active gym – hero card at top */}
            {activeGymData && (
              <Animated.View entering={FadeInDown.delay(0)} className="mb-6">
                <View
                  className="rounded-3xl overflow-hidden border-0"
                  style={{
                    backgroundColor: colors.primary,
                    ...Platform.select({
                      ios: {
                        shadowColor: colors.primary,
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.35,
                        shadowRadius: 16,
                      },
                      android: { elevation: 12 },
                    }),
                  }}
                >
                  <View className="p-6">
                    <View className="flex-row items-center justify-between mb-4">
                      <View
                        className="flex-row items-center rounded-full px-3 py-1.5"
                        style={{
                          backgroundColor: colors.primary,
                        }}
                      >
                        <Sparkles
                          {...({
                            size: 14,
                            stroke: onPrimary,
                          } as any)}
                        />
                        <Text
                          className="text-sm font-bold font-kanit ml-1.5"
                          style={{ color: onPrimary }}
                        >
                          Current gym
                        </Text>
                      </View>
                      <CheckCircle2
                        {...({
                          size: 28,
                          stroke: onPrimary,
                        } as any)}
                      />
                    </View>
                    <View className="flex-row items-center">
                      <View
                        className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                        style={{
                          backgroundColor: colors.primary,
                          borderColor: colors.onPrimary,
                          borderWidth: 0.5,
                        }}
                      >
                        <Building2
                          {...({
                            size: 28,
                            stroke: onPrimary,
                          } as any)}
                        />
                      </View>
                      <View className="flex-1">
                        <Text
                          className="text-xl font-bold font-kanit"
                          style={{ color: onPrimary }}
                          numberOfLines={1}
                        >
                          {activeGymData.name || "ScoreFit Gym"}
                        </Text>
                        <View className="flex-row items-center mt-2">
                          <MapPin
                            {...({
                              size: 14,
                              stroke: onPrimary,
                            } as any)}
                          />
                          <Text
                            className="text-sm font-kanit ml-1.5 opacity-90"
                            style={{ color: onPrimary }}
                            numberOfLines={1}
                          >
                            {activeGymData.address || "Location"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </Animated.View>
            )}

            {/* Other gyms */}
            {otherGyms.length > 0 && (
              <>
                <Text className="text-text-secondary text-xs font-bold font-kanit uppercase tracking-widest mb-3 px-1">
                  Other gyms
                </Text>
                <View className="gap-3">
                  {otherGyms.map((gym, i) => (
                    <Animated.View key={gym.id} entering={FadeInDown.delay(100 + i * 80)}>
                      <TouchableOpacity
                        onPress={() => handleSwitchGym(gym.id)}
                        activeOpacity={0.8}
                        className="flex-row items-center p-4 rounded-2xl border bg-card border-border dark:border-stone-800"
                        style={
                          Platform.OS === "ios"
                            ? {
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.06,
                                shadowRadius: 8,
                              }
                            : { elevation: 2 }
                        }
                      >
                        <View className="w-11 h-11 rounded-xl bg-muted/20 dark:bg-stone-800/50 items-center justify-center mr-3">
                          <Building2
                            {...({
                              size: 22,
                              stroke: colors.primary,
                            } as any)}
                          />
                        </View>
                        <View className="flex-1">
                          <Text
                            className="text-base font-bold font-kanit text-text"
                            numberOfLines={1}
                          >
                            {gym.name || "ScoreFit Gym"}
                          </Text>
                          <View className="flex-row items-center mt-0.5">
                            <MapPin
                              {...({
                                size: 12,
                                stroke: colors.muted,
                              } as any)}
                            />
                            <Text
                              className="text-xs font-kanit text-text-secondary ml-1"
                              numberOfLines={1}
                            >
                              {gym.address || "Location"}
                            </Text>
                          </View>
                        </View>
                        <View className="flex-row items-center">
                          <Text className="text-xs font-kanit text-primary mr-1">Switch</Text>
                          <ChevronRight
                            {...({
                              size: 18,
                              stroke: colors.primary,
                            } as any)}
                          />
                        </View>
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                </View>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
