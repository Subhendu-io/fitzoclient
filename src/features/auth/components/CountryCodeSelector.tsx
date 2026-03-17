import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, SafeAreaView } from 'react-native';
import { ChevronDown, Search, X } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { useThemeColors } from '@/hooks/useThemeColors';

export const countries = [
  { name: 'India', code: '+91', flag: '🇮🇳' },
  { name: 'United States', code: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
  { name: 'United Arab Emirates', code: '+971', flag: '🇦🇪' },
  { name: 'Singapore', code: '+65', flag: '🇸🇬' },
  { name: 'Australia', code: '+61', flag: '🇦🇺' },
  { name: 'Canada', code: '+1', flag: '🇨🇦' },
  { name: 'Germany', code: '+49', flag: '🇩🇪' },
  { name: 'France', code: '+33', flag: '🇫🇷' },
  { name: 'Saudi Arabia', code: '+966', flag: '🇸🇦' },
  { name: 'Qatar', code: '+974', flag: '🇶🇦' },
];

interface CountryCodeSelectorProps {
  selectedCountry: typeof countries[0];
  onSelect: (country: typeof countries[0]) => void;
  isEmbedded?: boolean;
}

export function CountryCodeSelector({ selectedCountry, onSelect, isEmbedded }: CountryCodeSelectorProps) {
  const colors = useThemeColors();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.code.includes(searchQuery)
  );

  return (
    <>
      <TouchableOpacity 
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
        className={`flex-row items-center ${isEmbedded ? '' : 'bg-card rounded-2xl border border-stone-200/10 dark:border-stone-900/10 px-4 h-[58px]'}`}
      >
        <Text className="text-xl mr-2">{selectedCountry.flag}</Text>
        <Text className="text-text font-kanit font-bold mr-1">{selectedCountry.code}</Text>
        <ChevronDown {...({ size: 16, stroke: colors.muted } as any)} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/80 justify-end">
          <SafeAreaView className="bg-card rounded-t-[40px] h-[70%]">
            <View className="p-6">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-text text-xl font-black font-kanit">Select Country</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X {...({ size: 24, stroke: colors.text } as any)} />
                </TouchableOpacity>
              </View>

              <Input 
                placeholder="Search country or code..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                icon={Search as any}
              />
            </View>

            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.name}
              contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  onPress={() => {
                    onSelect(item);
                    setModalVisible(false);
                    setSearchQuery('');
                  }}
                  className="flex-row items-center py-4 border-b border-stone-200/5 dark:border-stone-900/5"
                >
                  <Text className="text-2xl mr-4">{item.flag}</Text>
                  <Text className="text-text text-base font-kanit flex-1">{item.name}</Text>
                  <Text className="text-primary font-bold font-kanit">{item.code}</Text>
                </TouchableOpacity>
              )}
            />
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}
