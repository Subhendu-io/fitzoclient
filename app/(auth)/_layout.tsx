import { Stack } from 'expo-router';
import { useTheme } from '../../src/hooks/useTheme';

export default function AuthLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="phone-login" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="email-otp" options={{ gestureEnabled: false }} />
      <Stack.Screen name="user-details" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
