import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Button } from '../../src/components/ui/Button';
import { SPACING } from '../../src/constants/spacing';
import { useTheme } from '../../src/hooks/useTheme';

export default function OnboardingStep1() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <ScreenWrapper style={styles.container}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Tell us about yourself</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          We need some basic info to personalize your fitness plan.
        </Text>
        
        {/* Placeholder for personal info form */}
        <View style={[styles.placeholder, { backgroundColor: colors.surface }]}>
          <Text style={{ color: colors.textSecondary }}>Personal Info Form</Text>
        </View>

        <Button 
          title="Next" 
          onPress={() => router.push('/(onboarding)/step2')} 
          style={styles.button}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: 16,
    marginBottom: SPACING['2xl'],
  },
  placeholder: {
    height: 300,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING['2xl'],
  },
  button: {
    width: '100%',
  },
});
