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

  // If they signed up with email but haven't verified yet, trap them in the verification screen
  const isEmailUser = user.providerData?.some((p: any) => p.providerId === 'password');
  if (isEmailUser && !user.emailVerified) {
    return <Redirect href={{ pathname: "/(auth)/email-otp", params: { email: user.email } }} />;
  }

  // If they have no profile or haven't finished setting up their mandatory details
  if (!profile || !profile.firstName || !profile.lastName) {
    return <Redirect href="/(auth)/user-details" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
