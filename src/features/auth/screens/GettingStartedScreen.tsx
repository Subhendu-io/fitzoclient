import React from "react";
import { View, Text, ImageBackground, TouchableOpacity, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { Button } from "@/components/ui/Button";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

// Using the local asset image
const BACKGROUND_IMAGE = require("../../../../assets/images/getting_started_bg.png");

export function GettingStartedScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      <ImageBackground source={BACKGROUND_IMAGE} className="flex-1 justify-end" resizeMode="cover">
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)", "black"]}
          className="absolute inset-0"
        />

        <View className="px-10 pb-20">
          <Animated.View entering={FadeInDown.delay(200).duration(800)}>
            <Text className="text-primary text-xs font-bold font-kanit uppercase tracking-[4px] mb-4">
              Premium Fitness Experience
            </Text>
            <Text className="text-white text-5xl font-extrabold font-kanit leading-[56px] mb-6">
              REACH YOUR <Text className="text-primary">ULTIMATE</Text> POTENTIAL
            </Text>
            <Text className="text-text-secondary text-base font-kanit leading-6 mb-12">
              Join the most exclusive gym community. Track your progress, get personal coaching, and
              transform your body with AI-powered insights.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(400).duration(800)} className="space-y-4">
            <Button
              title="Get Started"
              onPress={() => router.push("/(auth)/register")}
              className="h-16 rounded-2xl"
              textClassName="text-lg font-bold"
            />

            <View className="flex-row justify-center mt-8">
              <Text className="text-text-secondary font-kanit">Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                <Text className="text-primary font-bold font-kanit">Log In</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </ImageBackground>
    </View>
  );
}
