import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Header } from '@/components/layout/Header';
import { useAuthStore } from '@/store/useAuthStore';
import { useToaster } from '@/providers/useToaster';
import { signUpWithEmail, signInWithPhone, sendEmailVerificationToUser } from '../services/authService';
import { CountryCodeSelector, countries } from '../components/CountryCodeSelector';

type SignUpMode = 'email' | 'phone';

export function RegisterScreen() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const { showToast } = useToaster();
  const colors = useThemeColors();

  const [mode, setMode] = useState<SignUpMode>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = () => {
    if (!email.trim()) {
      setError('Please enter your email');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const validatePhone = () => {
    if (!phone || phone.length < 8) {
      setError('Please enter a valid phone number');
      return false;
    }
    return true;
  };

  const handleEmailSignUp = async () => {
    if (!validateEmail()) return;

    setIsSubmitting(true);
    setError('');
    try {
      const userCredential = await signUpWithEmail({
        email: email.trim(),
        password,
      });
      setUser(userCredential.user);
      // Send verification email then go to verification screen
      await sendEmailVerificationToUser(userCredential.user);
      router.push({
        pathname: '/(auth)/email-otp',
        params: { email: email.trim() },
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneSignUp = async () => {
    if (!validatePhone()) return;

    setIsSubmitting(true);
    setError('');
    try {
      const fullPhone = `${selectedCountry.code}${phone}`;
      const verificationId = await signInWithPhone(fullPhone);
      router.push({
        pathname: '/otp',
        params: {
          verificationId,
          phone: fullPhone,
          isNewUser: 'true',
        },
      });
    } catch (err: any) {
      console.error('Phone signup error:', err);
      setError(err.message || 'Failed to send OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = () => {
    if (mode === 'email') {
      handleEmailSignUp();
    } else {
      handlePhoneSignUp();
    }
  };

  return (
    <ScreenWrapper className="bg-background">
      <Header title="Create Account" showBackButton />
      <ScrollView className="flex-1 px-8 py-6" keyboardShouldPersistTaps="handled">
        <View className="mb-10">
          <Text className="text-3xl font-extrabold text-text font-kanit mb-2">Join ScoreFit</Text>
          <Text className="text-base text-text-secondary font-kanit">
            Start your transformation today
          </Text>
        </View>

        {/* Mode Toggle */}
        <View className="flex-row bg-card rounded-2xl p-1 mb-8">
          <TouchableOpacity
            onPress={() => { setMode('email'); setError(''); }}
            className={`flex-1 py-3 rounded-xl items-center ${mode === 'email' ? 'bg-primary' : ''}`}
            activeOpacity={0.7}
          >
            <Text className={`font-kanit font-bold text-sm ${mode === 'email' ? 'text-white dark:text-black' : 'text-text-secondary'}`}>
              Email
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { setMode('phone'); setError(''); }}
            className={`flex-1 py-3 rounded-xl items-center ${mode === 'phone' ? 'bg-primary' : ''}`}
            activeOpacity={0.7}
          >
            <Text className={`font-kanit font-bold text-sm ${mode === 'phone' ? 'text-white dark:text-black' : 'text-text-secondary'}`}>
              Phone
            </Text>
          </TouchableOpacity>
        </View>

        <View className="w-full space-y-4">
          {mode === 'email' ? (
            <>
              <Input 
                label="Email" 
                placeholder="john@example.com" 
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(text) => { setEmail(text); if (error) setError(''); }}
              />
              <Input 
                label="Password" 
                placeholder="Min 6 characters" 
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(text) => { setPassword(text); if (error) setError(''); }}
                rightComponent={
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    {showPassword 
                      ? <EyeOff {...({ size: 20, stroke: colors.muted } as any)} />
                      : <Eye {...({ size: 20, stroke: colors.muted } as any)} />
                    }
                  </TouchableOpacity>
                }
              />
              <Input 
                label="Confirm Password" 
                placeholder="Re-enter password" 
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={(text) => { setConfirmPassword(text); if (error) setError(''); }}
                rightComponent={
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    {showConfirmPassword 
                      ? <EyeOff {...({ size: 20, stroke: colors.muted } as any)} />
                      : <Eye {...({ size: 20, stroke: colors.muted } as any)} />
                    }
                  </TouchableOpacity>
                }
              />
            </>
          ) : (
            <Input 
              label="Phone Number"
              placeholder="9876 543 210" 
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(text) => {
                setPhone(text.replace(/[^\d]/g, ''));
                if (error) setError('');
              }}
              leftComponent={
                <CountryCodeSelector 
                  selectedCountry={selectedCountry}
                  onSelect={setSelectedCountry}
                  isEmbedded
                />
              }
            />
          )}

          {error ? (
            <Text className="text-red-500 text-sm font-kanit text-center">{error}</Text>
          ) : null}
          
          <Button 
            title="Create Account" 
            onPress={handleSignUp} 
            loading={isSubmitting}
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
