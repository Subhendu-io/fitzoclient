import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Modal } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { X, Zap, ZapOff, CheckCircle2, AlertCircle } from "lucide-react-native";
import Animated, { FadeIn, Layout } from "react-native-reanimated";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { BlurView } from "expo-blur";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useToaster } from "@/providers/useToaster";
import { useModal } from "@/providers/useModal";
import { executeScanFlow, ScanFlowResult } from "../services/scanFlowService";
import { getAppUser } from "@/services/userService";

export function ScannerScreen() {
  const { showToast } = useToaster();
  const { showModal: showGlobalModal } = useModal();
  const colors = useThemeColors();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flash, setFlash] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [flowResult, setFlowResult] = useState<ScanFlowResult | null>(null);

  const navigation = useNavigation();
  
  const { user, setProfile } = useAuthStore();

  useEffect(() => {
    if (!permission) requestPermission();
  }, []);

  // Reset scanner state when screen focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setScanned(false);
      setIsProcessing(false);
    });
    return unsubscribe;
  }, [navigation]);

  const handleScan = React.useCallback(async (data: string) => {
    if (scanned || isProcessing) return;

    setScanned(true);
    setIsProcessing(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const result = await executeScanFlow(data, user);
      setFlowResult(result);

      if (user && result.type !== "INVALID_LINK" && result.type !== "AUTH_REQUIRED") {
        getAppUser(user.uid)
          .then((p) => setProfile(p))
          .catch(() => undefined);
      }

      if (result.type === 'INVALID_LINK') {
        showToast({
          title: "Invalid QR",
          message: "The scanned QR code is invalid.",
          variant: "danger",
        });
        setScanned(false);
      } else if (result.type === 'AUTH_REQUIRED') {
        // Handled by scanFlowService saving to store, we just need to redirect
        showToast({
          title: "Login Required",
          message: "Please login to proceed with the scan.",
          variant: "info",
        });
        router.push("/(auth)/login");
      } else {
        setShowResultModal(true);
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
  }, [scanned, isProcessing, user, router, showToast, setProfile]);

  const handleModalClose = () => {
    setShowResultModal(false);
    router.back();
  };

  // Handle incoming params from deep link
  useEffect(() => {
    if (params.tenantId && !scanned && !isProcessing) {
      const data = `tenantId=${params.tenantId}&branchId=${params.branchId || 'main'}`;
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
        <TouchableOpacity className="bg-primary px-8 py-3 rounded-xl" onPress={requestPermission}>
          <Text className="text-black font-bold font-kanit">Grant Permission</Text>
        </TouchableOpacity>
      </ScreenWrapper>
    );
  }

  const renderModalContent = () => {
    if (!flowResult) return null;

    switch (flowResult.type) {
      case 'ATTENDANCE_MARKED':
        return (
          <View className="items-center">
            <View className="bg-green-500/20 p-4 rounded-full mb-4">
              <CheckCircle2 color="#22c55e" size={40} />
            </View>
            <Text className="text-text text-2xl font-bold font-kanit mb-1">Checked In!</Text>
            <Text className="text-text-secondary font-kanit text-center mb-8">
              Welcome to {flowResult.gymName}. Your attendance has been recorded.
            </Text>
            <TouchableOpacity
              className="w-full bg-primary py-4 rounded-2xl items-center"
              onPress={handleModalClose}
            >
              <Text className="text-black font-bold font-kanit">Done</Text>
            </TouchableOpacity>
          </View>
        );

      case "LEAD_PENDING":
        return (
          <View className="items-center">
            <View className="bg-blue-500/20 p-4 rounded-full mb-4">
              <AlertCircle color="#3b82f6" size={40} />
            </View>
            <Text className="text-text text-2xl font-bold font-kanit mb-1">Join request sent</Text>
            <Text className="text-text-secondary font-kanit text-center mb-8">
              {flowResult.gymName} will review your details. You will be notified when your membership is ready.
            </Text>
            <TouchableOpacity
              className="w-full bg-primary py-4 rounded-2xl items-center"
              onPress={handleModalClose}
            >
              <Text className="text-black font-bold font-kanit">Okay</Text>
            </TouchableOpacity>
          </View>
        );

      case "PHONE_REQUIRED":
        return (
          <View className="items-center">
            <View className="bg-amber-500/20 p-4 rounded-full mb-4">
              <AlertCircle color="#f59e0b" size={40} />
            </View>
            <Text className="text-text text-2xl font-bold font-kanit mb-1">Phone number needed</Text>
            <Text className="text-text-secondary font-kanit text-center mb-8">
              Add a verified phone number in your profile so we can match you to {flowResult.gymName}.
            </Text>
            <TouchableOpacity
              className="w-full bg-primary py-4 rounded-2xl items-center"
              onPress={handleModalClose}
            >
              <Text className="text-black font-bold font-kanit">Okay</Text>
            </TouchableOpacity>
          </View>
        );

      case 'NO_SUBSCRIPTION':
        return (
          <View className="items-center">
            <View className="bg-yellow-500/20 p-4 rounded-full mb-4">
              <AlertCircle color="#eab308" size={40} />
            </View>
            <Text className="text-text text-2xl font-bold font-kanit mb-1">No Active Plan</Text>
            <Text className="text-text-secondary font-kanit text-center mb-8">
              You need an active subscription to check in at this gym.
            </Text>
            <View className="flex-row space-x-4 w-full">
              <TouchableOpacity
                className="flex-1 bg-white/10 py-4 rounded-2xl items-center"
                onPress={() => {
                  setShowResultModal(false);
                  setScanned(false);
                }}
              >
                <Text className="text-text font-bold font-kanit">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-primary py-4 rounded-2xl items-center"
                onPress={() => {
                  setShowResultModal(false);
                  router.push({
                    pathname: "/(main)/home/buy-subscription",
                    params: { 
                      tenantId: flowResult.tenantId, 
                      branchId: flowResult.branchId,
                      memberId: flowResult.memberId 
                    }
                  });
                }}
              >
                <Text className="text-black font-bold font-kanit">Buy Plan</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

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
            <Text className="text-text font-bold text-lg font-kanit">Scan QR Code</Text>
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

      <Modal visible={showResultModal} transparent animationType="slide">
        <View className="flex-1 justify-end">
          <BlurView intensity={100} tint="dark" className="bg-card rounded-t-[40px] px-8 py-10">
            <Animated.View entering={FadeIn} layout={Layout}>
              {renderModalContent()}
            </Animated.View>
          </BlurView>
        </View>
      </Modal>
    </View>
  );
}
