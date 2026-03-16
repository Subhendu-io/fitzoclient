import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Header } from '@/components/layout/Header';
import { ChevronRight, LogOut, User, Bell, Shield, Moon, CreditCard, Building2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';

export function SettingsScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();

  const MenuItem = ({ icon: Icon, title, value }: any) => (
    <TouchableOpacity className="flex-row items-center justify-between p-6 border-b border-white/5">
      <View className="flex-row items-center space-x-4">
        <Icon {...({ size: 20, stroke: "white" } as any)} />
        <Text className="text-white text-base font-kanit ml-4">{title}</Text>
      </View>
      <View className="flex-row items-center">
        {value && <Text className="text-text-secondary mr-2 font-kanit">{value}</Text>}
        <ChevronRight {...({ size: 16, stroke: "#616161" } as any)} />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper className="bg-background">
      <Header title="Settings" showBackButton />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-4">
           <Text className="text-text-secondary text-xs font-bold font-kanit uppercase tracking-widest mb-2">Account</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/edit-profile')}>
           <MenuItem icon={User} title="Profile Info" value={`${profile?.firstName} ${profile?.lastName}`} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/gym-list')}>
           <MenuItem icon={Building2} title="My Gyms" value={profile?.gyms?.length || 0} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/wallet')}>
           <MenuItem icon={CreditCard} title="Wallet & Subscriptions" value="Active" />
        </TouchableOpacity>
        <MenuItem icon={Bell} title="Notifications" value="On" />
        
        <View className="px-6 py-4 mt-4">
           <Text className="text-text-secondary text-xs font-bold font-kanit uppercase tracking-widest mb-2">Preferences</Text>
        </View>
        <MenuItem icon={Moon} title="Dark Mode" value="System" />
        <MenuItem icon={Shield} title="Privacy & Security" />

        <TouchableOpacity 
          className="flex-row items-center justify-center space-x-2 p-8 mt-8"
          onPress={() => router.replace('/(auth)/login')}
        >
          <LogOut {...({ size: 20, stroke: "#F44336" } as any)} />
          <Text className="text-[#F44336] font-bold text-base font-kanit ml-2">Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
}
