import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Header } from '@/components/layout/Header';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Camera,
  Image as ImageIcon,
  UtensilsCrossed,
  X,
  AlertCircle,
  Info,
} from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { analyzeFood, FoodAssessment } from '../services/foodAnalysisService';
import { useToaster } from '@/providers/useToaster';
import { useAuthStore } from '@/store/useAuthStore';
import { getUserFitnessProfile } from '@/features/auth/services/authService';
import { AppUser } from '@/interfaces/member';

import { DietHeroSection } from '../components/DietHeroSection';
import { FoodProfile } from '../components/FoodProfile';
import { FoodResult } from '../components/FoodResult';
import { LastDietResults } from '../components/LastDietResults';

export function FoodAnalysisScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ source?: 'camera' | 'gallery' }>();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FoodAssessment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToaster();

  const user = useAuthStore(s => s.user);
  const [profile, setProfile] = useState<AppUser | null>(null);

  useEffect(() => {
    if (user?.uid) {
      getUserFitnessProfile(user.uid).then(p => {
        if (p) setProfile(p);
      });
    }
  }, [user?.uid]);

  // Helper to trigger picker based on params on mount
  useEffect(() => {
    if (params.source && !imageUri && !loading && !result) {
      if (params.source === 'camera') {
        handlePickImage('camera');
      } else if (params.source === 'gallery') {
        handlePickImage('gallery');
      }
      router.setParams({ source: undefined });
    }
  }, [params.source]);

  const handlePickImage = useCallback(async (source: 'camera' | 'gallery') => {
    try {
      let permissionResult;
      
      if (source === 'camera') {
        permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      } else {
        permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      }

      if (permissionResult.status !== 'granted') {
        Alert.alert(
          'Permission Required',
          `Please grant ${source} permissions to analyze your food.`
        );
        return;
      }

      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      };

      let pickerResult;
      if (source === 'camera') {
        pickerResult = await ImagePicker.launchCameraAsync(options);
      } else {
        pickerResult = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!pickerResult.canceled && pickerResult.assets?.[0]) {
        const asset = pickerResult.assets[0];
        setImageUri(asset.uri);
        setImageBase64(asset.base64 || null);
        setResult(null);
        setError(null);
      }
    } catch (err) {
      console.error('Image picker error:', err);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!imageBase64) return;

    setLoading(true);
    setError(null);

    try {
      const assessment = await analyzeFood({
        imageBase64,
        userStats: profile ? {
          weight: profile.bodyStats?.weight,
          height: profile.bodyStats?.height,
          goal: profile.preferences?.fitnessGoal,
          activityLevel: profile.preferences?.activityLevel,
          dietPreference: profile.preferences?.dietPreference
        } : undefined
      });
      setResult(assessment);
      showToast({ title: 'Success', message: 'Meal analyzed and tracked automatically!', variant: 'success' });
    } catch (err: any) {
      console.error('[FoodAnalysis] Error:', err);
      const message = err?.message || 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [imageBase64, profile]);

  const handleReset = useCallback(() => {
    setImageUri(null);
    setImageBase64(null);
    setResult(null);
    setError(null);
  }, []);

  return (
    <ScreenWrapper className="bg-background">
      <Header title="Diet Analyzer" showBackButton />

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Loading State */}
        {loading && (
          <Animated.View entering={FadeIn} className="flex-1 items-center justify-center py-20">
            <View className="mb-8 relative items-center justify-center">
              <ActivityIndicator size="large" color={colors.warning} style={{ transform: [{ scale: 1.5 }] }} />
              <View className="absolute">
                <UtensilsCrossed {...({ size: 32, stroke: colors.warning, opacity: 0.5 } as any)} />
              </View>
            </View>
            <Text className="text-text text-2xl font-bold font-kanit mb-2 text-center">
              Analyzing Nutrition
            </Text>
            <Text className="text-text-secondary font-kanit text-center">
              Our AI is calculating calories and health notes...
            </Text>
          </Animated.View>
        )}

        {/* Result State */}
        {!loading && result && (
          <FoodResult result={result} onReset={handleReset} />
        )}

        {/* Upload State */}
        {!loading && !result && (
          <Animated.View entering={FadeInUp.delay(200)} className="space-y-6 gap-4">
            
            <DietHeroSection />

            {/* Image Preview */}
            {imageUri && (
              <View className="rounded-[40px] overflow-hidden relative w-full aspect-[3/4] mb-2 border-[6px] border-stone-100 dark:border-stone-800 shadow-xl shadow-black/10">
                <Image source={{ uri: imageUri }} className="w-full h-full" resizeMode="cover" />
                <TouchableOpacity
                  className="absolute top-6 right-6 w-12 h-12 rounded-full bg-black/70 items-center justify-center"
                  onPress={() => setImageUri(null)}
                >
                  <X {...({ size: 24, stroke: '#FFFFFF' } as any)} />
                </TouchableOpacity>
              </View>
            )}

            {/* Pick Image Buttons */}
            {!imageUri && (
              <View className="flex-row gap-4 mb-2">
                <TouchableOpacity 
                  onPress={() => handlePickImage('camera')}
                  className="flex-1 bg-card border-2 border-border rounded-[32px] p-5 items-center shadow-lg shadow-black/5"
                >
                   <View className="w-12 h-12 bg-orange-100/20 dark:bg-orange-800/20 rounded-2xl items-center justify-center mb-3">
                     <Camera {...({ size: 24, stroke: colors.warning } as any)} />
                   </View>
                   <Text className="text-text text-center text-[15px] font-black font-kanit">Take Photo</Text>
                   <Text className="text-text-secondary text-center font-kanit text-[11px] mt-1 leading-tight">Live scan picture</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => handlePickImage('gallery')}
                  className="flex-1 bg-card border-2 border-border rounded-[32px] p-5 items-center shadow-md shadow-black/5"
                >
                   <View className="w-12 h-12 bg-orange-100/20 dark:bg-orange-800/20 rounded-2xl items-center justify-center mb-3">
                     <ImageIcon {...({ size: 24, stroke: colors.warning } as any)} />
                   </View>
                   <Text className="text-text text-center text-[15px] font-black font-kanit">Gallery</Text>
                   <Text className="text-text-secondary text-center font-kanit text-[11px] mt-1 leading-tight">Upload existing file</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Analyze Button */}
            {imageUri && (
              <TouchableOpacity 
                onPress={handleAnalyze}
                className="py-5 rounded-3xl items-center shadow-lg shadow-orange-500/30 active:scale-95 transition-transform"
                style={{ backgroundColor: colors.warning }}
              >
                <Text className="text-black font-black text-xl font-kanit" style={{ letterSpacing: 1 }}>ANALYZE NUTRITION</Text>
              </TouchableOpacity>
            )}

            {/* Error */}
            {error && (
              <View className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex-row items-center mb-6">
                <AlertCircle {...({ size: 20, stroke: '#ef4444' } as any)} />
                <Text className="text-red-500 font-kanit text-sm ml-3 flex-1">{error}</Text>
              </View>
            )}

            {profile && <FoodProfile profile={profile} />}

            <LastDietResults onSelectResult={(data) => setResult(data)} />
          </Animated.View>
        )}

        {/* Disclaimer */}
        <View className="flex-row items-start px-2 mt-4">
          <Info {...({ size: 16, stroke: colors.muted, marginTop: 2 } as any)} />
          <Text className="text-text-secondary text-xs font-kanit flex-1 ml-2 leading-5">
            Estimations are provided by AI and may not be 100% accurate. Do not rely entirely on these values for strict medical dietary needs.
          </Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
