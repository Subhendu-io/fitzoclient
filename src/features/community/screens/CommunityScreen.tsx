import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { MessageSquare, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { PostCard } from '../components/PostCard';
import { useThemeColors } from '@/hooks/useThemeColors';

export function CommunityScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const stories = [
    { name: 'Alex', image: 'https://i.pravatar.cc/150?u=a' },
    { name: 'Sarah', image: 'https://i.pravatar.cc/150?u=b' },
    { name: 'Mike', image: 'https://i.pravatar.cc/150?u=c' },
    { name: 'Emma', image: 'https://i.pravatar.cc/150?u=d' },
    { name: 'John', image: 'https://i.pravatar.cc/150?u=e' },
  ];

  return (
    <ScreenWrapper className="bg-background">
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 mt-6 mb-8 flex-row items-center justify-between">
           <Text className="text-text text-2xl font-bold font-kanit">Community</Text>
           <View className="flex-row space-x-4">
              <TouchableOpacity 
                className="p-3 bg-card rounded-2xl border border-stone-200/5 dark:border-stone-900/5"
                onPress={() => router.push('/community/community-chat')}
              >
                 <MessageSquare {...({ size: 20, stroke: colors.text } as any)} />
              </TouchableOpacity>
           </View>
        </View>

        {/* Stories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6 mb-8">
           <TouchableOpacity className="mr-4 items-center">
              <View className="w-16 h-16 rounded-full border-2 border-dashed border-primary items-center justify-center">
                 <Plus {...({ size: 24, stroke: colors.primary } as any)} />
              </View>
              <Text className="text-text-secondary text-[10px] mt-2 font-kanit">Your Story</Text>
           </TouchableOpacity>
           {stories.map((story, i) => (
             <View key={i} className="mr-4 items-center">
                <View className="w-16 h-16 rounded-full border-2 border-primary p-0.5">
                   <Image source={{ uri: story.image }} className="w-full h-full rounded-full" />
                </View>
                <Text className="text-text text-[10px] mt-2 font-kanit">{story.name}</Text>
             </View>
           ))}
        </ScrollView>

        {/* Groups */}
        <View className="px-6 mb-6">
           <Text className="text-text text-lg font-bold font-kanit mb-4">Discover Groups</Text>
           <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-2">
              {['Fat Loss', 'Yoga Lovers', 'Powerlifting', 'Home Workout'].map((group, i) => (
                <TouchableOpacity key={i} className="mx-2 bg-card px-6 py-4 rounded-3xl border border-stone-200/5 dark:border-stone-900/5">
                   <Text className="text-text font-bold font-kanit">{group}</Text>
                </TouchableOpacity>
              ))}
           </ScrollView>
        </View>

        {/* Feed */}
        <View className="px-6 space-y-6">
           <PostCard 
              name="Sarah Jenkins" 
              time="2h ago" 
              avatar="https://i.pravatar.cc/150?u=sarah"
              content="Just finished a killer 5k run! Feeling amazing. 🔥"
              image="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800"
              likes="1.2k"
              comments="84"
           />
           <PostCard 
              name="Marcus Thorne" 
              time="5h ago" 
              avatar="https://i.pravatar.cc/150?u=marcus"
              content="New PB today! 140kg squat reached. Hard work pays off."
              image="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800"
              likes="850"
              comments="42"
           />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
