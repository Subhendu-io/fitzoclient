import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { Bell } from "lucide-react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useDashboard } from "@/hooks/useDashboard";
import { useAuthStore } from "@/store/useAuthStore";
import { subscribeToNotifications } from "@/features/notifications/services/notificationService";
import { MetricCard } from "../components/MetricCard";
import { WorkoutCard } from "../components/WorkoutCard";
import { SessionVoucherCard } from "../components/SessionVoucherCard";
import { CrowdForecastCard } from "../components/CrowdForecastCard";
import { StreakBoard } from "../components/StreakBoard";
import { HeroCard } from "../components/HeroCard";
import { FitnessScoreCard } from "../components/FitnessScoreCard";
import { MembershipCard } from "../components/MembershipCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { useRouter } from "expo-router";
import { useThemeColors } from "@/hooks/useThemeColors";
import { UserAvatar } from "@/components/shared/UserAvatar";

export function HomeScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { user } = useAuthStore();
  const { profile, isLoading: isProfileLoading } = useUserProfile();
  const { data: workouts, isLoading: isWorkoutsLoading } = useWorkouts();
  const {
    streakBoard,
    latestRedemption,
    crowdForecast,
    attendanceStats,
    currentWeekAttendance,
    activeSubscription,
    daysRemaining,
    weekRange,
    isLoading: isDashboardLoading,
  } = useDashboard();

  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToNotifications(
      user.uid,
      (notifications) => {
        const unread = notifications.filter((n) => !n.read).length;
        setUnreadNotificationCount(unread);
      },
      () => {
        setUnreadNotificationCount(0);
      },
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const displayName = profile ? `${profile.firstName}` : "Explorer";

  if (isProfileLoading || isDashboardLoading) {
    return (
      <ScreenWrapper className="bg-background px-6">
        <View className="flex-row items-center justify-between mt-6 mb-8">
          <View>
            <Skeleton width={100} height={12} className="mb-2" />
            <Skeleton width={150} height={24} />
          </View>
          <Skeleton width={48} height={48} borderRadius={24} />
        </View>
        <Skeleton width="100%" height={240} borderRadius={40} className="mb-6" />
        <Skeleton width="100%" height={160} borderRadius={40} className="mb-6" />
        <Skeleton width="100%" height={120} borderRadius={40} className="mb-6" />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper className="bg-background">
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Aura Header */}
        <Animated.View
          entering={FadeInUp.delay(200)}
          className="flex-row items-center justify-between mt-6 mb-8"
        >
          <View>
            <View className="flex-row items-center">
              <Text className="text-text-secondary text-sm font-kanit">Hello, </Text>
              <Text className="text-primary text-sm font-bold font-kanit">{displayName} 👋</Text>
            </View>
            <Text className="text-text text-2xl font-black font-kanit leading-tight mt-1">
              Ready to crush{"\n"}your goals today?
            </Text>
          </View>

          <View className="flex-row items-center space-x-3">
            <TouchableOpacity
              onPress={() => router.push("/home/notifications" as any)}
              className="p-3 mr-2 bg-card rounded-2xl border border-stone-200/5 dark:border-stone-900/5 relative"
            >
              <Bell {...({ size: 22, stroke: colors.text } as any)} />
              {unreadNotificationCount > 0 && (
                <View className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary items-center justify-center border-2 border-background">
                  <Text className="text-black text-[8px] font-black">
                    {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/settings" as any)}
              className="w-14 h-14 rounded-2xl bg-primary border border-stone-200/10 dark:border-stone-900/10 items-center justify-center overflow-hidden"
            >
              <UserAvatar textSize="text-3xl" textWeight="black" profile={profile || null} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Hero Section: QR + Attendance */}
        <Animated.View entering={FadeInUp.delay(300)}>
          <HeroCard weekAttendance={currentWeekAttendance} startOfWeek={weekRange.start} />
        </Animated.View>

        {/* Fitness Score Card */}
        <Animated.View entering={FadeInUp.delay(400)}>
          <FitnessScoreCard score={90} />
        </Animated.View>

        {/* Dynamic Widgets Area */}
        {latestRedemption && (
          <Animated.View entering={FadeInUp.delay(450)}>
            <SessionVoucherCard redemption={latestRedemption} />
          </Animated.View>
        )}

        <Animated.View entering={FadeInUp.delay(500)}>
          <MembershipCard subscription={activeSubscription || null} daysRemaining={daysRemaining} />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(600)}>
          <CrowdForecastCard forecast={crowdForecast || null} />
        </Animated.View>

        {/* Journey Stats */}
        <View className="flex-row justify-between items-center mb-6 px-1">
          <Text className="text-text text-xl font-bold font-kanit">My Journey</Text>
          <TouchableOpacity onPress={() => router.push("/home/edit-profile" as any)}>
            <Text className="text-primary text-xs font-bold font-kanit uppercase tracking-wider">
              View All
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row flex-wrap -mx-2 mb-8">
          <MetricCard
            title="Day Streak"
            value={attendanceStats?.streak?.toString() || "0"}
            unit="days"
            trend="up"
            delay={700}
          />
          <MetricCard
            title="This Month"
            value={attendanceStats?.thisMonth?.toString() || "0"}
            unit="visits"
            trend="stable"
            delay={800}
          />
        </View>

        {/* Community Leaderboard Snippet */}
        <StreakBoard data={streakBoard} />

        {/* Workout Preview */}
        {!isWorkoutsLoading && workouts && workouts.length > 0 && (
          <View className="mt-4">
            <View className="flex-row justify-between items-center mb-6 px-1">
              <Text className="text-text text-xl font-bold font-kanit">Recommended Workouts</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="-mx-6 px-6 mb-8"
            >
              {workouts.slice(0, 5).map((workout, index) => (
                <WorkoutCard
                  key={workout.id || index}
                  title={workout.snapshot?.title || "Workout"}
                  trainer={workout.snapshot?.difficulty || "All Levels"}
                  image="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400"
                />
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
