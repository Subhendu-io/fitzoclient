import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/useAuthStore';
import { saveUserFitnessProfile, updateUserBasicInfo } from '../services/authService';
import { AppUser } from '@/interfaces/member';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useThemeColors } from '@/hooks/useThemeColors';
import { ChevronDown, ChevronUp, User, Activity, Ruler, Heart } from 'lucide-react-native';

// ─── Chip option types ──────────────────────────────────────────────
type GenderOption = NonNullable<AppUser['gender']>;
type DietOption   = 'veg' | 'non-veg' | 'vegan' | 'eggetarian';
type GoalOption   = 'lose_weight' | 'gain_muscle' | 'maintain' | 'improve_health';
type ActivityOption = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

const GENDERS: { label: string; value: GenderOption }[] = [
  { label: '♂ Male', value: 'male' },
  { label: '♀ Female', value: 'female' },
  { label: '⚧ Other', value: 'other' },
];

const DIETS: { label: string; value: DietOption; emoji: string }[] = [
  { label: 'Veg', value: 'veg', emoji: '🥦' },
  { label: 'Non-Veg', value: 'non-veg', emoji: '🍗' },
  { label: 'Vegan', value: 'vegan', emoji: '🌱' },
  { label: 'Eggetarian', value: 'eggetarian', emoji: '🥚' },
];

const GOALS: { label: string; value: GoalOption; emoji: string }[] = [
  { label: 'Lose Weight', value: 'lose_weight', emoji: '🔥' },
  { label: 'Gain Muscle', value: 'gain_muscle', emoji: '💪' },
  { label: 'Maintain', value: 'maintain', emoji: '⚖️' },
  { label: 'Improve Health', value: 'improve_health', emoji: '❤️' },
];

const ACTIVITY_LEVELS: { label: string; value: ActivityOption; desc: string }[] = [
  { label: 'Sedentary', value: 'sedentary', desc: 'Little or no exercise' },
  { label: 'Light', value: 'light', desc: '1–3 days/week' },
  { label: 'Moderate', value: 'moderate', desc: '3–5 days/week' },
  { label: 'Active', value: 'active', desc: '6–7 days/week' },
  { label: 'Very Active', value: 'very_active', desc: 'Hard exercise daily' },
];

// ─── Small reusable chip ─────────────────────────────────────────────
function Chip({
  label,
  selected,
  onPress,
  emoji,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  emoji?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        chipStyles.chip,
        selected && chipStyles.chipSelected,
      ]}
    >
      {emoji ? <Text style={chipStyles.emoji}>{emoji}</Text> : null}
      <Text style={[chipStyles.label, selected && chipStyles.labelSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    borderColor: '#c8ff32',
    backgroundColor: 'rgba(200,255,50,0.12)',
  },
  emoji: { fontSize: 15, marginRight: 6 },
  label: { color: 'rgba(255,255,255,0.55)', fontFamily: 'Kanit_400Regular', fontSize: 13 },
  labelSelected: { color: '#c8ff32', fontFamily: 'Kanit_700Bold' },
});

// ─── Section header (For non-collapsible) ────────────────────────────
function SectionHeader({ title, subtitle, icon: Icon }: { title: string; subtitle?: string; icon?: any }) {
  return (
    <View className="flex-row items-center mb-5">
      {Icon && (
        <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
          <Icon size={20} color="#c8ff32" />
        </View>
      )}
      <View className="flex-1">
        <Text className="text-white text-lg font-bold font-kanit">{title}</Text>
        {subtitle ? (
          <Text className="text-white/50 text-xs font-kanit mt-0.5">{subtitle}</Text>
        ) : null}
      </View>
    </View>
  );
}

