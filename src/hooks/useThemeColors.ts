import { useColorScheme } from "react-native";

/**
 * Single source of truth for all color values in the app.
 * Use this hook anywhere you need resolved color strings
 * (e.g. icon stroke props, inline styles, ActivityIndicator).
 *
 * To change the palette, edit ONLY this file + global.css.
 */

export interface ThemeColors {
  primary: string;
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  muted: string;
  onPrimary: string;
  onBackground: string;
}

const LIGHT_PALETTE: ThemeColors = {
  primary: "#60d05e",
  background: "#F2F2F7",
  card: "#FFFFFF",
  text: "#1A1A1A",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
  error: "#EF4444",
  warning: "#F97316",
  success: "#4A7C59",
  muted: "#9CA3AF",
  onPrimary: "#000000",
  onBackground: "#000000",
};

const DARK_PALETTE: ThemeColors = {
  primary: "#C8FF32",
  background: "#0D0D0D",
  card: "#1A1A1A",
  text: "#FFFFFF",
  textSecondary: "#9E9E9E",
  border: "#262626",
  error: "#EF4444",
  warning: "#F97316",
  success: "#C8FF32",
  muted: "#616161",
  onPrimary: "#000000",
  onBackground: "#FFFFFF",
};

export function useThemeColors(): ThemeColors {
  const colorScheme = useColorScheme();
  return colorScheme === "dark" ? DARK_PALETTE : LIGHT_PALETTE;
}
