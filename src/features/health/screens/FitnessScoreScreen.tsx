import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { Camera, Image as ImageIcon, RefreshCcw, CheckCircle2, Info, Zap, Target, ListChecks, Scale, Activity, Flame } from 'lucide-react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Header } from '@/components/layout/Header';
import { analyzeFitness, FitnessAssessment } from '../services/fitnessScoreService';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useToaster } from '@/providers/useToaster';
import { useModal } from '@/providers/useModal';
import { useAuthStore } from '@/store/useAuthStore';
import { getUserFitnessProfile } from '@/features/auth/services/authService';
import { UserFitnessProfile } from '@/interfaces/member';

export function FitnessScoreScreen() {
  const { showToast } = useToaster();
  const { showModal } = useModal();
  const colors = useThemeColors();
  const [image, setImage] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FitnessAssessment | null>(null);
  
  const user = useAuthStore(s => s.user);
  const [profile, setProfile] = useState<UserFitnessProfile | null>(null);

  useEffect(() => {
    if (user?.uid) {
      getUserFitnessProfile(user.uid).then(p => {
        if (p) setProfile(p);
      });
    }
  }, [user?.uid]);

  const pickImage = async (useCamera: boolean) => {
    let result;
    if (useCamera) {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        showModal({
           title: 'Permission denied', 
           message: 'We need camera access to take your fitness photo.',
           variant: 'warn',
           buttons: [{ text: 'OK', style: 'default' }]
        });
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
        base64: true,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
        base64: true,
      });
    }

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
      setBase64(result.assets[0].base64 || null);
    }
  };

  const startAnalysis = async () => {
    if (!base64) return;
    setLoading(true);
    try {
      const assessment = await analyzeFitness({
        imageBase64: base64,
        userStats: profile ? {
          weight: profile.bodyStats?.weight,
          height: profile.bodyStats?.height,
          goal: profile.preferences?.fitnessGoal,
          activityLevel: profile.preferences?.activityLevel
        } : undefined
      });
      setResult(assessment);
    } catch (error) {
      showToast({ title: 'Analysis Failed', message: 'Could not analyze your fitness level. Please try again.', variant: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return colors.primary;
    if (score >= 60) return '#60A5FA';
    if (score >= 40) return '#FBBF24';
    return '#F87171';
  };

  return (
    <ScreenWrapper className="bg-background">
      <Header title="AI Fitness Assessment" showBackButton />
      
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {!result && !loading && (
          <View className="py-4">
            {/* HERO SECTION */}
            <View className="bg-primary rounded-[40px] p-8 items-center mb-8 shadow-2xl shadow-primary/40 relative overflow-hidden">
               <View className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
               <View className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-2xl" />
               
               <View className="w-20 h-20 rounded-[32px] bg-white/20 items-center justify-center mb-6 shadow-sm border border-white/20 z-10">
                 <Zap {...({ size: 40, stroke: '#FFFFFF' } as any)} />
               </View>
               
               <Text className="text-black text-3xl font-black font-kanit text-center mb-3 z-10" style={{ letterSpacing: 0.5 }}>
                 FITNESS AI PRO
               </Text>
               <Text className="text-black/80 text-[15px] font-kanit text-center leading-6 px-2 z-10 font-medium">
                 Unlock an instant, clinical-grade analysis of your physique, posture, and muscle definition.
               </Text>
            </View>

            {image ? (
              <Animated.View entering={FadeInUp} className="mb-8">
                <Image source={{ uri: image }} className="w-full aspect-[3/4] rounded-[40px] border-[6px] border-stone-100 dark:border-stone-800 shadow-xl shadow-black/10" />
                <TouchableOpacity 
                   onPress={() => setImage(null)}
                   className="absolute top-6 right-6 bg-black/70 p-3 rounded-full"
                >
                   <RefreshCcw {...({ size: 22, stroke: '#FFFFFF' } as any)} />
                </TouchableOpacity>
              </Animated.View>
            ) : (
              <View className="flex-row gap-4">
                <TouchableOpacity 
                  onPress={() => pickImage(true)}
                  className="flex-1 bg-card border-2 border-border rounded-[32px] p-5 items-center shadow-lg shadow-black/5"
                >
                   <View className="w-12 h-12 bg-lime-100/20 dark:bg-lime-800/20 rounded-2xl items-center justify-center mb-3">
                     <Camera {...({ size: 24, stroke: colors.primary } as any)} />
                   </View>
                   <Text className="text-text text-center text-[15px] font-black font-kanit">Take Photo</Text>
                   <Text className="text-text-secondary text-center font-kanit text-[11px] mt-1 leading-tight">Live scan picture</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => pickImage(false)}
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

            {image && (
              <TouchableOpacity 
                onPress={startAnalysis}
                className="bg-primary py-5 rounded-3xl items-center shadow-lg shadow-primary/30 active:scale-95 transition-transform"
              >
                <Text className="text-black font-black text-xl font-kanit" style={{ letterSpacing: 1 }}>START ANALYSIS</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {profile && (
          <View className="py-4">
            <Animated.View entering={FadeInUp.delay(100)} className="p-6 bg-card border border-stone-200/5 dark:border-stone-900/5 rounded-[32px] shadow-xl shadow-black/5">
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
          </View>
        )}

        {loading && (
          <View className="py-4 items-center">
            <Animated.View entering={ZoomIn} className="w-32 h-32 rounded-full bg-primary/10 items-center justify-center mb-8">
               <ActivityIndicator color={colors.primary} size="large" />
            </Animated.View>
            <Text className="text-text text-xl font-bold font-kanit">Analyzing your physique...</Text>
            <Text className="text-text-secondary font-kanit mt-2">Checking muscle tone and posture</Text>
          </View>
        )}

        {result && (
          <View className="py-4">
            <Animated.View entering={FadeInUp} className="mb-10 items-center">
              {/* Show the uploaded user image attractively as a background relative to score */}
              <View className="w-full relative items-center justify-center mb-8">
                <Image 
                  source={{ uri: result.imageUrl || image || '' }} 
                  className="w-full aspect-[4/3] rounded-[40px] opacity-80" 
                  style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }} 
                />
                
                {/* Score overlaps the image bottom */}
                <View 
                  style={{ borderColor: getScoreColor(result.score), elevation: 15 }}
                  className="absolute -bottom-10 w-32 h-32 rounded-full border-[8px] items-center justify-center bg-card shadow-2xl shadow-black/50"
                >
                  <Text className="text-text text-5xl font-black font-kanit">{result.score}</Text>
                  <Text className="text-text-secondary text-[10px] font-bold font-kanit uppercase mt-0">AI Score</Text>
                </View>
              </View>
            </Animated.View>

            <View className="space-y-6">
              <View className="bg-card border border-stone-200/5 dark:border-stone-900/5 rounded-[32px] p-6">
                <View className="flex-row items-center mb-4">
                  <Target {...({ size: 18, stroke: colors.primary } as any)} />
                  <Text className="text-text text-lg font-bold font-kanit ml-3">Today's Focus</Text>
                </View>
                <Text className="text-text-secondary font-kanit leading-relaxed">{result.todayPlan}</Text>
              </View>

              <View className="bg-card border border-stone-200/5 dark:border-stone-900/5 rounded-[32px] p-6">
                <View className="flex-row items-center mb-4">
                  <Zap {...({ size: 18, stroke: colors.primary } as any)} />
                  <Text className="text-text text-lg font-bold font-kanit ml-3">Phsysique Analysis</Text>
                </View>
                <Text className="text-text-secondary font-kanit leading-relaxed">{result.analysis}</Text>
              </View>

              <View className="bg-card border border-stone-200/5 dark:border-stone-900/5 rounded-[32px] p-6">
                <View className="flex-row items-center mb-6">
                  <ListChecks {...({ size: 18, stroke: colors.primary } as any)} />
                  <Text className="text-text text-lg font-bold font-kanit ml-3">Action Steps</Text>
                </View>
                <View className="space-y-4">
                  {result.recommendations.map((rec, i) => (
                    <View key={i} className="flex-row space-x-4">
                       <CheckCircle2 {...({ size: 20, stroke: colors.primary, opacity: 0.6 } as any)} />
                       <Text className="flex-1 text-text-secondary font-kanit leading-5">{rec}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <TouchableOpacity 
                onPress={() => {
                  setResult(null);
                  setImage(null);
                }}
                className="bg-white/5 py-5 rounded-3xl items-center border border-stone-200/5 dark:border-stone-900/5"
              >
                <Text className="text-text font-bold font-kanit">NEW ASSESSMENT</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Disclaimer */}
        <View className="flex-row items-start px-2 mt-2 mb-24">
          <Info {...({ size: 16, stroke: colors.muted, marginTop: 2 } as any)} />
          <Text className="text-text-secondary text-xs font-kanit flex-1 ml-2 leading-5">
            Estimations are provided by AI and may not be 100% accurate. Do not rely entirely on these values for strict medical dietary needs.
          </Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
