import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Header } from '@/components/layout/Header';

export function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <ScreenWrapper className="bg-background">
      <Header title="Create Account" showBackButton />
      <ScrollView className="flex-1 px-8 py-6">
        <View className="mb-10">
          <Text className="text-3xl font-extrabold text-text font-kanit mb-2">Join Fitzo</Text>
          <Text className="text-base text-text-secondary font-kanit">
            Start your transformation today
          </Text>
        </View>

        <View className="w-full space-y-4">
          <Input 
            label="Full Name" 
            placeholder="John Doe" 
            value={fullName}
            onChangeText={setFullName}
          />
          <Input 
            label="Email" 
            placeholder="john@example.com" 
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <Input 
            label="Password" 
            placeholder="Create a password" 
            secureTextEntry 
            value={password}
            onChangeText={setPassword}
          />
          
          <Button 
            title="Create Account" 
            onPress={() => router.push('/(auth)/login')} 
            className="mt-6"
          />

          <View className="flex-row justify-center mt-10 mb-10">
            <Text className="text-text-secondary font-kanit">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-primary font-bold font-kanit">Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
