import { useEffect } from 'react';
import { Appearance, Platform, NativeModules } from 'react-native';
import { useSettingsStore } from '../store/settingsStore';

/**
 * ThemeManager synchronizes the app's theme with the user's preference.
 * Uses React Native's Appearance API to trigger NativeWind's
 * @media (prefers-color-scheme) CSS variables.
 */
export function ThemeManager() {
  const { theme } = useSettingsStore();

  useEffect(() => {
    if (theme === 'light' || theme === 'dark') {
      Appearance.setColorScheme(theme);
    } else {
      // 'system' — clear the forced override so the device setting takes over
      // On Android, Appearance.setColorScheme(null) crashes (non-null param),
      // so we use the native module directly with a try-catch fallback
      try {
        if (Platform.OS === 'android') {
          // Access the native module directly to pass empty string which resets
          const appearanceModule = NativeModules.AppearanceModule || NativeModules.Appearance;
          if (appearanceModule?.setColorScheme) {
            appearanceModule.setColorScheme('');
          }
        } else {
          // iOS supports null to reset to system
          Appearance.setColorScheme(null as any);
        }
      } catch {
        // Fallback: just don't override, let system handle it
        console.log('ThemeManager: Could not reset to system theme');
      }
    }
  }, [theme]);

  // Also listen for system theme changes when in 'system' mode
  useEffect(() => {
    if (theme !== 'system') return;

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      // No-op: just having this listener ensures the component re-renders
      // when device theme changes, which re-triggers NativeWind's media query
    });

    return () => subscription.remove();
  }, [theme]);

  return null;
}
