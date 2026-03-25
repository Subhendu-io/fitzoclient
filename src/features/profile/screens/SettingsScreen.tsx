import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { Header } from "@/components/layout/Header";
import {
  ChevronRight,
  LogOut,
  User,
  Shield,
  CreditCard,
  Building2,
  HelpCircle,
  Info,
  Calendar,
  Pencil,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import { useDashboard } from "@/hooks/useDashboard";
import { signOut } from "@react-native-firebase/auth";
import { getAuth } from "@/lib/firebase";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Palette } from "lucide-react-native";
import { useThemeColors } from "@/hooks/useThemeColors";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useModal } from "@/providers/useModal";
import { useToaster } from "@/providers/useToaster";

export function SettingsScreen() {
  const { showModal, hideModal } = useModal();
  const { showToast } = useToaster();
  const colors = useThemeColors();
  const router = useRouter();
  const { profile, setProfile, setUser, setLoading } = useAuthStore();
  const { activeSubscription, daysRemaining, attendanceStats } = useDashboard();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    showModal({
      title: "Log Out",
      message: "Are you sure you want to log out of your Fitzo account?",
      variant: "danger",
      buttons: [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              hideModal();
              setIsLoggingOut(true);
              setLoading(true);
              await signOut(getAuth());
              // Store will be updated by the listener in app/_layout.tsx
              router.replace("/(auth)/login");
            } catch (error) {
              console.error("Logout error:", error);
              hideModal();
              showToast({
                title: "Error",
                message: "Failed to log out",
                variant: "danger"
              });
            } finally {
              setIsLoggingOut(false);
              setLoading(false);
            }
          },
        },
      ]
    });
  };

  const MenuItem = ({ icon: Icon, title, value, onPress, iconColor = colors.primary }: any) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between p-4 bg-card/50 mb-3 rounded-3xl border border-stone-200 dark:border-stone-900"
    >
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-2xl bg-white/5 items-center justify-center mr-3">
          <Icon {...({ size: 20, stroke: iconColor } as any)} />
        </View>
        <Text className="text-text text-base font-kanit font-medium">{title}</Text>
      </View>
      <View className="flex-row items-center">
        {value && <Text className="text-text-secondary mr-2 font-kanit text-sm">{value}</Text>}
        <ChevronRight {...({ size: 16, stroke: colors.muted } as any)} />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper className="bg-background">
      <Header title="Profile" showBackButton />

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Profile Card with Stats */}
        <Animated.View entering={FadeInUp.delay(100)} className="mb-8 mt-4">
          <View className="bg-card rounded-3xl border border-stone-200/5 dark:border-stone-900/5 overflow-hidden">
            <TouchableOpacity
              onPress={() => router.push("/home/edit-profile" as any)}
              activeOpacity={0.9}
              className="flex-row items-center p-6"
            >
              <View className="w-24 h-24 rounded-full bg-primary items-center justify-center overflow-hidden mr-5 border-2 border-stone-200/10 dark:border-stone-900/10">
                <UserAvatar textSize="text-[36px]" textWeight="black" profile={profile || null} />
              </View>
              <View className="flex-1 min-w-0">
                <Text className="text-text text-xl font-black font-kanit" numberOfLines={1}>
                  {profile?.firstName} {profile?.lastName}
                </Text>
                <Text className="text-text-secondary text-sm font-kanit mt-0.5" numberOfLines={1}>
                  {profile?.phone || profile?.email}
                </Text>
                <View className="mt-3">
                  <View className="px-3 py-1.5 bg-primary/10 rounded-full self-start border border-stone-200 dark:border-stone-800">
                    <Text className="text-primary text-[10px] font-black font-kanit uppercase tracking-wider">
                      Member
                    </Text>
                  </View>
                </View>
              </View>
              <View className="w-10 h-10 rounded-full bg-stone-100 dark:bg-white/5 items-center justify-center ml-2">
                <Pencil {...({ size: 18, stroke: colors.primary } as any)} />
              </View>
            </TouchableOpacity>

            <View className="h-px bg-stone-200/40 dark:bg-stone-700/50 mx-4" />
            <View className="flex-row items-center py-4 px-2">
              <View className="flex-1 items-center">
                <Text className="text-primary text-xl font-black font-kanit">
                  {attendanceStats?.thisMonth || 0}
                </Text>
                <Text className="text-text-secondary text-[10px] font-bold font-kanit uppercase mt-0.5">
                  Visits
                </Text>
              </View>
              <View className="w-px h-8 bg-stone-200/60 dark:bg-stone-600/60" />
              <View className="flex-1 items-center">
                <Text className="text-primary text-xl font-black font-kanit">
                  {attendanceStats?.totalCount || 0}
                </Text>
                <Text className="text-text-secondary text-[10px] font-bold font-kanit uppercase mt-0.5">
                  Total
                </Text>
              </View>
              <View className="w-px h-8 bg-stone-200/60 dark:bg-stone-600/60" />
              <View className="flex-1 items-center">
                <Text className="text-primary text-xl font-black font-kanit">
                  {attendanceStats?.streak || 0}
                </Text>
                <Text className="text-text-secondary text-[10px] font-bold font-kanit uppercase mt-0.5">
                  Streak
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Active Plan Card */}
        <Animated.View entering={FadeInUp.delay(300)}>
          <TouchableOpacity
            onPress={() => router.push("/home/subscription-details" as any)}
            activeOpacity={0.9}
            className="bg-card rounded-3xl p-6 mb-8 border border-stone-200/5 dark:border-stone-900/5 overflow-hidden"
          >
            <View className="flex-row items-start">
              <View className="w-12 h-12 rounded-2xl bg-primary/10 items-center justify-center mr-4">
                <CreditCard {...({ size: 22, stroke: colors.primary } as any)} />
              </View>
              <View className="flex-1 min-w-0">
                <Text className="text-text-secondary text-[10px] font-bold font-kanit uppercase tracking-wider mb-1">
                  Active Plan
                </Text>
                <Text className="text-text text-lg font-black font-kanit" numberOfLines={1}>
                  {activeSubscription?.plan?.name || "No Active Plan"}
                </Text>
                <View
                  className={`mt-2 px-3 py-1.5 rounded-xl self-start ${activeSubscription ? "bg-green-500/10" : "bg-red-500/10"}`}
                >
                  <Text
                    className={`text-[10px] font-bold font-kanit uppercase ${activeSubscription ? "text-green-500" : "text-red-500"}`}
                  >
                    {activeSubscription?.status || "Inactive"}
                  </Text>
                </View>
              </View>
              <ChevronRight {...({ size: 20, stroke: colors.muted } as any)} />
            </View>

            {activeSubscription && (
              <>
                <View className="h-px bg-stone-200/30 dark:bg-stone-700/50 my-4" />
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Calendar {...({ size: 16, stroke: colors.muted } as any)} />
                    <Text className="text-text-secondary text-sm font-kanit ml-2">
                      Expires {new Date(activeSubscription.endDate).toLocaleDateString()}
                    </Text>
                  </View>
                  <View
                    className={`px-3 py-1.5 rounded-xl ${daysRemaining !== null && daysRemaining <= 7 ? "bg-orange-500/10" : "bg-primary/10"}`}
                  >
                    <Text
                      className={`text-xs font-bold font-kanit ${daysRemaining !== null && daysRemaining <= 7 ? "text-orange-500" : "text-primary"}`}
                    >
                      {daysRemaining} days left
                    </Text>
                  </View>
                </View>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Menu Groups */}
        <View className="mb-6">
          <Text className="text-text-secondary text-[10px] font-bold font-kanit uppercase tracking-[2px] mb-4 ml-2">
            Account & Access
          </Text>
          <MenuItem
            icon={User}
            title="Edit Profile"
            onPress={() => router.push("/home/edit-profile" as any)}
          />
          <MenuItem
            icon={Building2}
            title="My Gym Branches"
            onPress={() => router.push("/gym/gym-list" as any)}
            iconColor="#38BDF8"
          />
          <MenuItem
            icon={CreditCard}
            title="Payment History"
            onPress={() => router.push("/payment-history" as any)}
            iconColor="#A855F7"
          />
        </View>

        {/* Settings Group */}
        <View className="mb-6">
          <Text className="text-text-secondary text-[10px] font-bold font-kanit uppercase tracking-[2px] mb-4 ml-2">
            Settings
          </Text>
          <MenuItem
            icon={Palette}
            title="Appearance"
            value="Theme & Display"
            onPress={() => router.push("/appearance" as any)}
            iconColor="#F59E0B"
          />
        </View>

        <View className="mb-6">
          <Text className="text-text-secondary text-[10px] font-bold font-kanit uppercase tracking-[2px] mb-4 ml-2">
            Support & Legal
          </Text>
          <MenuItem
            icon={HelpCircle}
            title="Help & Support"
            onPress={() => router.push("/help" as any)}
            iconColor="#F97316"
          />
          <MenuItem icon={Shield} title="Privacy Policy" onPress={() => {}} iconColor="#10B981" />
          <MenuItem
            icon={Info}
            title="About Fitzo"
            value="v2.0.1"
            onPress={() => {}}
            iconColor="#6B7280"
          />
        </View>

        {/* Logout Button */}
        <Animated.View entering={FadeInUp.delay(600)}>
          <TouchableOpacity
            onPress={handleLogout}
            disabled={isLoggingOut}
            className="flex-row items-center justify-center p-6 bg-red-500/10 rounded-[32px] border border-red-500/20 mb-10"
          >
            <LogOut {...({ size: 20, stroke: colors.error } as any)} />
            <Text className="text-red-500 font-bold text-base font-kanit ml-3">
              Log Out Account
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </ScreenWrapper>
  );
}
