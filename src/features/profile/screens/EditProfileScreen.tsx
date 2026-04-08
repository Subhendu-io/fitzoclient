import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform, StyleSheet, Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Header } from '@/components/layout/Header';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/useAuthStore';
import { updateAppUser } from '@/services/userService';
import { profileUpdateSchema } from '../schemas/profileSchema';
import { useRouter } from 'expo-router';
import { User, Phone, Mail, Save, MapPin, Pencil } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useToaster } from '@/providers/useToaster';
import { AppUser } from '@/interfaces/member';
import { getStorage } from '@/lib/firebase';

type GenderOption = NonNullable<AppUser['gender']>;
const GENDERS: { label: string; value: GenderOption }[] = [
  { label: '♂ Male', value: 'male' },
  { label: '♀ Female', value: 'female' },
  { label: '⚧ Other', value: 'other' },
];

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={[chipStyles.chip, selected && chipStyles.chipSelected]}>
      <Text style={[chipStyles.label, selected && chipStyles.labelSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16,
    borderRadius: 999, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: 8, marginBottom: 8,
  },
  chipSelected: { borderColor: '#c8ff32', backgroundColor: 'rgba(200,255,50,0.12)' },
  label: { color: 'rgba(255,255,255,0.55)', fontFamily: 'Kanit_400Regular', fontSize: 13 },
  labelSelected: { color: '#c8ff32', fontFamily: 'Kanit_700Bold' },
});

