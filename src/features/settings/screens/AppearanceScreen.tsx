import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Header } from '@/components/layout/Header';
import { Sun, Moon, Monitor, Check } from 'lucide-react-native';
import { useSettingsStore } from '@/store/settingsStore';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useThemeColors } from '@/hooks/useThemeColors';

const THEME_OPTIONS = [
  {
    id: 'light' as const,
    label: 'Light',
    description: 'A bright, clean interface',
    icon: Sun,
    color: '#F59E0B',
    preview: '#F2F2F7',
  },
  {
    id: 'dark' as const,
    label: 'Dark',
    description: 'Easy on the eyes, saves battery',
    icon: Moon,
    color: '#6366F1',
    preview: '#0D0D0D',
  },
  {
    id: 'system' as const,
    label: 'System',
    description: 'Matches your device settings',
    icon: Monitor,
    color: '#6B7280',
    preview: undefined,
  },
];

export function AppearanceScreen() {
  const colors = useThemeColors();
  const { theme, setTheme } = useSettingsStore();

  return (
    <ScreenWrapper>
      <Header title="Appearance" showBackButton />

      <View className="flex-1 px-6 pt-4">
        <Animated.View entering={FadeInUp.delay(100)}>
          <Text className="text-text-secondary text-[10px] font-bold font-kanit uppercase tracking-[2px] mb-4 ml-2">
            Theme
          </Text>

          <View className="gap-3">
            {THEME_OPTIONS.map((option) => {
              const isSelected = theme === option.id;

              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => setTheme(option.id)}
                  activeOpacity={0.8}
                  className={`flex-row items-center p-5 rounded-3xl border ${
                    isSelected
                      ? 'bg-primary/10 border-primary'
                      : 'bg-card/50 border-stone-200/10 dark:border-stone-900/10'
                  }`}
                >
                  <View
                    className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${
                      isSelected ? 'bg-primary/20' : 'bg-card'
                    }`}
                  >
                    <option.icon
                      {...({
                        size: 22,
                        stroke: isSelected ? colors.primary : option.color,
                      } as any)}
                    />
                  </View>

                  <View className="flex-1">
                    <Text
                      className={`text-base font-bold font-kanit ${
                        isSelected ? 'text-primary' : 'text-text'
                      }`}
                    >
                      {option.label}
                    </Text>
                    <Text className="text-text-secondary text-xs font-kanit mt-0.5">
                      {option.description}
                    </Text>
                  </View>

                  {isSelected && (
                    <View className="w-8 h-8 rounded-full bg-primary items-center justify-center">
                      <Check {...({ size: 16, stroke: colors.onPrimary } as any)} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200)} className="mt-8">
          <Text className="text-text-secondary text-[10px] font-bold font-kanit uppercase tracking-[2px] mb-4 ml-2">
            Preview
          </Text>
          <View className="bg-card rounded-3xl border border-stone-200/10 dark:border-stone-900/10 p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-text font-bold font-kanit">Sample Text</Text>
              <View className="bg-primary px-3 py-1 rounded-full">
                <Text className="text-black text-[10px] font-bold font-kanit">BADGE</Text>
              </View>
            </View>
            <Text className="text-text-secondary text-xs font-kanit leading-relaxed">
              This is how content will appear in your selected theme. The colors, backgrounds, and text contrast will adapt automatically.
            </Text>
            <View className="flex-row gap-3 mt-4">
              <View className="flex-1 bg-primary/10 rounded-2xl p-3 items-center">
                <Text className="text-primary text-lg font-black font-kanit">42</Text>
                <Text className="text-text-secondary text-[10px] font-kanit">Visits</Text>
              </View>
              <View className="flex-1 bg-primary/10 rounded-2xl p-3 items-center">
                <Text className="text-primary text-lg font-black font-kanit">7</Text>
                <Text className="text-text-secondary text-[10px] font-kanit">Streak</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </View>
    </ScreenWrapper>
  );
}
