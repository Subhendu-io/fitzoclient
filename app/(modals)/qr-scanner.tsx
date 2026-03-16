import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Button } from '../../src/components/ui/Button';
import { SPACING } from '../../src/constants/spacing';
import { useTheme } from '../../src/hooks/useTheme';
import { Header } from '../../src/components/layout/Header';
import { Scan } from 'lucide-react-native';

export default function QRScannerModal() {
  const { colors } = useTheme();

  return (
    <ScreenWrapper>
      <Header title="QR Scanner" showBackButton />
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={[styles.scannerFrame, { borderColor: colors.primary }]}>
            <Scan size={100} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Scan QR Code</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Align the code with the frame to scan
          </Text>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderRadius: 30,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING['2xl'],
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
});
