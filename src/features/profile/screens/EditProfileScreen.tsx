import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Header } from '@/components/layout/Header';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/useAuthStore';
import { updateAppUser } from '@/services/userService';
import { profileUpdateSchema } from '../schemas/profileSchema';
import { useRouter } from 'expo-router';
import { User, Phone, Mail, Save } from 'lucide-react-native';

export function EditProfileScreen() {
  const { profile, setProfile } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    phone: profile?.phone || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = async () => {
    if (!profile?.uid) return;

    try {
      setLoading(true);
      setErrors({});
      
      // Validate with Zod
      profileUpdateSchema.parse(formData);

      await updateAppUser(profile.uid, formData);
      
      // Update local store
      if (profile) {
        setProfile({
          ...profile,
          ...formData,
        });
      }

      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((e: any) => {
          newErrors[e.path[0]] = e.message;
        });
        setErrors(newErrors);
      } else {
        console.error('Profile update error:', error);
        Alert.alert('Error', 'Failed to update profile');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper className="bg-background">
      <Header title="Edit Profile" showBackButton />
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="py-8 items-center">
            <View className="w-24 h-24 bg-card rounded-full items-center justify-center border border-white/5">
                <User {...({ size: 40, stroke: "#C8FF32" } as any)} />
            </View>
            <Text className="text-text-secondary text-sm font-kanit mt-4">Profile UID: {profile?.uid?.slice(0, 8)}...</Text>
        </View>

        <View className="space-y-6">
            <View>
                <Text className="text-text-secondary text-xs font-bold font-kanit uppercase tracking-widest mb-2 ml-1">First Name</Text>
                <Input 
                  placeholder="First Name" 
                  value={formData.firstName}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
                  icon={User as any}
                />
                {errors.firstName && <Text className="text-red-500 text-[10px] mt-1 ml-1 font-kanit">{errors.firstName}</Text>}
            </View>

            <View>
                <Text className="text-text-secondary text-xs font-bold font-kanit uppercase tracking-widest mb-2 ml-1">Last Name</Text>
                <Input 
                  placeholder="Last Name" 
                  value={formData.lastName}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
                  icon={User as any}
                />
                {errors.lastName && <Text className="text-red-500 text-[10px] mt-1 ml-1 font-kanit">{errors.lastName}</Text>}
            </View>

            <View>
                <Text className="text-text-secondary text-xs font-bold font-kanit uppercase tracking-widest mb-2 ml-1">Phone Number</Text>
                <Input 
                  placeholder="Phone" 
                  value={formData.phone}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                  icon={Phone as any}
                  keyboardType="phone-pad"
                />
                {errors.phone && <Text className="text-red-500 text-[10px] mt-1 ml-1 font-kanit">{errors.phone}</Text>}
            </View>

            <View className="opacity-50">
                <Text className="text-text-secondary text-xs font-bold font-kanit uppercase tracking-widest mb-2 ml-1">Email Address</Text>
                <Input 
                  placeholder="Email" 
                  value={profile?.email || ''}
                  editable={false}
                  icon={Mail as any}
                />
                <Text className="text-text-secondary text-[10px] mt-1 ml-1 font-kanit italic">Email cannot be changed.</Text>
            </View>
        </View>

        <TouchableOpacity 
          onPress={handleSave}
          disabled={loading}
          className="bg-primary py-4 rounded-2xl items-center justify-center mt-12 mb-10 shadow-lg shadow-primary/20"
        >
          {loading ? (
             <ActivityIndicator color="black" />
          ) : (
             <View className="flex-row items-center space-x-2">
                <Save {...({ size: 20, stroke: "black" } as any)} />
                <Text className="text-black font-bold text-base font-kanit ml-2">Save Changes</Text>
             </View>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
}
