import React from "react";
import { View, Image, Text } from "react-native";
import { AppUser } from "@/interfaces/member";

export function UserAvatar({
  profile,
  textSize,
  textWeight,
}: {
  profile: AppUser | null;
  textSize: string;
  textWeight: "bold" | "normal" | "medium" | "light" | "thin" | "black";
}) {
  const getInitials = () => {
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
    }
    return profile?.firstName?.[0]?.toUpperCase() || "U";
  };

  const source = profile?.photoURL;

  return (
    <View className="w-full h-full items-center justify-center">
      {source ? (
        <Image source={{ uri: source }} className="w-full h-full rounded-full" resizeMode="cover" />
      ) : (
        <Text className={`text-onPrimary font-${textWeight} ${textSize}`}>{getInitials()}</Text>
      )}
    </View>
  );
}
