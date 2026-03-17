import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import {
  Receipt,
  CreditCard,
  Banknote,
  Landmark,
  Wallet,
  Filter,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react-native";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { Header } from "@/components/layout/Header";
import { useAuthStore } from "@/store/useAuthStore";
import { useQuery } from "@tanstack/react-query";
import { getMemberPayments } from "@/services/memberService";
import { useMemberLink } from "@/hooks/useMemberLink";
import { Payment } from "@/interfaces/member";
import { format } from "date-fns";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useThemeColors } from "@/hooks/useThemeColors";

export function PaymentHistoryScreen() {
  const colors = useThemeColors();
  const { activeGym, activeBranchId } = useAuthStore();
  const { data: memberLink } = useMemberLink();
  const [filter, setFilter] = useState<"all" | "paid" | "pending" | "failed">("all");

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["payments", activeGym, activeBranchId, memberLink?.id, filter],
    queryFn: async () => {
      const all = await getMemberPayments(
        activeGym!,
        memberLink!.id,
        50,
        activeBranchId || undefined,
      );
      if (filter === "all") return all;
      return all.filter((p: Payment) => p.status === filter);
    },
    enabled: !!activeGym && !!memberLink?.id,
  });

  const totalPaid = payments
    .filter((p: Payment) => p.status === "paid")
    .reduce((sum: number, p: Payment) => sum + p.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return colors.primary;
      case "pending":
        return "#FBBF24";
      case "failed":
        return "#F87171";
      default:
        return "#9CA3AF";
    }
  };

  const getMethodIcon = (method: string) => {
    const props = { size: 18, stroke: colors.primary } as any;
    switch (method) {
      case "upi":
        return <Wallet {...props} />;
      case "card":
        return <CreditCard {...props} />;
      case "cash":
        return <Banknote {...props} />;
      case "bank_transfer":
        return <Landmark {...props} />;
      default:
        return <Receipt {...props} />;
    }
  };

  if (isLoading) {
    return (
      <ScreenWrapper className="bg-background">
        <Header title="Transactions" showBackButton />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper className="bg-background">
      <Header title="Transactions" showBackButton />

      <ScrollView className="flex-1 px-6 pb-20" showsVerticalScrollIndicator={false}>
        {/* Investment Summary - Primary hero card */}
        <Animated.View entering={FadeInUp} className="mt-6 mb-8">
          <View
            className="rounded-[32px] p-6 overflow-hidden border border-border"
            style={{ backgroundColor: colors.primary }}
          >
            <Text
              className="text-xs font-black uppercase tracking-widest mb-2 opacity-90"
              style={{ color: colors.onPrimary }}
            >
              Total Invested
            </Text>
            <Text
              className="text-3xl font-black font-kanit mb-5"
              style={{ color: colors.onPrimary }}
            >
              ₹{totalPaid.toLocaleString()}
            </Text>
            <View
              className="flex-row items-center rounded-2xl py-2.5 px-4 self-start"
              style={{ backgroundColor: colors.onPrimary + "20" }}
            >
              <CheckCircle2 size={14} stroke={colors.onPrimary} />
              <Text className="text-xs font-bold ml-2" style={{ color: colors.onPrimary }}>
                {payments.length} Transactions
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6 mb-8">
          <View className="flex-row space-x-3">
            {["all", "paid", "pending", "failed"].map((opt) => (
              <TouchableOpacity
                key={opt}
                onPress={() => setFilter(opt as any)}
                className={`py-2.5 px-6 rounded-full border ${filter === opt ? "border-primary" : "bg-transparent border-border"}`}
                style={filter === opt ? { backgroundColor: colors.primary } : undefined}
                activeOpacity={0.8}
              >
                <Text
                  className="font-bold font-kanit text-sm"
                  style={{ color: filter === opt ? colors.onPrimary : colors.textSecondary }}
                >
                  {opt.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Payment History List */}
        <View className="space-y-4">
          {payments.length > 0 ? (
            payments.map((p: Payment, i: number) => (
              <Animated.View key={p.id} entering={FadeInUp.delay(i * 50)}>
                <View className="bg-card border border-stone-200/5 dark:border-stone-900/5 rounded-3xl p-6 mb-4 flex-row items-center">
                  <View className="w-12 h-12 rounded-2xl bg-white/5 items-center justify-center mr-4">
                    {getMethodIcon(p.paymentMethod || "")}
                  </View>
                  <View className="flex-1">
                    <Text className="text-text font-bold font-kanit uppercase tracking-tighter">
                      {p.paymentMethod?.replace("_", " ") || "Payment"}
                    </Text>
                    <Text className="text-text-secondary text-[10px] font-kanit mt-1">
                      {format(new Date(p.paymentDate), "MMM dd, yyyy • HH:mm")}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-text font-black font-kanit">
                      ₹{p.amount.toLocaleString()}
                    </Text>
                    <View
                      style={{ backgroundColor: `${getStatusColor(p.status || "pending")}20` }}
                      className="py-0.5 px-2 rounded-lg mt-1"
                    >
                      <Text
                        style={{ color: getStatusColor(p.status || "pending") }}
                        className="text-[8px] font-black uppercase tracking-wider"
                      >
                        {p.status}
                      </Text>
                    </View>
                  </View>
                </View>
              </Animated.View>
            ))
          ) : (
            <View className="py-20 items-center">
              <Receipt {...({ size: 48, stroke: "#374151" } as any)} />
              <Text className="text-text-secondary font-kanit mt-4">
                No records found for "{filter}".
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
