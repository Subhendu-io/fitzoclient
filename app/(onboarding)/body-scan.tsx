import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Button } from '../../src/components/ui/Button';
import { SPACING } from '../../src/constants/spacing';
import { useTheme } from '../../src/hooks/useTheme';
import { Header } from '../../src/components/layout/Header';
import { COLORS } from '../../src/constants/colors';

export default function BodyScanScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <ScreenWrapper>
      <Header title="AI Body Scan" showBackButton />
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Final Step: Body Scan</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Our AI analyzes your posture and body composition to create a custom workout plan.
        </Text>
        
        <View style={[styles.placeholder, { backgroundColor: colors.surface }]}>
          <Text style={{ color: colors.textSecondary, marginBottom: 10 }}>Camera Preview Placeholder</Text>
          <Text style={{ color: COLORS.primary[500], fontWeight: '600' }}>AI SCANNING...</Text>
        </View>

        <Button 
          title="Complete Setup" 
          onPress={() => router.replace('/(tabs)/home')} 
          className="w-full"
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
    height: 400,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING['2xl'],
    borderWidth: 2,
    borderColor: COLORS.primary[500],
    borderStyle: 'dashed',
  },
});
