import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Button } from '../../src/components/ui/Button';
import { SPACING } from '../../src/constants/spacing';
import { useTheme } from '../../src/hooks/useTheme';
import { Header } from '../../src/components/layout/Header';

export default function OnboardingStep2() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <ScreenWrapper>
      <Header title="Your Goals" showBackButton />
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>What's your main goal?</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          This helps us track the right metrics for you.
        </Text>
        
        {/* Placeholder for goals selection */}
        <View style={[styles.placeholder, { backgroundColor: colors.surface }]}>
          <Text style={{ color: colors.textSecondary }}>Goal Selection Grid</Text>
        </View>

        <Button 
          title="Next" 
          onPress={() => router.push('/(onboarding)/body-scan')} 
          style={styles.button}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.xl,
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
