import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Header } from '@/components/layout/Header';
import { Mail, Phone, MessageCircle, FileText, ChevronRight, HelpCircle, AlertCircle } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useRouter } from 'expo-router';

const CONTACT_EMAIL = "support@fitzo.fit";
const CONTACT_PHONE = "+919876543210";
const WHATSAPP_NUMBER = "919876543210";

export function HelpScreen() {
  const colors = useThemeColors();
  const router = useRouter();

  const handleEmail = () => {
    Linking.openURL(`mailto:${CONTACT_EMAIL}?subject=Fitzo Support Request`);
  };

  const handlePhone = () => {
    Linking.openURL(`tel:${CONTACT_PHONE}`);
  };

  const handleWhatsApp = () => {
    Linking.openURL(`whatsapp://send?phone=${WHATSAPP_NUMBER}&text=Hi Fitzo Support,`);
  };

  return (
    <ScreenWrapper>
      <Header title="Help & Support" showBackButton />
      
      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        
        {/* Banner */}
        <Animated.View entering={FadeInUp.delay(100)} className="mb-8 items-center bg-card p-6 rounded-[32px] border border-stone-200/5 dark:border-stone-900/5">
          <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
            <HelpCircle {...({ size: 32, stroke: colors.primary } as any)} />
          </View>
          <Text className="text-text text-xl font-bold font-kanit text-center mb-1">
            How can we help you?
          </Text>
          <Text className="text-text-secondary text-sm font-kanit text-center">
            Our team is available to assist you with any questions or issues.
          </Text>
        </Animated.View>

        {/* Categories */}
        <Text className="text-text-secondary text-[10px] font-bold font-kanit uppercase tracking-[2px] mb-4 ml-2">
          Contact Us
        </Text>
        
        <View className="gap-3 mb-8">
          <Animated.View entering={FadeInUp.delay(200)}>
            <TouchableOpacity 
              onPress={handleWhatsApp}
              activeOpacity={0.8}
              className="flex-row items-center p-5 rounded-3xl bg-card border border-stone-200/5 dark:border-stone-900/5"
            >
              <View className="w-12 h-12 rounded-2xl bg-[#25D366]/10 items-center justify-center mr-4">
                <MessageCircle {...({ size: 22, stroke: '#25D366' } as any)} />
              </View>
              <View className="flex-1">
                <Text className="text-text text-base font-bold font-kanit">WhatsApp Support</Text>
                <Text className="text-text-secondary text-xs font-kanit mt-0.5">Quick replies within 5 mins</Text>
              </View>
              <ChevronRight {...({ size: 20, stroke: colors.muted } as any)} />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300)}>
            <TouchableOpacity 
              onPress={handleEmail}
              activeOpacity={0.8}
              className="flex-row items-center p-5 rounded-3xl bg-card border border-stone-200/5 dark:border-stone-900/5"
            >
              <View className="w-12 h-12 rounded-2xl bg-[#6366F1]/10 items-center justify-center mr-4">
                <Mail {...({ size: 22, stroke: '#6366F1' } as any)} />
              </View>
              <View className="flex-1">
                <Text className="text-text text-base font-bold font-kanit">Email Support</Text>
                <Text className="text-text-secondary text-xs font-kanit mt-0.5">{CONTACT_EMAIL}</Text>
              </View>
              <ChevronRight {...({ size: 20, stroke: colors.muted } as any)} />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(400)}>
            <TouchableOpacity 
              onPress={handlePhone}
              activeOpacity={0.8}
              className="flex-row items-center p-5 rounded-3xl bg-card border border-stone-200/5 dark:border-stone-900/5"
            >
              <View className="w-12 h-12 rounded-2xl bg-[#F59E0B]/10 items-center justify-center mr-4">
                <Phone {...({ size: 22, stroke: '#F59E0B' } as any)} />
              </View>
              <View className="flex-1">
                <Text className="text-text text-base font-bold font-kanit">Call Us</Text>
                <Text className="text-text-secondary text-xs font-kanit mt-0.5">Mon-Sat, 9AM-6PM</Text>
              </View>
              <ChevronRight {...({ size: 20, stroke: colors.muted } as any)} />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Legal */}
        <Text className="text-text-secondary text-[10px] font-bold font-kanit uppercase tracking-[2px] mb-4 ml-2">
          Legal
        </Text>
        
        <View className="bg-card rounded-3xl border border-stone-200/5 dark:border-stone-900/5 mb-8">
          <TouchableOpacity 
            className="flex-row items-center p-5 border-b border-stone-200/5 dark:border-stone-900/5"
            activeOpacity={0.8}
            onPress={() => Linking.openURL('https://fitzo.fit/terms')}
          >
            <FileText {...({ size: 18, stroke: colors.muted } as any)} />
            <Text className="text-text font-bold font-kanit flex-1 ml-3">Terms & Conditions</Text>
            <ChevronRight {...({ size: 18, stroke: colors.muted } as any)} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-row items-center p-5"
            activeOpacity={0.8}
            onPress={() => Linking.openURL('https://fitzo.fit/privacy')}
          >
            <FileText {...({ size: 18, stroke: colors.muted } as any)} />
            <Text className="text-text font-bold font-kanit flex-1 ml-3">Privacy Policy</Text>
            <ChevronRight {...({ size: 18, stroke: colors.muted } as any)} />
          </TouchableOpacity>
        </View>

        <View className="items-center pb-12">
          <Text className="text-text-secondary/50 text-xs font-kanit">
            App Version 1.0.0
          </Text>
          <Text className="text-text-secondary/30 text-[10px] font-kanit mt-1">
            Fitzo Technologies Pvt. Ltd.
          </Text>
        </View>
        
      </ScrollView>
    </ScreenWrapper>
  );
}
