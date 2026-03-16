import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Header } from '@/components/layout/Header';
import { Building2, CheckCircle2, ChevronRight, MapPin } from 'lucide-react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { getTenantInfo } from '@/services/memberService';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

export function GymListScreen() {
  const router = useRouter();
  const { profile, activeGym, setActiveGym } = useAuthStore();
  const [gymDetails, setGymDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGyms = async () => {
      if (!profile?.gyms || profile.gyms.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const details = await Promise.all(
          profile.gyms.map(async (gymId) => {
            const info = await getTenantInfo(gymId);
            return { id: gymId, ...info };
          })
        );
        setGymDetails(details);
      } catch (error) {
        console.error('Error loading gym details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGyms();
  }, [profile?.gyms]);

  const handleSwitchGym = async (gymId: string) => {
    if (gymId === activeGym) return;

    try {
      setLoading(true);
      // Update store
      setActiveGym(gymId);
      
      // Optionally update profile on server if needed
      // await updateAppUser(profile!.uid, { activeGym: gymId });

      Alert.alert('Success', 'Active gym switched successfully');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to switch gym');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper className="bg-background">
      <Header title="My Gyms" showBackButton />
      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        <Text className="text-text-secondary text-xs font-bold font-kanit uppercase tracking-widest mb-6">
          Your Memberships
        </Text>

        {loading ? (
          <View className="py-20 items-center">
            <ActivityIndicator color="#C8FF32" size="large" />
          </View>
        ) : (
          <View className="space-y-4">
            {gymDetails.length > 0 ? (
              gymDetails.map((gym, i) => (
                <Animated.View 
                  key={gym.id} 
                  entering={FadeInDown.delay(i * 100)}
                >
                  <TouchableOpacity 
                    onPress={() => handleSwitchGym(gym.id)}
                    className={`p-6 rounded-[32px] border ${
                      gym.id === activeGym 
                        ? 'bg-primary/10 border-primary/30' 
                        : 'bg-card border-white/5'
                    }`}
                  >
                    <View className="flex-row items-center">
                      <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${
                         gym.id === activeGym ? 'bg-primary' : 'bg-white/5'
                      }`}>
                        <Building2 {...({ size: 24, stroke: gym.id === activeGym ? "black" : "white" } as any)} />
                      </View>
                      
                      <View className="flex-1">
                        <Text className={`text-lg font-bold font-kanit ${
                          gym.id === activeGym ? 'text-primary' : 'text-white'
                        }`}>
                          {gym.name || 'Fitzo Gym'}
                        </Text>
                        <View className="flex-row items-center mt-1">
                          <MapPin {...({ size: 12, stroke: "#616161" } as any)} />
                          <Text className="text-text-secondary text-xs font-kanit ml-1">
                            {gym.address || 'Location Placeholder'}
                          </Text>
                        </View>
                      </View>

                      {gym.id === activeGym ? (
                        <CheckCircle2 {...({ size: 24, stroke: "#C8FF32" } as any)} />
                      ) : (
                        <ChevronRight {...({ size: 20, stroke: "#616161" } as any)} />
                      )}
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))
            ) : (
              <View className="py-20 items-center">
                 <Building2 {...({ size: 48, stroke: "#616161", opacity: 0.3 } as any)} />
                 <Text className="text-text-secondary font-kanit mt-4 text-center">
                   You haven't joined any gyms yet. Scan a QR code at your gym to get started!
                 </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
