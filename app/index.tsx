import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store/useAuthStore';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { user, profile, loading } = useAuthStore();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0D0D0D', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#C8FF32" size="large" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)" />;
  }

  if (!profile && user) {
      // If user but no profile, they might need onboarding or just wait for profile to load
      // But standard parity: if user exists, go home or onboarding
      return <Redirect href="/(onboarding)/step1" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
