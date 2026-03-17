import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { queryClient } from "../src/lib/queryClient";
import { auth } from "../src/lib/firebase";
import { useAuthStore } from "../src/store/useAuthStore";
import { getAppUser } from "../src/services/userService";
import { Kanit_400Regular, Kanit_700Bold, Kanit_800ExtraBold } from "@expo-google-fonts/kanit";
import { registerForPushNotificationsAsync } from "../src/features/notifications";
import { ThemeManager } from "../src/components/ThemeManager";
import "../global.css";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { setUser, setProfile, setLoading } = useAuthStore();
  const [appIsReady, setAppIsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Kanit_400Regular,
    Kanit_700Bold,
    Kanit_800ExtraBold,
  });

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        try {
          const profile = await getAppUser(user.uid);
          setProfile(profile);
          // Register for notifications
          registerForPushNotificationsAsync(user.uid).catch((err) =>
            console.error("Notification registration failed:", err),
          );
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
      setAppIsReady(true);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (fontsLoaded && appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, appIsReady]);

  if (!fontsLoaded || !appIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeManager />
      <QueryClientProvider client={queryClient}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "transparent" },
            animation: "fade",
          }}
        >
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(main)" options={{ headerShown: false }} />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
