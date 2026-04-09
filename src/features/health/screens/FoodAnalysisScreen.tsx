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
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Camera,
  Image as ImageIcon,
  UtensilsCrossed,
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  ThumbsUp,
  ThumbsDown,
  Flame,
  ShieldCheck,
  Target,
  Scale,
  Activity,
} from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { analyzeFood, FoodAssessment } from '../services/foodAnalysisService';
import { useToaster } from '@/providers/useToaster';
import { useAuthStore } from '@/store/useAuthStore';
import { getUserFitnessProfile } from '@/features/auth/services/authService';
import { UserFitnessProfile } from '@/interfaces/member';

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
  const [profile, setProfile] = useState<UserFitnessProfile | null>(null);

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
      // Clear param so it only triggers once
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
              <ActivityIndicator size="large" color={colors.primary} style={{ transform: [{ scale: 1.5 }] }} />
              <View className="absolute">
                <UtensilsCrossed {...({ size: 32, stroke: colors.primary, opacity: 0.5 } as any)} />
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
          <Animated.View entering={FadeInUp.delay(200)} className="space-y-4">
          
            {result.imageUrl && (
               <View className="w-full relative items-center justify-center mb-2 mt-4">
                 <Image 
                   source={{ uri: result.imageUrl }} 
                   className="w-full aspect-[4/3] rounded-[32px] opacity-90" 
                   style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }} 
                 />
               </View>
            )}

            {/* Calories Card */}
            <LinearGradient
              colors={
                result.isHealthy
                  ? ['#10b981', '#059669'] // Emerald green
                  : ['#ef4444', '#b91c1c'] // Red
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-[32px] p-6 items-center mb-4 mt-2"
            >
              <View className="flex-row items-center bg-black/20 px-3 py-1.5 rounded-full mb-4 space-x-2">
                {result.isHealthy ? (
                  <CheckCircle2 {...({ size: 16, stroke: '#FFFFFF' } as any)} />
                ) : (
                  <AlertTriangle {...({ size: 16, stroke: '#FFFFFF' } as any)} />
                )}
                <Text className="text-white text-xs font-bold font-kanit tracking-wider ml-1">
                  {result.isHealthy ? "HEALTHY CHOICE" : "CONSUME IN MODERATION"}
                </Text>
              </View>
              <Text className="text-white text-6xl font-black font-kanit leading-tight">
                {result.totalCalories}
              </Text>
              <Text className="text-white text-lg font-bold font-kanit mt-1">Calories</Text>
              <Text className="text-white/80 text-xs font-kanit text-center mt-4 leading-5">
                {result.caloriesBreakdown}
              </Text>
            </LinearGradient>

            {/* Health Notes */}
            <View className="bg-card border border-stone-200/5 dark:border-stone-900/5 rounded-3xl p-5 mb-4 shadow-sm shadow-black/5">
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 rounded-xl bg-blue-500/10 items-center justify-center mr-3">
                  <ShieldCheck {...({ size: 20, stroke: '#3b82f6' } as any)} />
                </View>
                <Text className="text-text text-lg font-bold font-kanit">Dietitian's Verdict</Text>
              </View>
              <Text className="text-text-secondary font-kanit leading-6">
                {result.healthNotes}
              </Text>
            </View>

            {/* Benefits & Drawbacks */}
            <View className="flex-row space-x-4 mb-4" style={{ gap: 16 }}>
              {result.benefits && result.benefits.length > 0 && (
                <View className="flex-1 bg-card border border-stone-200/5 dark:border-stone-900/5 rounded-3xl p-5 shadow-sm shadow-black/5">
                  <View className="flex-row items-center mb-3 space-x-2">
                    <ThumbsUp {...({ size: 16, stroke: '#10b981' } as any)} />
                    <Text className="text-text font-bold font-kanit ml-2">Benefits</Text>
                  </View>
                  {result.benefits.map((item, i) => (
                    <Text key={i} className="text-text-secondary text-xs font-kanit mb-1 leading-5">
                      • {item}
                    </Text>
                  ))}
                </View>
              )}
              {result.drawbacks && result.drawbacks.length > 0 && (
                <View className="flex-1 bg-card border border-stone-200/5 dark:border-stone-900/5 rounded-3xl p-5 shadow-sm shadow-black/5">
                  <View className="flex-row items-center mb-3 space-x-2">
                    <ThumbsDown {...({ size: 16, stroke: '#ef4444' } as any)} />
                    <Text className="text-text font-bold font-kanit ml-2">Drawbacks</Text>
                  </View>
                  {result.drawbacks.map((item, i) => (
                    <Text key={i} className="text-text-secondary text-xs font-kanit mb-1 leading-5">
                      • {item}
                    </Text>
                  ))}
                </View>
              )}
            </View>

            {/* Workout Suggestions */}
            {result.workoutSuggestions && result.workoutSuggestions.length > 0 && (
              <View className="bg-card border border-stone-200/5 dark:border-stone-900/5 rounded-3xl p-5 mb-4 shadow-sm shadow-black/5">
                <View className="flex-row items-center mb-4 space-x-3">
                  <View className="w-10 h-10 rounded-xl bg-orange-500/10 items-center justify-center mr-3">
                    <Flame {...({ size: 20, stroke: '#f97316' } as any)} />
                  </View>
                  <Text className="text-text text-lg font-bold font-kanit">Burn It Off</Text>
                </View>
                {result.workoutSuggestions.map((rec, index) => (
                  <View key={index} className="flex-row items-start mb-3 space-x-3 pr-2">
                    <View className="w-6 h-6 rounded-full bg-primary/10 items-center justify-center mt-0.5 mr-2">
                      <Text className="text-primary text-xs font-bold font-kanit">{index + 1}</Text>
                    </View>
                    <Text className="text-text-secondary font-kanit leading-5 flex-1 pr-4">{rec}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Scan Again Button */}
            <TouchableOpacity
              className="bg-white/5 py-5 rounded-3xl items-center border border-stone-200/5 dark:border-stone-900/5 mt-4"
              onPress={handleReset}
              activeOpacity={0.8}
            >
              <Text className="text-text font-bold font-kanit">NEW ASSESSMENT</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Upload State */}
        {!loading && !result && (
          <Animated.View entering={FadeInUp.delay(200)} className="space-y-6 gap-4">
            {/* HERO SECTION */}
            <View className="bg-teal-600 rounded-[40px] p-8 items-center mb-2 shadow-2xl shadow-teal-500/40 relative overflow-hidden">
               <View className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
               <View className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-2xl" />
               
               <View className="w-20 h-20 rounded-[32px] bg-white/20 items-center justify-center mb-6 shadow-sm border border-white/20 z-10">
                 <UtensilsCrossed {...({ size: 40, stroke: '#FFFFFF' } as any)} />
               </View>
               
               <Text className="text-white text-3xl font-black font-kanit text-center mb-3 z-10" style={{ letterSpacing: 0.5 }}>
                 DIET AI PRO
               </Text>
               <Text className="text-white/90 text-[15px] font-kanit text-center leading-6 px-2 z-10 font-medium">
                 Unlock an instant, clinical-grade analysis of your meal, calorie breakdown, and tailored workout ideas.
               </Text>
            </View>


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
                   <View className="w-12 h-12 bg-lime-100/20 dark:bg-lime-800/20 rounded-2xl items-center justify-center mb-3">
                     <Camera {...({ size: 24, stroke: colors.primary } as any)} />
                   </View>
                   <Text className="text-text text-center text-[15px] font-black font-kanit">Take Photo</Text>
                   <Text className="text-text-secondary text-center font-kanit text-[11px] mt-1 leading-tight">Live scan picture</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => handlePickImage('gallery')}
                  className="flex-1 bg-card border-2 border-border rounded-[32px] p-5 items-center shadow-md shadow-black/5"
                >
                   <View className="w-12 h-12 bg-lime-100/20 dark:bg-lime-800/20 rounded-2xl items-center justify-center mb-3">
                     <ImageIcon {...({ size: 24, stroke: colors.primary } as any)} />
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
                className="bg-primary py-5 rounded-3xl items-center shadow-lg shadow-primary/30 active:scale-95 transition-transform"
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

            {profile && (
              <Animated.View entering={FadeInUp.delay(100)} className="mb-4 bg-card border border-stone-200/5 dark:border-stone-900/5 rounded-[32px] p-6 shadow-xl shadow-black/5">
                <Text className="text-text font-black font-kanit text-lg mb-5">Your Health Profile</Text>
                
                <View className="flex-row flex-wrap">
                  {/* Body Stats */}
                  <View className="w-[50%] flex-row items-center mb-6 pl-1 pr-2">
                    <View className="w-10 h-10 rounded-xl bg-lime-100/20 dark:bg-lime-800/20 items-center justify-center mr-3">
                      <Scale {...({ size: 18, stroke: colors.primary } as any)} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-text-secondary text-[10px] uppercase font-bold font-kanit">Body</Text>
                      <Text className="text-text font-black font-kanit text-[13px] leading-tight mt-0.5" numberOfLines={2}>
                        {profile.bodyStats?.weight ? `${profile.bodyStats?.weight}kg` : '--'} {profile.bodyStats?.height ? `• ${profile.bodyStats?.height}cm` : ''}
                      </Text>
                    </View>
                  </View>

                  {/* Goal */}
                  <View className="w-[50%] flex-row items-center mb-6 pl-1 pr-2">
                    <View className="w-10 h-10 rounded-xl bg-[#60A5FA]/10 items-center justify-center mr-3">
                      <Target {...({ size: 18, stroke: '#60A5FA' } as any)} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-text-secondary text-[10px] uppercase font-bold font-kanit">Goal</Text>
                      <Text className="text-text font-black font-kanit text-[13px] leading-tight capitalize mt-0.5" numberOfLines={2}>
                        {profile.preferences?.fitnessGoal?.replace('_', ' ') || '--'}
                      </Text>
                    </View>
                  </View>

                  {/* Activity Level */}
                  <View className="w-[50%] flex-row items-center pl-1 pr-2">
                    <View className="w-10 h-10 rounded-xl bg-[#FBBF24]/10 items-center justify-center mr-3">
                      <Activity {...({ size: 18, stroke: '#FBBF24' } as any)} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-text-secondary text-[10px] uppercase font-bold font-kanit">Activity</Text>
                      <Text className="text-text font-black font-kanit text-[13px] leading-tight capitalize mt-0.5" numberOfLines={2}>
                        {profile.preferences?.activityLevel?.replace('_', ' ') || '--'}
                      </Text>
                    </View>
                  </View>

                  {/* Diet Focus */}
                  <View className="w-[50%] flex-row items-center pl-1 pr-2">
                    <View className="w-10 h-10 rounded-xl bg-[#34D399]/10 items-center justify-center mr-3">
                      <Flame {...({ size: 18, stroke: '#34D399' } as any)} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-text-secondary text-[10px] uppercase font-bold font-kanit">Diet</Text>
                      <Text className="text-text font-black font-kanit text-[13px] leading-tight capitalize mt-0.5" numberOfLines={2}>
                        {profile.preferences?.dietPreference || '--'}
                      </Text>
                    </View>
                  </View>
                </View>
              </Animated.View>
            )}

            {/* Disclaimer */}
            <View className="flex-row items-start px-2 mt-2">
              <Info {...({ size: 16, stroke: colors.muted, marginTop: 2 } as any)} />
              <Text className="text-text-secondary text-xs font-kanit flex-1 ml-2 leading-5">
                Estimations are provided by AI and may not be 100% accurate. Do not rely entirely on these values for strict medical dietary needs.
              </Text>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
