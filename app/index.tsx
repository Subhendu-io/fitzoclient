import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store/useAuthStore';
import { View, ActivityIndicator } from 'react-native';
import { useThemeColors } from '../src/hooks/useThemeColors';

export default function Index() {
  const { user, profile, loading } = useAuthStore();
  const colors = useThemeColors();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)" />;
  }

  if (!profile && user) {
      return <Redirect href="/(onboarding)/step1" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
