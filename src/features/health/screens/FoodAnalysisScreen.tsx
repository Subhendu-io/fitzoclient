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
} from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { analyzeFood, FoodAssessment } from '../services/foodAnalysisService';
import { saveDietTracking, uploadHealthImage } from '@/services/healthTrackingService';
import { useToaster } from '@/providers/useToaster';
import { Save } from 'lucide-react-native';

export function FoodAnalysisScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ source?: 'camera' | 'gallery' }>();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FoodAssessment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const { showToast } = useToaster();

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
        setHasSaved(false);
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
      const assessment = await analyzeFood(imageBase64);
      setResult(assessment);
      setHasSaved(false);
    } catch (err: any) {
      console.error('[FoodAnalysis] Error:', err);
      const message = err?.message || 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [imageBase64]);

  const handleReset = useCallback(() => {
    setImageUri(null);
    setImageBase64(null);
    setResult(null);
    setError(null);
    setHasSaved(false);
  }, []);

  const handleSaveToLog = async () => {
    if (!result || hasSaved) return;
    
    setIsSaving(true);
    try {
      let imageUrl;
      if (imageUri) {
        imageUrl = await uploadHealthImage(imageUri, 'dietTracking');
      }

      await saveDietTracking({
        date: new Date().toISOString().split('T')[0],
        assessment: result,
        imageUrl,
      });
      setHasSaved(true);
      showToast({
        title: "Saved!",
        message: "This meal has been added to your diet log.",
        variant: "success",
      });
    } catch (err) {
      showToast({
        title: "Error",
        message: "Failed to save to log. Please try again.",
        variant: "danger",
      });
    } finally {
      setIsSaving(false);
    }
  };

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
            {/* Calories Card */}
            <LinearGradient
              colors={
                result.isHealthy
                  ? ['#10b981', '#059669'] // Emerald green
                  : ['#ef4444', '#b91c1c'] // Red
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-[32px] p-6 items-center mb-4"
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
            <View className="bg-card border border-stone-200/5 dark:border-stone-900/5 rounded-3xl p-5 mb-4">
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
                <View className="flex-1 bg-card border border-stone-200/5 dark:border-stone-900/5 rounded-3xl p-5">
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
                <View className="flex-1 bg-card border border-stone-200/5 dark:border-stone-900/5 rounded-3xl p-5">
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
              <View className="bg-card border border-stone-200/5 dark:border-stone-900/5 rounded-3xl p-5 mb-4">
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

            {/* Save to Log Button */}
            <TouchableOpacity
              className={`flex-row items-center justify-center py-4 rounded-2xl mt-4 ${
                hasSaved ? 'bg-green-500/10 border border-green-500/20' : 'bg-primary'
              }`}
              onPress={handleSaveToLog}
              disabled={isSaving || hasSaved}
              activeOpacity={0.8}
            >
              {isSaving ? (
                <ActivityIndicator color={colors.background} size="small" />
              ) : hasSaved ? (
                <>
                  <CheckCircle2 {...({ size: 20, stroke: '#10b981' } as any)} />
                  <Text className="text-green-500 font-bold font-kanit text-lg ml-2">Saved to Log</Text>
                </>
              ) : (
                <>
                  <Save {...({ size: 20, stroke: colors.background } as any)} />
                  <Text className="text-background font-bold font-kanit text-lg ml-2">Save to Diet Log</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Scan Again Button */}
            <TouchableOpacity
              className="flex-row items-center justify-center py-4 rounded-2xl border border-primary mt-2"
              onPress={handleReset}
              activeOpacity={0.8}
            >
              <RefreshCw {...({ size: 18, stroke: colors.primary } as any)} />
              <Text className="text-primary font-bold font-kanit ml-2">Analyze Another Item</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Upload State */}
        {!loading && !result && (
          <Animated.View entering={FadeInUp.delay(200)} className="space-y-6">
            {/* Hero Section */}
            <View className="items-center py-6">
              <View className="w-20 h-20 rounded-3xl bg-teal-500/10 items-center justify-center mb-6">
                <UtensilsCrossed {...({ size: 36, stroke: '#0D9488' } as any)} />
              </View>
              <Text className="text-text text-2xl font-bold font-kanit text-center mb-2">
                Food & Drink Analyzer
              </Text>
              <Text className="text-text-secondary font-kanit text-center leading-5 max-w-[280px]">
                Upload a photo of your meal or drink to instantly calculate calories and get tailored health notes.
              </Text>
            </View>

            {/* Image Preview */}
            {imageUri && (
              <View className="rounded-3xl overflow-hidden relative w-full aspect-[3/4] mb-6">
                <Image source={{ uri: imageUri }} className="w-full h-full" resizeMode="cover" />
                <TouchableOpacity
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 items-center justify-center backdrop-blur-sm"
                  onPress={() => setImageUri(null)}
                >
                  <X {...({ size: 20, stroke: '#FFFFFF' } as any)} />
                </TouchableOpacity>
              </View>
            )}

            {/* Pick Image Buttons */}
            {!imageUri && (
              <View className="flex-row space-x-4 mb-6" style={{ gap: 16 }}>
                <TouchableOpacity
                  className="flex-1"
                  onPress={() => handlePickImage('camera')}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#0D9488', '#0F766E']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="rounded-3xl p-5 items-center justify-center"
                  >
                    <Camera {...({ size: 32, stroke: '#FFFFFF' } as any)} />
                    <Text className="text-white font-bold font-kanit mt-3">Take Photo</Text>
                    <Text className="text-white/70 text-xs font-kanit mt-1 text-center">Use your camera</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 bg-card border-2 border-border rounded-3xl p-5 items-center justify-center"
                  onPress={() => handlePickImage('gallery')}
                  activeOpacity={0.8}
                >
                  <ImageIcon {...({ size: 32, stroke: colors.primary } as any)} />
                  <Text className="text-text font-bold font-kanit mt-3">Gallery</Text>
                  <Text className="text-text-secondary text-xs font-kanit mt-1 text-center">Choose an existing photo</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Analyze Button */}
            {imageUri && (
              <TouchableOpacity
                className="overflow-hidden rounded-2xl mb-6 shadow-sm shadow-teal-500/20"
                onPress={handleAnalyze}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#0D9488', '#0F766E']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="flex-row items-center justify-center py-4 space-x-2"
                >
                  <Text className="text-white font-bold font-kanit text-lg mr-2">
                    Calculate Nutrition
                  </Text>
                  <UtensilsCrossed {...({ size: 20, stroke: '#FFFFFF' } as any)} />
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Error */}
            {error && (
              <View className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex-row items-center mb-6">
                <AlertCircle {...({ size: 20, stroke: '#ef4444' } as any)} />
                <Text className="text-red-500 font-kanit text-sm ml-3 flex-1">{error}</Text>
              </View>
            )}

            {/* Disclaimer */}
            <View className="flex-row items-start px-2 mt-4 pb-8">
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
