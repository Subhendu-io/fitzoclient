import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Header } from '@/components/layout/Header';
import { Send, Users, Info, Bell } from 'lucide-react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { useMemberStore } from '@/store/useMemberStore';
import { subscribeToCommunityMessages, sendCommunityMessage } from '../services/communityChatService';
import type { CommunityMessage } from '@/interfaces/member';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';

export function CommunityChatScreen() {
  const { user, profile } = useAuthStore();
  const { tenantInfo } = useMemberStore();
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const activeGym = profile?.activeGym;
  const activeBranchId = profile?.activeBranchId;
  const communityChatEnabled = tenantInfo?.communityChatEnabled !== false;
  const communityChatMode = tenantInfo?.communityChatMode ?? 'open';
  const canSend = communityChatEnabled && (communityChatMode === 'open');

  useEffect(() => {
    if (!activeGym) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToCommunityMessages(
      activeGym,
      (list) => {
        setMessages(list);
        setLoading(false);
        // Auto scroll to bottom
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      },
      () => setLoading(false),
      activeBranchId
    );

    return () => unsubscribe();
  }, [activeGym, activeBranchId]);

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || !user || !activeGym || !canSend || sending) return;

    setSending(true);
    setInputText('');
    try {
      const senderName = user.displayName || `${profile?.firstName} ${profile?.lastName}` || 'Member';
      await sendCommunityMessage(activeGym, user.uid, senderName, trimmed, activeBranchId);
    } catch (e) {
      console.error('Send failed:', e);
      setInputText(trimmed);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item, index }: { item: CommunityMessage; index: number }) => {
    const isOwn = item.senderId === user?.uid;
    const showName = !isOwn && (index === 0 || messages[index - 1].senderId !== item.senderId);

    return (
      <Animated.View 
        entering={isOwn ? SlideInRight : FadeIn}
        className={`mb-4 flex-row ${isOwn ? 'justify-end' : 'justify-start'}`}
      >
        <View className={`max-w-[80%] px-4 py-3 rounded-2xl ${
          isOwn ? 'bg-primary rounded-tr-none' : 'bg-card border border-white/5 rounded-tl-none'
        }`}>
          {showName && (
            <Text className={`text-xs font-bold mb-1 ${isOwn ? 'text-black/60' : 'text-primary'}`}>
              {item.senderType === 'gym' ? '🏆 Gym' : item.senderName}
            </Text>
          )}
          <Text className={isOwn ? 'text-black font-medium' : 'text-white'}>
            {item.text}
          </Text>
          <Text className={`text-[10px] mt-1 ${isOwn ? 'text-black/40' : 'text-white/40'}`}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <ScreenWrapper className="bg-background">
      <Header 
        title="Community Chat" 
        showBackButton 
        rightElement={
          <TouchableOpacity className="p-2">
            <Bell {...({ size: 20, color: '#C8FF32' } as any)} />
          </TouchableOpacity>
        }
      />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#C8FF32" size="large" />
        </View>
      ) : (
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
          className="flex-1"
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            ListEmptyComponent={
              <View className="items-center py-20">
                <Users {...({ size: 48, color: '#C8FF32', opacity: 0.3 } as any)} />
                <Text className="text-white/40 font-kanit mt-4 text-center px-10">
                  No messages yet. Be the first to start the conversation!
                </Text>
              </View>
            }
          />

          {/* Composer */}
          <View className="p-4 border-t border-white/5 bg-background">
            {(!communityChatEnabled || communityChatMode === 'broadcast') && (
              <View className="mb-3 flex-row items-center bg-white/5 p-3 rounded-xl">
                <Info {...({ size: 16, color: '#C8FF32' } as any)} />
                <Text className="text-white/60 text-xs font-kanit ml-2 flex-1">
                  {communityChatMode === 'broadcast' 
                    ? 'Only the gym can send messages here.' 
                    : 'Chat is currently disabled by the gym.'}
                </Text>
              </View>
            )}
            
            <View className="flex-row items-end space-x-3">
              <View className="flex-1 bg-card rounded-2xl px-4 py-3 border border-white/10">
                <TextInput
                  className="text-white text-base max-h-32"
                  placeholder="Type a message..."
                  placeholderTextColor="#666"
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  editable={canSend}
                />
              </View>
              <TouchableOpacity 
                className={`w-12 h-12 rounded-2xl items-center justify-center ${
                  !canSend || !inputText.trim() || sending ? 'bg-white/5' : 'bg-primary'
                }`}
                onPress={handleSend}
                disabled={!canSend || !inputText.trim() || sending}
              >
                {sending ? (
                  <ActivityIndicator color="black" size="small" />
                ) : (
                  <Send {...({ size: 20, color: !canSend || !inputText.trim() ? '#666' : 'black' } as any)} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </ScreenWrapper>
  );
}
