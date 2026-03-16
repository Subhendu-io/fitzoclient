import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Button } from '../../src/components/ui/Button';
import { SPACING, FONT_SIZE } from '../../src/constants/spacing';
import { useTheme } from '../../src/hooks/useTheme';
import { Header } from '../../src/components/layout/Header';

export default function WorkoutModal() {
  const { colors } = useTheme();

  return (
    <ScreenWrapper>
      <Header title="Today's Workout" showBackButton />
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Power HIIT</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Estimated calories: 350 kcal | Duration: 25 min
        </Text>
        
        <View style={[styles.listContainer, { backgroundColor: colors.surface }]}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>Exercises:</Text>
          <Text style={{ color: colors.textSecondary }}>1. Burpees x 15</Text>
          <Text style={{ color: colors.textSecondary }}>2. Mountain Climbers x 30</Text>
          <Text style={{ color: colors.textSecondary }}>3. Planks 60s</Text>
        </View>

        <Button 
          title="Start Training" 
          onPress={() => {}} 
          style={styles.button}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: SPACING.xs,
    marginTop: SPACING.xl,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: SPACING['3xl'],
  },
  listContainer: {
    padding: SPACING.lg,
    borderRadius: 20,
    gap: SPACING.sm,
    marginBottom: SPACING['3xl'],
  },
  button: {
    marginTop: 'auto',
    marginBottom: SPACING.xl,
  },
});
