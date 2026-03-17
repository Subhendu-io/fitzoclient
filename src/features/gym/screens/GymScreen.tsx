import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { MapPin, Search, Navigation } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { GymCard } from '../components/GymCard';
import { useThemeColors } from '@/hooks/useThemeColors';

export function GymScreen() {
  const colors = useThemeColors();
  return (
    <ScreenWrapper className="bg-background">
      <ScrollView 
        className="flex-1 px-6" 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Search & Location Selection */}
        <Animated.View 
          entering={FadeInUp.delay(200)}
          className="mt-6 mb-8"
        >
          <View className="flex-row items-center justify-between mb-4">
             <View>
                <Text className="text-text-secondary text-xs font-kanit">Location</Text>
                <View className="flex-row items-center">
                   <MapPin {...({ size: 14, stroke: colors.primary } as any)} />
                   <Text className="text-text text-sm font-bold font-kanit ml-1">New York, USA</Text>
                </View>
             </View>
             <TouchableOpacity className="p-3 bg-primary rounded-2xl">
                <Navigation {...({ size: 20, stroke: colors.onPrimary } as any)} />
             </TouchableOpacity>
          </View>

          <View className="flex-row items-center bg-card rounded-2xl px-4 py-3 border border-stone-200/5 dark:border-stone-900/5">
             <Search {...({ size: 20, stroke: colors.muted } as any)} />
             <TextInput 
                placeholder="Search premium gyms..." 
                placeholderTextColor={colors.muted}
                className="flex-1 ml-3 text-text font-kanit"
             />
          </View>
        </Animated.View>

        {/* Categories / Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6 mb-8">
           {['All', 'Premium', 'Bodybuilding', 'CrossFit', 'Personal Training'].map((cat, i) => (
             <TouchableOpacity 
                key={i} 
                className={`mr-3 px-6 py-3 rounded-2xl border ${i === 0 ? 'bg-primary border-primary' : 'bg-card border-stone-200/5 dark:border-stone-900/5'}`}
             >
                <Text className={`font-bold font-kanit ${i === 0 ? 'text-black' : 'text-text'}`}>{cat}</Text>
             </TouchableOpacity>
           ))}
        </ScrollView>

        {/* Gym List */}
        <View className="flex-row justify-between items-center mb-6">
           <Text className="text-text text-xl font-bold font-kanit">Popular Near You</Text>
           <TouchableOpacity>
              <Text className="text-primary text-xs font-kanit">See All</Text>
           </TouchableOpacity>
        </View>

        <View className="space-y-6">
           <GymCard 
              name="Fitzo Elite Center" 
              location="Manhattan, NY" 
              rating="4.9" 
              image="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800"
              delay={400}
           />
           <GymCard 
              name="Iron Paradise" 
              location="Brooklyn, NY" 
              rating="4.8" 
              image="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800"
              delay={500}
           />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
