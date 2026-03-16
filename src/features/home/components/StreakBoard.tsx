import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Trophy, TrendingUp } from 'lucide-react-native';
import { AttendanceStreakBoardEntry } from '@/interfaces/member';

interface StreakBoardProps {
  data: AttendanceStreakBoardEntry[];
}

export function StreakBoard({ data }: StreakBoardProps) {
  if (!data || data.length === 0) return null;

  return (
    <View className="bg-card border border-white/5 rounded-[32px] p-6 mb-6">
      <View className="flex-row items-center mb-6">
        <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
          <Trophy {...({ size: 20, stroke: "#C8FF32" } as any)} />
        </View>
        <Text className="text-white text-lg font-bold font-kanit">Streak Board</Text>
      </View>

      <View className="space-y-4">
        {data.map((entry) => (
          <View 
            key={entry.memberId} 
            className={`flex-row items-center p-4 rounded-2xl ${
              entry.isCurrentUser ? 'bg-primary/10 border border-primary/20' : 'bg-white/5'
            }`}
          >
            <View className="w-8 h-8 rounded-full bg-white/10 items-center justify-center mr-4">
              <Text className="text-white font-bold font-kanit">{entry.rank}</Text>
            </View>
            
            <View className="flex-1">
              <Text className={`font-bold font-kanit ${
                entry.isCurrentUser ? 'text-primary' : 'text-white'
              }`}>
                {entry.memberName}
              </Text>
              <Text className="text-text-secondary text-[10px] font-kanit uppercase">
                Overall visits: {entry.totalCheckIns}
              </Text>
            </View>

            <View className="flex-row items-center bg-black/20 px-3 py-1.5 rounded-full">
              <TrendingUp {...({ size: 14, stroke: "#C8FF32" } as any)} />
              <Text className="text-primary font-bold font-kanit ml-2">{entry.streak}</Text>
            </View>
          </View>
        ))}
      </View>
      
      <TouchableOpacity className="mt-6 items-center">
        <Text className="text-primary text-[10px] font-bold font-kanit uppercase">View Full Leaderboard</Text>
      </TouchableOpacity>
    </View>
  );
}