export function EditProfileScreen() {
  const { showToast } = useToaster();
  const colors = useThemeColors();
  const { profile, setProfile } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    phone: profile?.phone || '',
    gender: profile?.gender as GenderOption | undefined,
    dateOfBirth: profile?.dateOfBirth ? new Date(profile.dateOfBirth) : undefined,
    location: profile?.location || '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageUploading, setImageUploading] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setFormData(prev => ({ ...prev, dateOfBirth: selectedDate }));
    }
  };

  const handleImagePick = async () => {
    if (!profile?.uid) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setImageUploading(true);
        const uri = result.assets[0].uri;
        
        const storage = getStorage();
        const reference = storage.ref(`users/${profile.uid}/profile/avatar.jpg`);
        
        await reference.putFile(uri);
        const url = await reference.getDownloadURL();
        
        await updateAppUser(profile.uid, { photoURL: url });
        setProfile({ ...profile, photoURL: url });
        
        showToast({ title: 'Success', message: 'Profile picture updated!', variant: 'success' });
      }
    } catch (error) {
      console.error('Image upload error:', error);
      showToast({ title: 'Upload Failed', message: 'Could not upload the image. Try again.', variant: 'danger' });
    } finally {
      setImageUploading(false);
    }
  };

  const handleSave = async () => {
    if (!profile?.uid) return;

    try {
      setLoading(true);
      setErrors({});
      
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.toISOString() : undefined,
        location: formData.location.trim(),
      };

      // Validate with Zod
      profileUpdateSchema.parse(payload);

      await updateAppUser(profile.uid, payload);
      
      // Update local store
      if (profile) {
        setProfile({
          ...profile,
          ...payload,
        });
      }

      showToast({ title: 'Success', message: 'Profile updated successfully', variant: 'success' });
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
        showToast({ title: 'Error', message: 'Failed to update profile', variant: 'danger' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper className="bg-background" backgroundVariant="default">
      <Header title="Edit Profile" showBackButton />
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="py-8 items-center">
            <TouchableOpacity 
               onPress={handleImagePick}
               disabled={imageUploading}
               activeOpacity={0.7}
               className="relative"
            >
                <View className="w-24 h-24 bg-card rounded-full items-center justify-center border border-primary overflow-hidden">
                  {imageUploading ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : profile?.photoURL ? (
                    <Image source={{ uri: profile.photoURL }} className="w-full h-full" />
                  ) : (
                    <User {...({ size: 40, stroke: colors.primary } as any)} />
                  )}
                </View>
                {!imageUploading && (
                  <View className="absolute bottom-0 right-0 bg-primary w-7 h-7 rounded-full items-center justify-center border-[3px] border-background">
                    <Pencil size={12} color="black" />
                  </View>
                )}
            </TouchableOpacity>
        </View>

        <View className="space-y-6">
            <View className="flex-row space-x-3 gap-2">
                <View className="flex-1">
                    <Text className="text-text-secondary text-xs font-bold font-kanit uppercase tracking-widest mb-2 ml-1">First Name *</Text>
                    <Input 
                      placeholder="First Name" 
                      value={formData.firstName}
                      onChangeText={(text) => {
                        setFormData(prev => ({ ...prev, firstName: text }));
                        if(errors.firstName) setErrors(prev => ({ ...prev, firstName: '' }));
                      }}
                    />
                    {errors.firstName && <Text className="text-red-500 text-[10px] mt-1 ml-1 font-kanit">{errors.firstName}</Text>}
                </View>

                <View className="flex-1">
                    <Text className="text-text-secondary text-xs font-bold font-kanit uppercase tracking-widest mb-2 ml-1">Last Name *</Text>
                    <Input 
                      placeholder="Last Name" 
                      value={formData.lastName}
                      onChangeText={(text) => {
                        setFormData(prev => ({ ...prev, lastName: text }));
                        if(errors.lastName) setErrors(prev => ({ ...prev, lastName: '' }));
                      }}
                    />
                    {errors.lastName && <Text className="text-red-500 text-[10px] mt-1 ml-1 font-kanit">{errors.lastName}</Text>}
                </View>
            </View>

            <View className="mb-2 mt-2">
                <Text className="text-text-secondary text-xs font-bold font-kanit uppercase tracking-widest mb-3 ml-1">Gender</Text>
                <View className="flex-row flex-wrap">
                  {GENDERS.map((g) => (
                    <Chip
                      key={g.value}
                      label={g.label}
                      selected={formData.gender === g.value}
                      onPress={() => {
                        setFormData(prev => ({ ...prev, gender: g.value }));
                      }}
                    />
                  ))}
                </View>
                {errors.gender && <Text className="text-red-500 text-[10px] mt-1 ml-1 font-kanit">{errors.gender}</Text>}
            </View>

            <View className="mb-2">
                <Text className="text-text-secondary text-xs font-bold font-kanit uppercase tracking-widest mb-2 ml-1">Date of Birth</Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.7}
                  className="h-14 px-4 bg-card border border-white/5 rounded-2xl justify-center"
                >
                  <Text className={formData.dateOfBirth ? "text-white font-kanit text-base" : "text-white/40 font-kanit text-base"}>
                    {formData.dateOfBirth ? formData.dateOfBirth.toLocaleDateString('en-GB') : "DD/MM/YYYY"}
                  </Text>
                </TouchableOpacity>

                {showDatePicker && (
                  Platform.OS === 'ios' ? (
                    <View className="bg-card/50 rounded-2xl mt-2 p-3 border border-white/5">
                      <DateTimePicker
                        value={formData.dateOfBirth || new Date()}
                        mode="date"
                        display="spinner"
                        onChange={handleDateChange}
                        maximumDate={new Date()}
                        themeVariant="dark"
                      />
                      <TouchableOpacity
                        onPress={() => setShowDatePicker(false)}
                        className="bg-primary py-3 rounded-xl items-center mt-2"
                      >
                        <Text className="text-black font-kanit font-bold">Done</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <DateTimePicker
                      value={formData.dateOfBirth || new Date()}
                      mode="date"
                      display="default"
                      onChange={handleDateChange}
                      maximumDate={new Date()}
                    />
                  )
                )}
                {errors.dateOfBirth && <Text className="text-red-500 text-[10px] mt-1 ml-1 font-kanit">{errors.dateOfBirth}</Text>}
            </View>

            <View>
                <Text className="text-text-secondary text-xs font-bold font-kanit uppercase tracking-widest mb-2 ml-1">Location / Area</Text>
                <Input 
                  placeholder="City or area (e.g. Mumbai)" 
                  value={formData.location}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
                  icon={MapPin as any}
                />
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
             <ActivityIndicator color={colors.onPrimary} />
          ) : (
             <View className="flex-row items-center space-x-2">
                <Save {...({ size: 20, stroke: colors.onPrimary } as any)} />
                <Text className="text-black font-bold text-base font-kanit ml-2">Save Changes</Text>
             </View>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
}
