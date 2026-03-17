import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/store/useAuthStore";
import { signInWithEmailAndPassword } from "@react-native-firebase/auth";
import { auth } from "@/lib/firebase";

export function LoginScreen() {
  const router = useRouter();
  const { setUser, setLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;

    setIsSubmitting(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth(), email, password);
      setUser(userCredential.user);
      router.replace("/(tabs)/home");
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Login failed", "Please check your email and password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenWrapper className="flex px-8 py-16 justify-center">
      <View className="mb-12">
        <Text className="text-4xl font-extrabold text-text font-kanit mb-2">
          Welcome <Text className="text-primary">Back</Text>
        </Text>
        <Text className="text-base text-text-secondary font-kanit">
          Log in to continue your fitness journey
        </Text>
      </View>

      <View className="w-full space-y-4">
        <Input
          label="Email"
          placeholder="email@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <Input
          label="Password"
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity className="self-end mb-6">
          <Text className="text-primary text-sm font-semibold font-kanit">Forgot Password?</Text>
        </TouchableOpacity>

        <Button title="Login" onPress={handleLogin} loading={isSubmitting} className="mt-4" />

        <Button
          title="Login with Phone"
          onPress={() => router.push("/phone-login")}
          loading={isSubmitting}
          className="mt-4"
          variant="outline"
          textClassName="text-primary"
        />

        <View className="flex-row justify-center mt-10">
          <Text className="text-text-secondary font-kanit">Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
            <Text className="text-primary font-bold font-kanit">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}
