import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { Header } from "@/components/layout/Header";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CreditCard, PhoneCall } from "lucide-react-native";
import { useThemeColors } from "@/hooks/useThemeColors";

export default function BuySubscriptionScreen() {
  const { tenantId, branchId } = useLocalSearchParams();
  const colors = useThemeColors();
  const router = useRouter();

  return (
    <ScreenWrapper>
      <Header title="Get Subscription" showBackButton />
      <View className="flex-1 px-8 pt-10 items-center">
        <View className="bg-primary/10 p-6 rounded-full mb-8">
          <CreditCard color={colors.primary} size={60} />
        </View>
        
        <Text className="text-text text-3xl font-bold font-kanit mb-4 text-center">
          Active Plan Required
        </Text>
        
        <Text className="text-text-secondary text-lg font-kanit text-center mb-12">
          You need an active subscription to access the gym and mark attendance.
        </Text>

        <View className="w-full space-y-4">
          <TouchableOpacity 
            className="w-full bg-primary py-4 rounded-2xl items-center flex-row justify-center space-x-3"
            onPress={() => {/* In real app, open plans or payment */}}
          >
            <CreditCard color="black" size={20} />
            <Text className="text-black font-bold font-kanit text-lg">See All Plans</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="w-full bg-white/5 py-4 rounded-2xl items-center flex-row justify-center space-x-3 border border-white/10"
            onPress={() => {/* In real app, dial gym phone */}}
          >
            <PhoneCall color={colors.text} size={20} />
            <Text className="text-text font-bold font-kanit text-lg">Contact Gym Manager</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}
