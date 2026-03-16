import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, LayoutAnimation, Platform, UIManager } from 'react-native';
import { HelpCircle, Phone, Mail, MapPin, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Header } from '@/components/layout/Header';
import { useAuthStore } from '@/store/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import { getTenantInfo } from '@/services/memberService';
import Animated, { FadeInUp } from 'react-native-reanimated';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const faqs = [
  {
    q: 'How do I mark attendance?',
    a: 'Simply tap the QR icon on the dashboard and scan your gym\'s unique check-in code.'
  },
  {
    q: 'How to view my fitness score?',
    a: 'Navigate to the "Fitness Score" card on home. Upload a physique photo to get an AI-powered breakdown.'
  },
  {
    q: 'Can I manage multiple gym memberships?',
    a: 'Yes, if your phone is linked to multiple gyms, you can switch between them in the settings.'
  },
  {
    q: 'How to update my profile?',
    a: 'Tap your profile icon in the header to access account settings and personal information.'
  }
];

export function HelpScreen() {
  const { activeGym } = useAuthStore();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const { data: tenant } = useQuery({
    queryKey: ['tenantInfo', activeGym],
    queryFn: () => getTenantInfo(activeGym!),
    enabled: !!activeGym,
  });

  const toggleFaq = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <ScreenWrapper className="bg-background">
      <Header title="Support" showBackButton />
      
      <ScrollView className="flex-1 px-6 pb-20" showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <Animated.View entering={FadeInUp} className="py-8 items-center">
            <View className="w-20 h-20 rounded-[32px] bg-primary/10 items-center justify-center mb-6">
               <HelpCircle {...({ size: 32, stroke: "#C8FF32" } as any)} />
            </View>
            <Text className="text-white text-2xl font-black font-kanit text-center">How can we help?</Text>
            <Text className="text-text-secondary font-kanit text-center mt-2 px-8">
               Our support team and gym staff are here to assist you 24/7.
            </Text>
        </Animated.View>

        {/* Contact Cards */}
        <View className="flex-row space-x-4 mb-10">
           <TouchableOpacity 
             onPress={() => tenant?.phone && Linking.openURL(`tel:${tenant.phone}`)}
             className="flex-1 bg-card border border-white/5 rounded-[32px] p-6 items-center"
           >
              <View className="w-12 h-12 rounded-2xl bg-primary/10 items-center justify-center mb-4">
                 <Phone {...({ size: 20, stroke: "#C8FF32" } as any)} />
              </View>
              <Text className="text-white font-bold font-kanit">Call Us</Text>
           </TouchableOpacity>

           <TouchableOpacity 
             onPress={() => tenant?.email && Linking.openURL(`mailto:${tenant.email}`)}
             className="flex-1 bg-card border border-white/5 rounded-[32px] p-6 items-center"
           >
              <View className="w-12 h-12 rounded-2xl bg-primary/10 items-center justify-center mb-4">
                 <Mail {...({ size: 20, stroke: "#C8FF32" } as any)} />
              </View>
              <Text className="text-white font-bold font-kanit">Email</Text>
           </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <Text className="text-white text-lg font-black font-kanit mb-6 uppercase tracking-widest">General FAQ</Text>
        <View className="space-y-4 mb-12">
           {faqs.map((faq, i) => (
             <TouchableOpacity 
               key={i}
               onPress={() => toggleFaq(i)}
               activeOpacity={0.8}
               className="bg-card border border-white/5 rounded-3xl p-6"
             >
                <View className="flex-row justify-between items-center">
                   <Text className="flex-1 text-white font-bold font-kanit mr-4">{faq.q}</Text>
                   {expandedFaq === i ? (
                     <ChevronUp {...({ size: 20, stroke: "#C8FF32" } as any)} />
                   ) : (
                     <ChevronDown {...({ size: 20, stroke: "#9CA3AF" } as any)} />
                   )}
                </View>
                {expandedFaq === i && (
                  <View className="mt-4 pt-4 border-t border-white/5">
                    <Text className="text-text-secondary font-kanit leading-5">{faq.a}</Text>
                  </View>
                )}
             </TouchableOpacity>
           ))}
        </View>

        {/* Gym Info */}
        {tenant && (
          <View className="bg-primary/5 rounded-[40px] p-8 border border-white/5 mb-10">
             <View className="flex-row items-center mb-6">
                <MapPin {...({ size: 18, stroke: "#C8FF32" } as any)} />
                <Text className="text-white text-lg font-bold font-kanit ml-3">{tenant.name}</Text>
             </View>
             <Text className="text-text-secondary font-kanit leading-6 mb-6">
                {tenant.address || 'Visit us at our main branch for personalized support.'}
             </Text>
             <TouchableOpacity className="flex-row items-center justify-center py-4 bg-primary rounded-2xl">
                <MessageSquare {...({ size: 18, stroke: "black" } as any)} />
                <Text className="text-black font-black font-kanit ml-3">MESSAGE GYM</Text>
             </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
