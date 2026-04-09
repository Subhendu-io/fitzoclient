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
          backgroundColor: isDark ? colors.background : colors.background,
          elevation: 0,
          height: 68,
          paddingBottom: 15,
          paddingTop: 15,
          borderWidth: 0.1,
          borderTopWidth: 0.1,
          borderColor: isDark ? colors.accentLight : colors.accent,
          borderRadius: 40,
          marginHorizontal: 20,
          marginVertical: 20,
        },
        tabBarBackground: () => 
          Platform.OS === 'ios' ? (
            <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} className="absolute fill-current" />
          ) : undefined,
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View className="p-4" style={{ backgroundColor: focused ? isDark ? '#1a1826' : colors.accentLight : 'transparent', borderRadius: 50 }}>
              <Home {...({ size, stroke: focused ? colors.primary : color, strokeWidth: focused ? 2.5 : 2 } as any)} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="(fitness)"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View className="p-4" style={{ backgroundColor: focused ? isDark ? '#1a1826' : colors.accentLight : 'transparent', borderRadius: 50 }}>
              <Dumbbell {...({ size, stroke: focused ? colors.warning : color, strokeWidth: focused ? 2.5 : 2 } as any)} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="(scanner)"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View className="p-4" style={{ backgroundColor: focused ? isDark ? '#1a1826' : colors.accentLight : 'transparent', borderRadius: 50 }}>
              <Scan {...({ size, stroke: focused ? colors.accent : color, strokeWidth: focused ? 2.5 : 2 } as any)} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="(health)"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View className="p-4" style={{ backgroundColor: focused ? isDark ? '#1a1826' : colors.accentLight : 'transparent', borderRadius: 50 }}>
              <HeartPulse {...({ size, stroke: focused ? colors.primaryHover : color, strokeWidth: focused ? 2.5 : 2 } as any)} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="(community)"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View className="p-4" style={{ backgroundColor: focused ? isDark ? '#1a1826' : colors.accentLight : 'transparent', borderRadius: 50 }}>
              <Users {...({ size, stroke: focused ? colors.accent : color, strokeWidth: focused ? 2.5 : 2 } as any)} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
