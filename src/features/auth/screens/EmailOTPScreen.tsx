import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import {
  sendEmailVerificationToUser,
  reloadAndCheckEmailVerified,
  completeEmailSignup,
} from '../services/authService';
import { getAuth } from '@/lib/firebase';
import Animated, { FadeInUp } from 'react-native-reanimated';

export function EmailOTPScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [error, setError] = useState('');

  // Cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleVerified = async () => {
    setIsVerifying(true);
    setError('');
    try {
      const verified = await reloadAndCheckEmailVerified();
      if (verified) {
        const user = getAuth().currentUser;
        if (user && user.email) {
          await completeEmailSignup(user.uid, user.email);
        }
        router.replace('/(auth)/user-details');
      } else {
        setError("Email not verified yet. Please open the link in your inbox and try again.");
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setIsResending(true);
    setError('');
    try {
      const user = getAuth().currentUser;
      if (!user) throw new Error('No session found');
      await sendEmailVerificationToUser(user);
      setResendCooldown(60);
    } catch (err: any) {
      setError('Failed to resend. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <ScreenWrapper className="bg-background">
      <Header title="Verify Email" />
      <ScrollView
        className="flex-1 px-8 py-6"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Icon */}
        <Animated.View entering={FadeInUp.delay(100)} className="items-center mb-10 mt-4">
          <View className="w-24 h-24 rounded-full bg-primary/15 items-center justify-center mb-6">
            <Text style={{ fontSize: 44 }}>📧</Text>
          </View>
          <Text className="text-3xl font-extrabold text-text font-kanit mb-3 text-center">
            Check Your <Text className="text-primary">Inbox</Text>
          </Text>
          <Text className="text-base text-text-secondary font-kanit text-center leading-6">
            We sent a verification link to
          </Text>
          <Text className="text-base text-text font-bold font-kanit text-center mt-1">
            {email}
          </Text>
        </Animated.View>

        {/* Steps */}
        <Animated.View entering={FadeInUp.delay(200)} className="bg-card rounded-3xl p-5 pb-2 mb-8">
          {[
            { num: '1', text: 'Open the email from Fitzo' },
            { num: '2', text: 'Tap the verification link' },
            { num: '3', text: 'Come back and tap the button below' },
          ].map((step) => (
            <View key={step.num} className="flex-row items-center mb-4">
              <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-4">
                <Text className="text-black font-bold font-kanit text-sm">{step.num}</Text>
              </View>
              <Text className="text-text font-kanit flex-1">{step.text}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Error */}
        {error ? (
          <Animated.View entering={FadeInUp} className="bg-red-500/10 rounded-2xl px-4 py-3 mb-6">
            <Text className="text-red-400 font-kanit text-sm text-center">{error}</Text>
          </Animated.View>
        ) : null}

        {/* Primary CTA */}
        <Animated.View entering={FadeInUp.delay(300)}>
          <Button
            title="I Have Verified My Email"
            onPress={handleVerified}
            loading={isVerifying}
            className="mb-4"
          />
        </Animated.View>

        {/* Resend */}
        <Animated.View entering={FadeInUp.delay(350)} className="flex-row justify-center mt-4">
          <Text className="text-text-secondary font-kanit">Didn't receive it? </Text>
          <TouchableOpacity
            onPress={handleResend}
            disabled={resendCooldown > 0 || isResending}
          >
            <Text
              className={`font-bold font-kanit ${
                resendCooldown > 0 ? 'text-text-secondary' : 'text-primary'
              }`}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Email'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </ScreenWrapper>
  );
}
