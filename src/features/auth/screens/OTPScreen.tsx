import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import { verifyPhoneOTP, signInWithPhone, completePhoneSignup } from '../services/authService';

export function OTPScreen() {
  const router = useRouter();
  const { verificationId: initialVerificationId, phone, firstName, lastName, isNewUser } = useLocalSearchParams<{
    verificationId: string;
    phone: string;
    firstName?: string;
    lastName?: string;
    isNewUser?: string;
  }>();
  
  const [verificationId, setVerificationId] = useState(initialVerificationId);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [error, setError] = useState('');
  
  const otpInputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) return;

    setIsSubmitting(true);
    setError('');
    try {
      const userCredential = await verifyPhoneOTP(verificationId, otpCode);

      if (isNewUser === 'true' && firstName && lastName) {
        // Registration via phone — name was collected on RegisterScreen
        await completePhoneSignup(userCredential.user.uid, firstName, lastName, phone);
        router.replace('/(tabs)/home');
      } else if (isNewUser === 'true') {
        // Registration via phone — name still needed
        router.replace({
          pathname: '/phone-name',
          params: { phone },
        });
      } else {
        // Existing user login
        router.replace('/(tabs)/home');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
      setOtp(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      const newId = await signInWithPhone(phone);
      setVerificationId(newId);
      setResendCooldown(60);
      setError('');
    } catch (err: any) {
      setError('Failed to resend OTP');
    }
  };

  return (
    <ScreenWrapper className="bg-background">
      <Header title="Verification" showBackButton />
      <ScrollView className="flex-1 px-8 py-6">
        <View className="mb-10">
          <Text className="text-3xl font-extrabold text-text font-kanit mb-2">Verify <Text className="text-primary">OTP</Text></Text>
          <Text className="text-base text-text-secondary font-kanit">
            Enter the 6-digit code sent to {phone}
          </Text>
        </View>

        <View className="flex-row justify-between mb-8">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                otpInputRefs.current[index] = ref;
              }}
              className={`w-[45px] h-[55px] bg-card border ${otp[index] ? 'border-primary' : 'border-stone-200/10 dark:border-stone-900/10'} rounded-xl text-text text-center text-xl font-bold`}
              value={digit}
              onChangeText={(val) => handleOtpChange(index, val)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
              keyboardType="number-pad"
              maxLength={1}
              autoFocus={index === 0}
            />
          ))}
        </View>

        {error ? (
          <Text className="text-red-500 text-sm font-kanit mb-6 text-center">{error}</Text>
        ) : null}

        <Button 
          title="Verify OTP" 
          onPress={handleVerify}
          loading={isSubmitting}
          disabled={otp.join('').length !== 6}
        />

        <View className="flex-row justify-center mt-10">
          <Text className="text-text-secondary font-kanit">Didn't receive code? </Text>
          <TouchableOpacity onPress={handleResend} disabled={resendCooldown > 0}>
            <Text className={`font-bold font-kanit ${resendCooldown > 0 ? 'text-text-secondary font-normal' : 'text-primary'}`}>
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Now'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
