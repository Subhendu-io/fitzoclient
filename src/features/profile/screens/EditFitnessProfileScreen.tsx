import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Header } from '@/components/layout/Header';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/useAuthStore';
import { saveUserFitnessProfile, getUserFitnessProfile } from '@/features/auth/services/authService';
import { useRouter } from 'expo-router';
import { Save, Ruler, Weight, Target, Utensils, Activity, Trophy } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useToaster } from '@/providers/useToaster';
import { UserFitnessProfile } from '@/interfaces/member';

type DietOption   = 'veg' | 'non-veg' | 'vegan' | 'eggetarian';
type GoalOption   = 'lose_weight' | 'gain_muscle' | 'maintain' | 'improve_health';
type ActivityOption = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

const DIET_PREFS: { label: string; value: DietOption }[] = [
  { label: '🟢 Veg', value: 'veg' },
  { label: '🔴 Non-Veg', value: 'non-veg' },
  { label: '🌱 Vegan', value: 'vegan' },
  { label: '🥚 Eggetarian', value: 'eggetarian' },
];

const GOALS: { label: string; value: GoalOption }[] = [
  { label: '📉 Lose Weight', value: 'lose_weight' },
  { label: '💪 Gain Muscle', value: 'gain_muscle' },
  { label: '⚖️ Maintain', value: 'maintain' },
  { label: '❤️ Improve Health', value: 'improve_health' },
];

