import React from 'react';
import { View, Image, Text, StyleSheet, type ViewStyle } from 'react-native';
import { COLORS } from '../../constants/colors';
import { RADIUS, FONT_SIZE } from '../../constants/spacing';

interface AvatarProps {
  source?: string;
  name?: string;
  size?: number;
  style?: ViewStyle;
}

export function Avatar({ source, name, size = 40, style }: AvatarProps) {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '';

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    >
      {source ? (
        <Image
          source={{ uri: source }}
          style={[styles.image, { borderRadius: size / 2 }]}
        />
      ) : (
        <View style={[styles.placeholder, { borderRadius: size / 2 }]}>
          <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
            {initials}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.dark[200],
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary[100],
  },
  initials: {
    fontWeight: '700',
    color: COLORS.primary[700],
  },
});
