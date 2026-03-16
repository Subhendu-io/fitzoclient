import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Header } from '@/components/layout/Header';
import { signInWithPhone } from '../services/authService';

export function PhoneLoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    try {
      const verificationId = await signInWithPhone(phone);
      router.push({
        pathname: '/otp',
        params: { verificationId, phone }
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to send OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenWrapper className="bg-background">
      <Header title="Phone Login" showBackButton />
      <ScrollView className="flex-1 px-8 py-6">
        <View className="mb-10">
          <Text className="text-3xl font-extrabold text-white font-kanit mb-2">
            Login with <Text className="text-primary">Phone</Text>
          </Text>
          <Text className="text-base text-text-secondary font-kanit">
            We'll send a 6-digit verification code
          </Text>
        </View>

        <View className="w-full space-y-6">
          <Input 
            label="Phone Number" 
            placeholder="+91 98765 43210" 
            keyboardType="phone-pad"
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              if (error) setError('');
            }}
          />
          
          {error ? (
            <Text className="text-red-500 text-sm font-kanit">{error}</Text>
          ) : null}
          
          <Button 
            title="Send OTP" 
            onPress={handleSendOTP}
            loading={isSubmitting}
            className="mt-4"
          />

          <View className="flex-row justify-center mt-10">
            <Text className="text-text-secondary font-kanit">Prefer email? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-primary font-bold font-kanit">Log In with Email</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
