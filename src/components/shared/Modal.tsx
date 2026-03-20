import React from 'react';
import { Modal as RNModal, View, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { useModal } from '../../providers/useModal';
import { useThemeColors } from '../../hooks/useThemeColors';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react-native';

export default function Modal() {
  const { isOpen, options, hideModal } = useModal();
  const colors = useThemeColors();

  // Keep unmounted if completely null to allow closing exit animations to process
  if (!options) return null;

  const {
    title,
    message,
    variant = 'default',
    buttons = [{ text: 'OK', onPress: hideModal }],
    cancelable = true,
    className = '',
    containerClassName = '',
  } = options;

  const handleBackgroundPress = () => {
    if (cancelable) hideModal();
  };

  const getVariantIcon = () => {
    switch (variant) {
      case 'success':
        return <CheckCircle size={40} color={colors.success} />;
      case 'danger':
        return <XCircle size={40} color={colors.error} />;
      case 'warn':
        return <AlertCircle size={40} color={colors.warning} />;
      case 'info':
        return <Info size={40} color={colors.primary} />;
      default:
        return null;
    }
  };

  return (
    <RNModal transparent visible={true} animationType="none" onRequestClose={handleBackgroundPress}>
      <TouchableWithoutFeedback onPress={handleBackgroundPress}>
        <View className={`flex-1 justify-center items-center px-6 ${containerClassName}`}>
          {/* Animated Overlay */}
          {isOpen && (
             <Animated.View 
               entering={FadeIn.duration(200)} 
               exiting={FadeOut.duration(200)} 
               className="absolute inset-0 bg-black/50" 
             />
          )}

          {/* Modal Content Card */}
          {isOpen && (
            <TouchableWithoutFeedback onPress={() => {}}>
              <Animated.View
                entering={ZoomIn.duration(250).springify().damping(16)}
                exiting={ZoomOut.duration(150)}
                style={{ backgroundColor: colors.card, borderColor: colors.border }}
                className={`w-full max-w-sm rounded-[24px] p-6 shadow-2xl border ${className}`}
              >
                {/* Header Sequence */}
                <View className="items-center mb-4">
                  {getVariantIcon()}
                  {title && (
                    <Text 
                      style={{ color: colors.text }} 
                      className={`text-2xl font-bold text-center ${getVariantIcon() ? 'mt-4' : ''}`}
                    >
                      {title}
                    </Text>
                  )}
                </View>

                {/* Message */}
                {message && (
                  <Text style={{ color: colors.textSecondary }} className="text-base text-center mb-8">
                    {message}
                  </Text>
                )}

                {/* Buttons Action Area */}
                <View className={`flex-row justify-end w-full gap-3 ${buttons.length > 2 ? 'flex-col' : ''}`}>
                  {buttons.map((btn, idx) => {
                    const isDestructive = btn.style === 'destructive';
                    const isCancel = btn.style === 'cancel';
                    
                    let bgStyle = { backgroundColor: colors.primary };
                    let textCol = colors.onPrimary || '#000000';
                    
                    if (isDestructive) {
                      bgStyle = { backgroundColor: '#EF4444' };
                      textCol = '#FFFFFF';
                    } else if (isCancel) {
                      bgStyle = { backgroundColor: 'transparent' };
                      textCol = colors.text;
                    } else if (variant === 'success') {
                      bgStyle = { backgroundColor: colors.success };
                      textCol = '#FFFFFF';
                    } else if (variant === 'danger') {
                      bgStyle = { backgroundColor: colors.error };
                      textCol = '#FFFFFF';
                    }

                    return (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => {
                          if (btn.onPress) {
                            btn.onPress();
                          } else {
                            hideModal();
                          }
                        }}
                        style={[bgStyle]}
                        className={`flex-1 overflow-hidden py-3.5 rounded-xl items-center justify-center ${isCancel ? 'border border-gray-300 dark:border-gray-700' : ''} ${btn.className || ''}`}
                      >
                        <Text 
                          style={{ color: textCol }} 
                          className={`font-semibold text-[16px] ${btn.textClassName || ''}`}
                        >
                          {btn.text}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          )}
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
}
