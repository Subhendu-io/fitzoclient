import { useColorScheme } from 'react-native';
import { COLORS } from '../constants/colors';

export type ThemeMode = 'light' | 'dark';

export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme = {
    isDark,
    colors: {
      background: isDark ? COLORS.dark[900] : COLORS.white,
      surface: isDark ? COLORS.dark[800] : COLORS.dark[50],
      text: isDark ? COLORS.dark[50] : COLORS.dark[900],
      textSecondary: isDark ? COLORS.dark[400] : COLORS.dark[600],
      border: isDark ? COLORS.dark[700] : COLORS.dark[200],
      primary: COLORS.primary[500],
      accent: COLORS.accent[500],
      error: COLORS.error,
      success: COLORS.success,
      warning: COLORS.warning,
    },
  };

  return theme;
}
