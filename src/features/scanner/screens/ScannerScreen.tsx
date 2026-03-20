import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Modal, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { X, Zap, ZapOff, CheckCircle2 } from "lucide-react-native";
import Animated, { FadeIn, Layout } from "react-native-reanimated";
import { verifyQrScan, createJoinRequest, linkMemberProfile } from "../services/qrVerifyService";
import { markAttendance } from "@/services/memberService";
import { useAuthStore } from "@/store/useAuthStore";
import { useMemberStore } from "@/store/useMemberStore";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useToaster } from "@/providers/useToaster";
import { useModal } from "@/providers/useModal";

export function ScannerScreen() {
  const { showToast } = useToaster();
  const { showModal: showGlobalModal } = useModal();
  const colors = useThemeColors();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flash, setFlash] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  const { user, profile } = useAuthStore();
  const { memberData, setMemberData, setTenantInfo } = useMemberStore();

  useEffect(() => {
    if (!permission) requestPermission();
  }, []);

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

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || isProcessing) return;

    setScanned(true);
    setIsProcessing(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      // Basic URL parsing (mimicking deepLinkService behavior)
      let tenantId = "";
      let branchId = "main";

      if (data.includes("tenantId=")) {
        tenantId = data.split("tenantId=")[1].split("&")[0];
        if (data.includes("branchId=")) {
          branchId = data.split("branchId=")[1].split("&")[0];
        }
      } else {
        // Assume raw text if not a URL
        tenantId = data;
      }

      const result = await verifyQrScan({ tenantId, branchId });
      setScanResult({ ...result, tenantId, branchId });
      setShowModal(true);
    } catch (error: any) {
      showToast({
        title: "Scan Error",
        message: error.message || "Failed to verify QR code",
        variant: "danger",
      });
      setScanned(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAction = async () => {
    if (!scanResult) return;
    setIsProcessing(true);

    try {
      if (scanResult.status === "EXISTING_MEMBER") {
        // Link profile
        await linkMemberProfile({
          tenantId: scanResult.tenantId,
          branchId: scanResult.branchId,
          memberId: scanResult.memberPreview.memberId,
          consent: true,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast({
          title: "Success",
          message: "Profile linked successfully!",
          variant: "success",
        });
      } else if (scanResult.status === "NO_MEMBER") {
        // Join request
        await createJoinRequest({
          tenantId: scanResult.tenantId,
          branchId: scanResult.branchId,
          displayName: user?.displayName || undefined,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast({
          title: "Request Sent",
          message: "Your request to join has been submitted.",
          variant: "success",
        });
      } else if (
        scanResult.status === "EXISTING_MEMBER" &&
        profile?.activeGym === scanResult.tenantId
      ) {
        // Attendance (if already a member)
        if (memberData) {
          await markAttendance(scanResult.tenantId, memberData.id, scanResult.branchId);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          showGlobalModal({
            title: "Checked In!",
            message: `Welcome to ${scanResult.gymName}`,
            variant: "success",
            cancelable: true,
            buttons: [{ text: "Done", style: "default" }],
          });
        }
      }

      setShowModal(false);
      setScanned(false);
    } catch (error: any) {
      showToast({
        title: "Action Failed",
        message: error.message || "Could not complete request",
        variant: "danger",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View className="flex-1 bg-black">
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        enableTorch={flash}
        onBarcodeScanned={handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      >
        <View className="flex-1 bg-black/40">
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 pt-14">
            <TouchableOpacity
              className="bg-black/50 p-2 rounded-full"
              onPress={() => router.back()}
            >
              <X {...({ color: colors.text, size: 24 } as any)} />
            </TouchableOpacity>
            <Text className="text-text font-bold text-lg font-kanit">Scan QR Code</Text>
            <TouchableOpacity
              className="bg-black/50 p-2 rounded-full"
              onPress={() => setFlash(!flash)}
            >
              {flash ? (
                <Zap {...({ color: colors.primary, size: 24 } as any)} />
              ) : (
                <ZapOff {...({ color: colors.text, size: 24 } as any)} />
              )}
            </TouchableOpacity>
          </View>

          {/* Scanner Overlay */}
          <View className="flex-1 items-center justify-center">
            <View className="w-72 h-72 items-center justify-center">
              {/* Corner brackets */}
              <View className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
              <View className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
              <View className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
              <View className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-2xl" />

              <View className="w-64 h-64 border border-stone-200/20 dark:border-stone-900/20 rounded-3xl" />

              {isProcessing && (
                <View className="absolute inset-0 items-center justify-center bg-black/40 rounded-3xl">
                  <ActivityIndicator color={colors.primary} size="large" />
                </View>
              )}

              {/* Scanning animation line */}
              {!isProcessing && !scanned && (
                <Animated.View
                  entering={FadeIn}
                  className="absolute top-4 w-60 h-0.5 bg-primary/50 shadow-lg shadow-primary"
                  style={{ transform: [{ translateY: 10 }] }} // This would need a loop in real use, but good for visual.
                />
              )}
            </View>
            <Text className="text-text/60 mt-12 font-kanit font-medium tracking-wide">
              Align QR Code within the frame
            </Text>
          </View>

          {/* Footer Info */}
          <View className="px-10 pb-28 items-center">
            <Text className="text-text-secondary text-center font-kanit opacity-80">
              Scan a gym QR code to mark attendance or join a new gym branch
            </Text>
          </View>
        </View>
      </CameraView>

      {/* Confirmation Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View className="flex-1 justify-end">
          <BlurView
            intensity={100}
            tint="dark"
            className="bg-card h-[45%] rounded-t-[40px] px-8 py-10 border-t border-stone-200/10 dark:border-stone-900/10"
          >
            {scanResult && (
              <Animated.View entering={FadeIn} layout={Layout} className="flex-1">
                <View className="items-center mb-6">
                  <View className="bg-primary/20 p-4 rounded-full mb-4">
                    <CheckCircle2 {...({ color: colors.primary, size: 40 } as any)} />
                  </View>
                  <Text className="text-text text-2xl font-bold font-kanit mb-1">
                    {scanResult.gymName || "New Gym Found"}
                  </Text>
                  <Text className="text-text-secondary font-kanit">
                    {scanResult.branchName || "Main Branch"}
                  </Text>
                </View>

                <View className="bg-white/5 p-5 rounded-2xl mb-8 border border-stone-200/5 dark:border-stone-900/5">
                  <Text className="text-text/80 font-kanit leading-6 text-center">
                    {scanResult.status === "EXISTING_MEMBER"
                      ? "We found a membership linked to your phone number. Would you like to link it to your account?"
                      : scanResult.status === "NO_MEMBER"
                        ? "You are not a member of this gym yet. Would you like to send a join request?"
                        : "You are already a member! Click below to mark your attendance."}
                  </Text>
                </View>

                <View className="flex-row space-x-4">
                  <TouchableOpacity
                    className="flex-1 bg-white/10 py-4 rounded-2xl items-center"
                    onPress={() => {
                      setShowModal(false);
                      setScanned(false);
                    }}
                  >
                    <Text className="text-text font-bold font-kanit">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-primary py-4 rounded-2xl items-center"
                    onPress={handleAction}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <ActivityIndicator color={colors.onPrimary} />
                    ) : (
                      <Text className="text-black font-bold font-kanit">
                        {scanResult.status === "EXISTING_MEMBER"
                          ? "Link Account"
                          : scanResult.status === "NO_MEMBER"
                            ? "Request to Join"
                            : "Check In"}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}
          </BlurView>
        </View>
      </Modal>
    </View>
  );
}

// Add simple BlurView polyfill for Android since intensity is used
