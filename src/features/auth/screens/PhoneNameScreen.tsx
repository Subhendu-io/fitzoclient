import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Header } from '@/components/layout/Header';
import { completePhoneSignup } from '../services/authService';
import { useAuthStore } from '@/store/useAuthStore';

export function PhoneNameScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { user } = useAuthStore();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleCompleteProfile = async () => {
    if (!firstName || !lastName) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      if (user) {
        await completePhoneSignup(user.uid, firstName, lastName, phone);
        router.replace('/(tabs)/home');
      } else {
        setError('No active session found');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenWrapper className="bg-background">
      <Header title="Complete Profile" />
      <ScrollView className="flex-1 px-8 py-6">
        <View className="mb-10">
          <Text className="text-3xl font-extrabold text-text font-kanit mb-2">Almost <Text className="text-primary">Done</Text></Text>
          <Text className="text-base text-text-secondary font-kanit">
            Tell us a bit about yourself
          </Text>
        </View>

        <View className="w-full space-y-4">
          <Input 
            label="First Name" 
            placeholder="John" 
            value={firstName}
            onChangeText={setFirstName}
          />
          <Input 
            label="Last Name" 
            placeholder="Doe" 
            value={lastName}
            onChangeText={setLastName}
          />
          
          {error ? (
            <Text className="text-red-500 text-sm font-kanit mt-2">{error}</Text>
          ) : null}
          
          <Button 
            title="Start Journey" 
            onPress={handleCompleteProfile}
            loading={isSubmitting}
            className="mt-6"
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
