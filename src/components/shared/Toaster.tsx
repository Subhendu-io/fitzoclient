import React from 'react';
import { View, Text, Platform } from 'react-native';
import Animated, { FadeInUp, FadeOutUp, Layout } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToaster } from '../../providers/useToaster';
import { useThemeColors } from '../../hooks/useThemeColors';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react-native';

export default function Toaster() {
  const { toast } = useToaster();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  if (!toast) return null;

  const { title, message, variant = 'default', visible, className = '' } = toast;

  const getVariantIcon = () => {
    switch (variant) {
      case 'success':
        return <CheckCircle size={24} color={colors.success} />;
      case 'danger':
        return <XCircle size={24} color={colors.error} />;
      case 'warn':
        return <AlertCircle size={24} color={colors.warning} />;
      case 'info':
        return <Info size={24} color={colors.primary} />;
      default:
        return null;
    }
  };

  return (
    <View 
      className="absolute left-0 right-0 z-[9999] px-4 items-center"
      style={{ top: Platform.OS === 'ios' ? insets.top + 10 : insets.top + 30 }}
      pointerEvents="none"
    >
      {visible && (
        <Animated.View
          entering={FadeInUp.duration(400).springify().damping(14)}
          exiting={FadeOutUp.duration(300)}
          layout={Layout.springify()}
          style={{ 
            backgroundColor: colors.card,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 8,
            borderColor: colors.border
          }}
          className={`w-full max-w-[400px] rounded-2xl p-4 flex-row items-center gap-3 border ${className}`}
        >
          {getVariantIcon()}
          
          <View className="flex-1 justify-center">
            {title && (
              <Text style={{ color: colors.text }} className="font-bold text-[16px] mb-0.5">
                {title}
              </Text>
            )}
            <Text style={{ color: title ? colors.textSecondary : colors.text }} className="text-[14px]">
              {message}
            </Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}