// ─── Collapsible Section ─────────────────────────────────────────────
function CollapsibleSection({
  title,
  subtitle,
  icon: Icon,
  isOpen,
  onToggle,
  children,
  delay = 200,
}: any) {
  return (
    <Animated.View entering={FadeInUp.delay(delay)} className="mb-4">
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.7}
        className="flex-row items-center justify-between bg-card rounded-[20px] p-4 border border-white/5"
      >
        <View className="flex-row items-center flex-1">
          {Icon && (
            <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
               <Icon size={20} color="#c8ff32" />
            </View>
          )}
          <View className="flex-1">
            <Text className="text-white text-base font-bold font-kanit">{title}</Text>
            {subtitle ? (
              <Text className="text-white/50 text-xs font-kanit mt-0.5">{subtitle}</Text>
            ) : null}
          </View>
        </View>
        {isOpen
          ? <ChevronUp size={20} color="#c8ff32" />
          : <ChevronDown size={20} color="rgba(255,255,255,0.4)" />
        }
      </TouchableOpacity>

      {isOpen && (
        <View className="pt-4 px-1">
           {children}
        </View>
      )}
    </Animated.View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────
export function UserDetailsScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { user } = useAuthStore();

  // Collapsible States
  const [statsOpen, setStatsOpen] = useState(false);
  const [measurementsOpen, setMeasurementsOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  // Mandatory Info
  const [firstName, setFirstName] = useState(user?.displayName?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user?.displayName?.split(' ').slice(1).join(' ') || '');
  const [gender, setGender] = useState<GenderOption | undefined>();
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  // Optional Info - Location
  const [location, setLocation] = useState('');

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

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const isFormValid = 
    firstName.trim() !== '' && 
    lastName.trim() !== '' && 
    gender !== undefined && 
    dateOfBirth !== undefined;

  const validateMandatory = () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please provide your First and Last Name.');
      return false;
    }
    if (!gender) {
      setError('Please select your Gender.');
      return false;
    }
    if (!dateOfBirth) {
      setError('Please provide your Date of Birth.');
      return false;
    }
    return true;
  };

  const handleComplete = async () => {
    if (!user?.uid) return;
    if (!validateMandatory()) return;
    
    setIsSaving(true);
    setError('');
    try {
      // 1. Save basic info to main profile including birthday, gender, location
      await updateUserBasicInfo(user.uid, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : undefined,
        ...(gender ? { gender } : {}),
        ...(location.trim() ? { location: location.trim() } : {}),
      });

      // Helper to strip undefined values so we don't create empty objects in Firestore
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

      // 2. Save all remaining fitness data to fitness subCollection
      const profile: Partial<AppUser> = {};
      
      if (Object.keys(bodyStats).length > 0) profile.bodyStats = bodyStats;
      if (Object.keys(bodyMeasurement).length > 0) profile.bodyMeasurement = bodyMeasurement;
      if (Object.keys(preferences).length > 0) profile.preferences = preferences as any;

      await saveUserFitnessProfile(user.uid, profile);
      router.replace('/(tabs)/(home)');
    } catch (err: any) {
      setError(err.message || 'Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenWrapper className="bg-background">
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(100)} className="mb-8">
          {/* <Text className="text-white/60 text-sm font-kanit uppercase tracking-widest mb-2">
            Almost Done
          </Text> */}
          <Text className="text-4xl font-extrabold text-text font-kanit leading-tight">
            You are almost{'\n'}
            <Text className="text-primary">Done</Text>
          </Text>
          <Text className="text-text-secondary text-sm font-kanit mt-3">
            Tell us about yourself to help us personalize your fitness journey.
          </Text>
        </Animated.View>

        {/* ── Section 1: About You (Always Open) ────────────────────── */}
        <Animated.View entering={FadeInUp.delay(150)} className="mb-8">
          <SectionHeader title="About You" subtitle="Required personal details" icon={User} />

          <View className="flex-row space-x-3 gap-2">
            <View className="flex-1">
              <Input 
                label="First Name *" 
                placeholder="John" 
                value={firstName}
                onChangeText={(text) => { setFirstName(text); if(error) setError(''); }}
              />
            </View>
            <View className="flex-1">
              <Input 
                label="Last Name *" 
                placeholder="Doe" 
                value={lastName}
                onChangeText={(text) => { setLastName(text); if(error) setError(''); }}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-text-secondary text-xs font-kanit uppercase tracking-wider mb-3 mt-1">
              Gender *
            </Text>
            <View className="flex-row flex-wrap">
              {GENDERS.map((g) => (
                <Chip
                  key={g.value}
                  label={g.label}
                  selected={gender === g.value}
                  onPress={() => { setGender(g.value); if(error) setError(''); }}
                />
              ))}
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-text-secondary text-xs font-kanit uppercase tracking-wider mb-2 mt-1">
              Date of Birth *
            </Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
              className="h-14 px-4 bg-card border border-white/5 rounded-2xl justify-center"
            >
              <Text className={dateOfBirth ? "text-white font-kanit text-base" : "text-white/40 font-kanit text-base"}>
                {dateOfBirth ? dateOfBirth.toLocaleDateString('en-GB') : "DD/MM/YYYY"}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              Platform.OS === 'ios' ? (
                <View className="bg-card/50 rounded-2xl mt-2 p-3 border border-white/5">
                  <DateTimePicker
                    value={dateOfBirth || new Date()}
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
                  value={dateOfBirth || new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )
            )}
          </View>

          <Input
            label="Location (Optional)"
            placeholder="City or area (e.g. Mumbai)"
            value={location}
            onChangeText={setLocation}
          />
        </Animated.View>

        {/* ── Section 2: Body Stats ─────────────────────────────────── */}
        <CollapsibleSection
          title="Body Stats"
          subtitle="Used to calculate your metrics"
          icon={Activity}
          isOpen={statsOpen}
          onToggle={() => setStatsOpen(!statsOpen)}
          delay={200}
        >
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input
                label="Height (cm)"
                placeholder="175"
                keyboardType="number-pad"
                value={height}
                onChangeText={setHeight}
              />
            </View>
            <View className="flex-1">
              <Input
                label="Weight (kg)"
                placeholder="70"
                keyboardType="number-pad"
                value={weight}
                onChangeText={setWeight}
              />
            </View>
          </View>

          <Input
            label="Target Weight (kg)"
            placeholder="65"
            keyboardType="number-pad"
            value={targetWeight}
            onChangeText={setTargetWeight}
          />
        </CollapsibleSection>

        {/* ── Section 3: Body Measurements ───────────────────────────── */}
        <CollapsibleSection
          title="Body Measurements"
          subtitle="Track your physical changes"
          icon={Ruler}
          isOpen={measurementsOpen}
          onToggle={() => setMeasurementsOpen(!measurementsOpen)}
          delay={250}
        >
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input label="Chest (cm)" placeholder="90" keyboardType="number-pad" value={chest} onChangeText={setChest} />
            </View>
            <View className="flex-1">
              <Input label="Waist (cm)" placeholder="80" keyboardType="number-pad" value={waist} onChangeText={setWaist} />
            </View>
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input label="Hips (cm)" placeholder="95" keyboardType="number-pad" value={hips} onChangeText={setHips} />
            </View>
            <View className="flex-1">
              <Input label="Arms (cm)" placeholder="32" keyboardType="number-pad" value={arms} onChangeText={setArms} />
            </View>
          </View>
          <Input label="Thighs (cm)" placeholder="55" keyboardType="number-pad" value={thighs} onChangeText={setThighs} />
        </CollapsibleSection>

        {/* ── Section 4: Preferences ───────────────────────────────── */}
        <CollapsibleSection
          title="Preferences"
          subtitle="Your lifestyle choices"
          icon={Heart}
          isOpen={preferencesOpen}
          onToggle={() => setPreferencesOpen(!preferencesOpen)}
          delay={300}
        >
          {/* Diet */}
          <Text className="text-text-secondary text-xs font-kanit uppercase tracking-wider mb-3 mt-2">
            Diet Preference
          </Text>
          <View className="flex-row flex-wrap mb-5">
            {DIETS.map((d) => (
              <Chip
                key={d.value}
                label={d.label}
                emoji={d.emoji}
                selected={diet === d.value}
                onPress={() => setDiet(d.value)}
              />
            ))}
          </View>

          {/* Fitness Goal */}
          <Text className="text-text-secondary text-xs font-kanit uppercase tracking-wider mb-3">
            Fitness Goal
          </Text>
          <View className="flex-row flex-wrap mb-5">
            {GOALS.map((g) => (
              <Chip
                key={g.value}
                label={g.label}
                emoji={g.emoji}
                selected={goal === g.value}
                onPress={() => setGoal(g.value)}
              />
            ))}
          </View>

          {/* Activity Level */}
          <Text className="text-text-secondary text-xs font-kanit uppercase tracking-wider mb-3">
            Activity Level
          </Text>
          <View className="flex-col gap-2">
            {ACTIVITY_LEVELS.map((a) => (
              <TouchableOpacity
                key={a.value}
                onPress={() => setActivity(a.value)}
                activeOpacity={0.75}
                className={`flex-row items-center justify-between px-4 py-3 rounded-2xl border ${
                  activity === a.value
                    ? 'border-primary bg-primary/10'
                    : 'border-white/5 bg-white/5'
                }`}
              >
                <View>
                  <Text
                    className={`font-kanit font-bold text-sm ${
                      activity === a.value ? 'text-primary' : 'text-white/70'
                    }`}
                  >
                    {a.label}
                  </Text>
                  <Text className="text-white/40 text-xs font-kanit">{a.desc}</Text>
                </View>
                {activity === a.value && (
                  <View className="w-5 h-5 rounded-full bg-primary items-center justify-center">
                    <Text className="text-black text-xs font-bold">✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </CollapsibleSection>

        {/* Error */}
        {error ? (
          <Animated.View entering={FadeInUp} className="bg-red-500/10 rounded-2xl px-4 py-3 mb-4 mt-2">
            <Text className="text-red-400 font-kanit text-sm text-center">{error}</Text>
          </Animated.View>
        ) : null}

        {/* Actions */}
        <Animated.View entering={FadeInUp.delay(350)} className="mt-6 mb-4">
          <Button
            title="Complete Setup"
            onPress={handleComplete}
            loading={isSaving}
            disabled={!isFormValid || isSaving}
            className={(!isFormValid && !isSaving) ? 'opacity-50' : ''}
          />
        </Animated.View>
      </ScrollView>
    </ScreenWrapper>
  );
}
