import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Trophy, TrendingUp } from "lucide-react-native";
import { AttendanceStreakBoardEntry } from "@/interfaces/member";
import { useThemeColors } from "@/hooks/useThemeColors";

interface StreakBoardProps {
  data: AttendanceStreakBoardEntry[];
}

export function StreakBoard({ data }: StreakBoardProps) {
  const colors = useThemeColors();
  if (!data || data.length === 0) return null;

  return (
    <View className="bg-card border border-stone-200/5 dark:border-stone-900/5 rounded-[32px] p-6 mb-6">
      <View className="flex-row items-center mb-6">
        <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
          <Trophy {...({ size: 20, stroke: colors.primary } as any)} />
        </View>
        <Text className="text-text text-lg font-bold font-kanit">Streak Board</Text>
      </View>

      <View className="space-y-4">
        {data.map((entry) => (
          <View
            key={entry.memberId}
            className={`flex-row items-center p-4 rounded-2xl ${
              entry.isCurrentUser
                ? "bg-primary/10 border border-stone-200/50 dark:border-stone-800/50"
                : "bg-white/5"
            }`}
          >
            <View className="w-8 h-8 rounded-full bg-white/10 items-center justify-center mr-4">
              <Text className="text-text font-bold font-kanit">{entry.rank}</Text>
            </View>

            <View className="flex-1">
              <Text
                className={`font-bold font-kanit ${
                  entry.isCurrentUser ? "text-primary" : "text-text"
                }`}
              >
                {entry.memberName}
              </Text>
              <Text className="text-text-secondary text-[10px] font-kanit uppercase">
                Overall visits: {entry.totalCheckIns}
              </Text>
            </View>

            <View
              className={`flex-row rounded-3xl bg-green-500/10 dark:bg-green-900/10 items-center px-3 py-1`}
            >
              <TrendingUp
                {...({
                  size: 14,
                  stroke: entry.isCurrentUser ? colors.primary : colors.error,
                } as any)}
              />
              <Text
                className={`font-bold font-kanit ml-2 ${entry.isCurrentUser ? "text-green-400" : "text-red-400"}`}
              >
                {entry.streak}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity className="mt-6 items-center">
        <Text className="text-primary text-[10px] font-bold font-kanit uppercase">
          View Full Leaderboard
        </Text>
      </TouchableOpacity>
    </View>
  );
}
