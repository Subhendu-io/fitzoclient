import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { queryClient } from "../src/lib/queryClient";
import { onAuthStateChanged } from "@react-native-firebase/auth";
import { getAuth } from "../src/lib/firebase";
import { useAuthStore } from "../src/store/useAuthStore";
import { getAppUser } from "../src/services/userService";
import { Kanit_400Regular, Kanit_700Bold, Kanit_800ExtraBold } from "@expo-google-fonts/kanit";
import { registerForPushNotificationsAsync } from "../src/features/notifications";
import { ThemeManager } from "../src/components/ThemeManager";
import { ModalProvider } from "../src/providers/useModal";
import { ToasterProvider } from "../src/providers/useToaster";
import Modal from "../src/components/shared/Modal";
import Toaster from "../src/components/shared/Toaster";
import "../global.css";

import * as Linking from "expo-linking";
import { parseDeepLink } from "../src/services/deepLinkService";
import { useDeepLinkStore } from "../src/store/useDeepLinkStore";
import { useRouter } from "expo-router";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { setUser, setProfile, setLoading } = useAuthStore();
  const { pendingTenantId, pendingBranchId, clearPending } = useDeepLinkStore();
  const router = useRouter();
  const [appIsReady, setAppIsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Kanit_400Regular,
    Kanit_700Bold,
    Kanit_800ExtraBold,
  });

  const handleDeepLink = (url: string | null) => {
    if (!url) return;
    const params = parseDeepLink(url);
    if (params) {
      router.push({
        pathname: "/(tabs)/scanner",
        params: params as any
      });
    }
  };

  useEffect(() => {
    // Initial URL
    Linking.getInitialURL().then(handleDeepLink);

    // Listener
    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const profile = await getAppUser(user.uid);
          setProfile(profile);
          
          // Check for pending deep link scan
          if (pendingTenantId) {
            router.push({
              pathname: "/(tabs)/scanner",
              params: { tenantId: pendingTenantId, branchId: pendingBranchId }
            });
            clearPending();
          }

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
  }, [pendingTenantId]);

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
        <ToasterProvider>
          <ModalProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: "transparent" },
                animation: "fade",
              }}
            >
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(main)" options={{ headerShown: false }} />
            </Stack>
            <Modal />
            <Toaster />
          </ModalProvider>
        </ToasterProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