const ACTIVITY_LEVELS: { label: string; value: ActivityOption }[] = [
  { label: '🛋️ Sedentary', value: 'sedentary' },
  { label: '🚶 Light', value: 'light' },
  { label: '🏃 Moderate', value: 'moderate' },
  { label: '🚴 Active', value: 'active' },
  { label: '🔥 Very Active', value: 'very_active' },
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

export function EditFitnessProfileScreen() {
  const { showToast } = useToaster();
  const colors = useThemeColors();
  const { user } = useAuthStore();
  const router = useRouter();
  
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [loading, setLoading] = useState(false);

  // Body Stats
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');

  // Body Measurements
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [arms, setArms] = useState('');
  const [thighs, setThighs] = useState('');

  // Preferences
  const [diet, setDiet] = useState<DietOption | undefined>();
  const [goal, setGoal] = useState<GoalOption | undefined>();
  const [activity, setActivity] = useState<ActivityOption | undefined>();

  useEffect(() => {
    async function load() {
      if (user?.uid) {
        const profile = await getUserFitnessProfile(user.uid);
        if (profile) {
          if (profile.bodyStats) {
             setHeight(profile.bodyStats.height?.toString() || '');
             setWeight(profile.bodyStats.weight?.toString() || '');
             setTargetWeight(profile.bodyStats.targetWeight?.toString() || '');
          }
          if (profile.bodyMeasurement) {
             setChest(profile.bodyMeasurement.chest?.toString() || '');
             setWaist(profile.bodyMeasurement.waist?.toString() || '');
             setHips(profile.bodyMeasurement.hips?.toString() || '');
             setArms(profile.bodyMeasurement.arms?.toString() || '');
             setThighs(profile.bodyMeasurement.thighs?.toString() || '');
          }
          if (profile.preferences) {
             setDiet(profile.preferences.dietPreference);
             setGoal(profile.preferences.fitnessGoal);
             setActivity(profile.preferences.activityLevel);
          }
        }
      }
      setLoadingConfig(false);
    }
    load();
  }, [user]);

  const handleSave = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      
      const cleanObj = (obj: any) => Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined && v !== ''));

      const bodyStats = cleanObj({
        height: height ? Number(height) : undefined,
        weight: weight ? Number(weight) : undefined,
        targetWeight: targetWeight ? Number(targetWeight) : undefined,
      });

      const bodyMeasurement = cleanObj({
        chest: chest ? Number(chest) : undefined,
        waist: waist ? Number(waist) : undefined,
        hips: hips ? Number(hips) : undefined,
        arms: arms ? Number(arms) : undefined,
        thighs: thighs ? Number(thighs) : undefined,
      });

      const preferences = cleanObj({
        dietPreference: diet,
        fitnessGoal: goal,
        activityLevel: activity,
      });

      const profile: Omit<UserFitnessProfile, 'updatedAt'> = {};
      
      if (Object.keys(bodyStats).length > 0) profile.bodyStats = bodyStats;
      if (Object.keys(bodyMeasurement).length > 0) profile.bodyMeasurement = bodyMeasurement;
      if (Object.keys(preferences).length > 0) profile.preferences = preferences as any;

      await saveUserFitnessProfile(user.uid, profile);

      showToast({ title: 'Success', message: 'Fitness profile updated successfully', variant: 'success' });
      router.back();
    } catch (error: any) {
      console.error('Fitness profile update error:', error);
      showToast({ title: 'Error', message: 'Failed to update fitness profile', variant: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  if (loadingConfig) {
      return (
          <ScreenWrapper className="bg-background" backgroundVariant="default">
             <Header title="Fitness Details" showBackButton />
             <View className="flex-1 items-center justify-center">
                 <ActivityIndicator size="large" color={colors.primary} />
             </View>
          </ScreenWrapper>
      )
  }

  return (
    <ScreenWrapper className="bg-background" backgroundVariant="default">
      <Header title="Fitness Details" showBackButton />
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
         {/* Body Stats Form */}
         <View className="mb-6 mt-6">
            <Text className="text-text-secondary text-[10px] font-bold font-kanit uppercase tracking-[2px] mb-4">Body Stats</Text>
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-text-secondary text-xs font-bold font-kanit uppercase tracking-widest mb-2 ml-1">Height (cm)</Text>
                <Input placeholder="e.g. 175" value={height} onChangeText={setHeight} keyboardType="numeric" icon={Ruler as any} />
              </View>
              <View className="flex-1">
                <Text className="text-text-secondary text-xs font-bold font-kanit uppercase tracking-widest mb-2 ml-1">Weight (kg)</Text>
                <Input placeholder="e.g. 70" value={weight} onChangeText={setWeight} keyboardType="numeric" icon={Weight as any} />
              </View>
            </View>
            <View>
              <Text className="text-text-secondary text-xs font-bold font-kanit uppercase tracking-widest mb-2 ml-1">Target Weight (kg)</Text>
              <Input placeholder="e.g. 65" value={targetWeight} onChangeText={setTargetWeight} keyboardType="numeric" icon={Target as any} />
            </View>
         </View>

         {/* Preferences Form */}
         <View className="mb-6">
            <Text className="text-text-secondary text-[10px] font-bold font-kanit uppercase tracking-[2px] mb-4">Preferences</Text>
            
            <View className="mb-6">
              <Text className="text-text-secondary text-xs font-bold font-kanit uppercase tracking-widest mb-3 ml-1">Diet Preference</Text>
              <View className="flex-row flex-wrap">
                {DIET_PREFS.map(d => (
                  <Chip key={d.value} label={d.label} selected={diet === d.value} onPress={() => setDiet(d.value)} />
                ))}
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-text-secondary text-xs font-bold font-kanit uppercase tracking-widest mb-3 ml-1">Fitness Goal</Text>
              <View className="flex-row flex-wrap">
                {GOALS.map(g => (
                  <Chip key={g.value} label={g.label} selected={goal === g.value} onPress={() => setGoal(g.value)} />
                ))}
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-text-secondary text-xs font-bold font-kanit uppercase tracking-widest mb-3 ml-1">Activity Level</Text>
              <View className="flex-row flex-wrap">
                {ACTIVITY_LEVELS.map(a => (
                  <Chip key={a.value} label={a.label} selected={activity === a.value} onPress={() => setActivity(a.value)} />
                ))}
              </View>
            </View>
         </View>

         {/* Body Measurements */}
         <View className="mb-6">
            <Text className="text-text-secondary text-[10px] font-bold font-kanit uppercase tracking-[2px] mb-4">Body Measurements (cm)</Text>
            
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-text-secondary text-xs font-bold font-kanit uppercase tracking-widest mb-2 ml-1">Chest</Text>
                <Input placeholder="e.g. 95" value={chest} onChangeText={setChest} keyboardType="numeric" />
              </View>
              <View className="flex-1">
                <Text className="text-text-secondary text-xs font-bold font-kanit uppercase tracking-widest mb-2 ml-1">Waist</Text>
                <Input placeholder="e.g. 80" value={waist} onChangeText={setWaist} keyboardType="numeric" />
              </View>
            </View>

            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-text-secondary text-xs font-bold font-kanit uppercase tracking-widest mb-2 ml-1">Hips</Text>
                <Input placeholder="e.g. 90" value={hips} onChangeText={setHips} keyboardType="numeric" />
              </View>
              <View className="flex-1">
                <Text className="text-text-secondary text-xs font-bold font-kanit uppercase tracking-widest mb-2 ml-1">Arms</Text>
                <Input placeholder="e.g. 35" value={arms} onChangeText={setArms} keyboardType="numeric" />
              </View>
            </View>
            
            <View className="w-1/2 pr-1.5">
               <Text className="text-text-secondary text-xs font-bold font-kanit uppercase tracking-widest mb-2 ml-1">Thighs</Text>
               <Input placeholder="e.g. 55" value={thighs} onChangeText={setThighs} keyboardType="numeric" />
            </View>
         </View>

        <TouchableOpacity 
          onPress={handleSave}
          disabled={loading}
          className="bg-primary py-4 rounded-2xl items-center justify-center mt-6 mb-10 shadow-lg shadow-primary/20"
        >
          {loading ? (
             <ActivityIndicator color={colors.onPrimary} />
          ) : (
             <View className="flex-row items-center space-x-2">
                <Save {...({ size: 20, stroke: colors.onPrimary } as any)} />
                <Text className="text-black font-bold text-base font-kanit ml-2">Save Details</Text>
             </View>
          )}
        </TouchableOpacity>

      </ScrollView>
    </ScreenWrapper>
  );
}
