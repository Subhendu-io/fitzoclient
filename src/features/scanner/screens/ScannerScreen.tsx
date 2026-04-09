import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { X, Zap, ZapOff } from "lucide-react-native";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useToaster } from "@/providers/useToaster";
import { executeScanFlow } from "../services/scanFlowService";
import { getAppUser } from "@/services/userService";

export function ScannerScreen() {
  const { showToast } = useToaster();
  const colors = useThemeColors();
  const router = useRouter();
  const params = useLocalSearchParams();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flash, setFlash] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const navigation = useNavigation();

  const { user, setProfile } = useAuthStore();

  useEffect(() => {
    if (!permission) requestPermission();
  }, []);

  // Reset scanner state when screen focused
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setScanned(false);
      setIsProcessing(false);
    });
    return unsubscribe;
  }, [navigation]);

  const handleScan = React.useCallback(
    async (data: string) => {
      if (scanned || isProcessing) return;

      setScanned(true);
      setIsProcessing(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      try {
        const result = await executeScanFlow(data, user);

        if (
          user &&
          result.type !== "INVALID_LINK" &&
          result.type !== "AUTH_REQUIRED"
        ) {
          getAppUser(user.uid)
            .then((p) => setProfile(p))
            .catch(() => undefined);
        }

        if (result.type === "INVALID_LINK") {
          showToast({
            title: "Invalid QR",
            message: "The scanned QR code is invalid.",
            variant: "danger",
          });
          setScanned(false);
        } else if (result.type === "AUTH_REQUIRED") {
          showToast({
            title: "Login Required",
            message: "Please login to proceed with the scan.",
            variant: "info",
          });
          router.push("/(auth)/login");
        } else {
          // Navigate to PostScanScreen with the result
          router.push({
            pathname: "/(tabs)/(scanner)/scan-result",
            params: { result: JSON.stringify(result) },
          });
        }
      } catch (error: any) {
        showToast({
          title: "Error",
          message: error.message || "Failed to process scan",
          variant: "danger",
        });
        setScanned(false);
      } finally {
        setIsProcessing(false);
      }
    },
    [scanned, isProcessing, user, router, showToast, setProfile],
  );

  // Handle incoming params from deep link
  useEffect(() => {
    if (params.tenantId && !scanned && !isProcessing) {
      const data = `tenantId=${params.tenantId}&branchId=${params.branchId || "main"}`;
      handleScan(data);
    }
  }, [params.tenantId, handleScan, scanned, isProcessing]);

  if (!permission) {
    return <View className="flex-1 bg-background" />;
  }

  if (!permission.granted) {
    return (
      <ScreenWrapper className="items-center justify-center px-8">
        <Text className="text-text text-center mb-6 font-kanit">
          We need your permission to show the camera
        </Text>
        <TouchableOpacity
          className="bg-primary px-8 py-3 rounded-xl"
          onPress={requestPermission}
        >
          <Text className="text-black font-bold font-kanit">
            Grant Permission
          </Text>
        </TouchableOpacity>
      </ScreenWrapper>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        enableTorch={flash}
        onBarcodeScanned={({ data }) => handleScan(data)}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      >
        <View className="flex-1 bg-black/40">
          <View className="flex-row items-center justify-between px-6 pt-14">
            <TouchableOpacity
              className="bg-black/50 p-2 rounded-full"
              onPress={() => router.back()}
            >
              <X color={colors.text} size={24} />
            </TouchableOpacity>
            <Text className="text-text font-bold text-lg font-kanit">
              Scan QR Code
            </Text>
            <TouchableOpacity
              className="bg-black/50 p-2 rounded-full"
              onPress={() => setFlash(!flash)}
            >
              {flash ? (
                <Zap color={colors.primary} size={24} />
              ) : (
                <ZapOff color={colors.text} size={24} />
              )}
            </TouchableOpacity>
          </View>

          <View className="flex-1 items-center justify-center">
            <View className="w-72 h-72 items-center justify-center">
              <View className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
              <View className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
              <View className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
              <View className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-2xl" />
              <View className="w-64 h-64 border border-stone-200/20 rounded-3xl" />
              {isProcessing && (
                <View className="absolute inset-0 items-center justify-center bg-black/40 rounded-3xl">
                  <ActivityIndicator color={colors.primary} size="large" />
                </View>
              )}
            </View>
            <Text className="text-text/60 mt-12 font-kanit font-medium">
              Align QR Code within the frame
            </Text>
          </View>
        </View>
      </CameraView>
    </View>
  );
}
