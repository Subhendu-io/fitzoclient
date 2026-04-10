import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { Camera, Image as ImageIcon, RefreshCcw, Info, Zap } from 'lucide-react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Header } from '@/components/layout/Header';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useToaster } from '@/providers/useToaster';
import { useModal } from '@/providers/useModal';
import { useAuthStore } from '@/store/useAuthStore';
import { getUserFitnessProfile } from '@/features/auth/services/authService';

import HeroSection from '../components/HeroSection';
import { LastResults } from '../components/LastResults';
import { FitnessProfile } from '../components/FitnessProfile';
import { FitnessResult } from '../components/FitnessResult';
import { analyzeFitness, FitnessAssessment } from '../services/fitnessScoreService';
import { AppUser } from '@/interfaces/member';

export function FitnessScoreScreen() {
  const { showToast } = useToaster();
  const { showModal } = useModal();
  const colors = useThemeColors();
  const [image, setImage] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FitnessAssessment | null>(null);
  
  const user = useAuthStore(s => s.user);
  const [profile, setProfile] = useState<AppUser | null>(null);

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
      const assessment = await analyzeFitness(base64);
      setResult(assessment);
    } catch (error) {
      showToast({ title: 'Analysis Failed', message: 'Could not analyze your fitness level. Please try again.', variant: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper className="bg-background">
      <Header title="AI Fitness Assessment" showBackButton />

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>

        {loading && (
          <View className="mb-6 items-center">
            <Animated.View entering={ZoomIn} className="w-32 h-32 rounded-full bg-primary/10 items-center justify-center mb-8">
              <ActivityIndicator color={colors.primary} size="large" />
            </Animated.View>
            <Text className="text-text text-xl font-bold font-kanit">Analyzing your physique...</Text>
            <Text className="text-text-secondary font-kanit mt-2">Checking muscle tone and posture</Text>
          </View>
        )}

        {!result && !loading && (
          <View className="mb-6">
            <HeroSection />
          </View>
        )}

        {!result && !loading && (
          <View className="mb-6">
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

        {!loading && (
          <View className="mb-6">
            <FitnessProfile profile={profile} />
          </View>
        )}

        {result && (
          <View className="mb-6">
            <FitnessResult 
              result={result} 
              image={image}
              onReset={() => {
                setResult(null);
                setImage(null);
              }} 
            />
          </View>
        )}

        {!result && ( 
          <View className="mb-6">
            <LastResults onSelectResult={(result) => setResult(result)} />
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
