import React from 'react';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Home, Dumbbell, Scan, HeartPulse, Users } from 'lucide-react-native';
import { Platform, View, useColorScheme } from 'react-native';
import { useThemeColors } from '../../src/hooks/useThemeColors';

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.background,
          elevation: 0,
          height: 80,
          paddingBottom: 25,
          paddingTop: 10,
        },
        tabBarBackground: () => 
          Platform.OS === 'ios' ? (
            <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} className="absolute fill-current" />
          ) : undefined,
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View className={`p-2 rounded-xl ${focused ? 'bg-primary/10' : ''}`}>
              <Home {...({ size, stroke: color, strokeWidth: focused ? 2.5 : 2 } as any)} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="fitness/index"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View className={`p-2 rounded-xl ${focused ? 'bg-primary/10' : ''}`}>
              <Dumbbell {...({ size, stroke: color, strokeWidth: focused ? 2.5 : 2 } as any)} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="scanner/index"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View className={`p-2 rounded-xl ${focused ? 'bg-primary/10' : ''}`}>
              <Scan {...({ size, stroke: color, strokeWidth: focused ? 2.5 : 2 } as any)} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="gym/index"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View className={`p-2 rounded-xl ${focused ? 'bg-primary/10' : ''}`}>
              <HeartPulse {...({ size, stroke: color, strokeWidth: focused ? 2.5 : 2 } as any)} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="community/index"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View className={`p-2 rounded-xl ${focused ? 'bg-primary/10' : ''}`}>
              <Users {...({ size, stroke: color, strokeWidth: focused ? 2.5 : 2 } as any)} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
