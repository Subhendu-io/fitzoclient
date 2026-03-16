import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { Camera, Image as ImageIcon, RefreshCcw, CheckCircle2, ChevronRight, Zap, Target, ListChecks } from 'lucide-react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Header } from '@/components/layout/Header';
import { analyzeFitness, FitnessAssessment } from '../services/fitnessScoreService';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';

export function FitnessScoreScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FitnessAssessment | null>(null);

  const pickImage = async (useCamera: boolean) => {
    let result;
    if (useCamera) {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission denied', 'We need camera access to take your fitness photo.');
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
      Alert.alert('Analysis Failed', 'Could not analyze your fitness level. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#C8FF32';
    if (score >= 60) return '#60A5FA';
    if (score >= 40) return '#FBBF24';
    return '#F87171';
  };

  return (
    <ScreenWrapper className="bg-background">
      <Header title="AI Fitness Assessment" showBackButton />
      
      <ScrollView className="flex-1 px-6 pb-20" showsVerticalScrollIndicator={false}>
        {!result && !loading && (
          <View className="py-8">
            <View className="bg-card border border-white/5 rounded-[40px] p-8 items-center mb-8">
               <View className="w-20 h-20 rounded-3xl bg-primary/10 items-center justify-center mb-6">
                 <Zap {...({ size: 32, stroke: "#C8FF32" } as any)} />
               </View>
               <Text className="text-white text-2xl font-black font-kanit text-center mb-3">
                 Visual Fitness Score
               </Text>
               <Text className="text-text-secondary text-sm font-kanit text-center leading-5">
                 Get an instant, AI-powered evaluation of your physique, posture, and muscle tone.
               </Text>
            </View>

            {image ? (
              <Animated.View entering={FadeInUp} className="mb-8">
                <Image source={{ uri: image }} className="w-full aspect-[3/4] rounded-[40px] border-4 border-white/5" />
                <TouchableOpacity 
                   onPress={() => setImage(null)}
                   className="absolute top-4 right-4 bg-black/60 p-2 rounded-full"
                >
                   <RefreshCcw {...({ size: 20, stroke: "white" } as any)} />
                </TouchableOpacity>
              </Animated.View>
            ) : (
              <View className="flex-row space-x-4 mb-8">
                <TouchableOpacity 
                  onPress={() => pickImage(true)}
                  className="flex-1 bg-card border border-white/5 rounded-3xl p-8 items-center"
                >
                   <Camera {...({ size: 32, stroke: "#C8FF32" } as any)} />
                   <Text className="text-white font-bold font-kanit mt-4">Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => pickImage(false)}
                  className="flex-1 bg-card border border-white/5 rounded-3xl p-8 items-center"
                >
                   <ImageIcon {...({ size: 32, stroke: "#C8FF32" } as any)} />
                   <Text className="text-white font-bold font-kanit mt-4">Gallery</Text>
                </TouchableOpacity>
              </View>
            )}

            {image && (
              <TouchableOpacity 
                onPress={startAnalysis}
                className="bg-primary py-5 rounded-3xl items-center shadow-lg shadow-primary/20"
              >
                <Text className="text-black font-black text-lg font-kanit">START ANALYSIS</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {loading && (
          <View className="py-20 items-center">
            <Animated.View entering={ZoomIn} className="w-32 h-32 rounded-full bg-primary/10 items-center justify-center mb-8">
               <ActivityIndicator color="#C8FF32" size="large" />
            </Animated.View>
            <Text className="text-white text-xl font-bold font-kanit">Analyzing your physique...</Text>
            <Text className="text-text-secondary font-kanit mt-2">Checking muscle tone and posture</Text>
          </View>
        )}

        {result && (
          <View className="py-6">
            <Animated.View entering={FadeInUp} className="items-center mb-8">
               <View 
                 style={{ borderColor: getScoreColor(result.score) }}
                 className="w-40 h-40 rounded-full border-[10px] items-center justify-center bg-card shadow-xl"
               >
                 <Text className="text-white text-6xl font-black font-kanit">{result.score}</Text>
                 <Text className="text-text-secondary text-[10px] font-bold font-kanit uppercase -mt-2">AI Score</Text>
               </View>
            </Animated.View>

            <View className="space-y-6">
              <View className="bg-card border border-white/5 rounded-[32px] p-6">
                <View className="flex-row items-center mb-4">
                  <Target {...({ size: 18, stroke: "#C8FF32" } as any)} />
                  <Text className="text-white text-lg font-bold font-kanit ml-3">Today's Focus</Text>
                </View>
                <Text className="text-text-secondary font-kanit leading-relaxed">{result.todayPlan}</Text>
              </View>

              <View className="bg-card border border-white/5 rounded-[32px] p-6">
                <View className="flex-row items-center mb-4">
                  <Zap {...({ size: 18, stroke: "#C8FF32" } as any)} />
                  <Text className="text-white text-lg font-bold font-kanit ml-3">Phsysique Analysis</Text>
                </View>
                <Text className="text-text-secondary font-kanit leading-relaxed">{result.analysis}</Text>
              </View>

              <View className="bg-card border border-white/5 rounded-[32px] p-6">
                <View className="flex-row items-center mb-6">
                  <ListChecks {...({ size: 18, stroke: "#C8FF32" } as any)} />
                  <Text className="text-white text-lg font-bold font-kanit ml-3">Action Steps</Text>
                </View>
                <View className="space-y-4">
                  {result.recommendations.map((rec, i) => (
                    <View key={i} className="flex-row space-x-4">
                       <CheckCircle2 {...({ size: 20, stroke: "#C8FF32", opacity: 0.6 } as any)} />
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
                className="bg-white/5 py-5 rounded-3xl items-center border border-white/5"
              >
                <Text className="text-white font-bold font-kanit">NEW ASSESSMENT</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
