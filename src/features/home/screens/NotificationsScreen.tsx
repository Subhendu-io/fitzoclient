import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Header } from '@/components/layout/Header';
import { Skeleton } from '@/components/ui/Skeleton';
import { Bell, BellOff, X, CheckCircle2 } from 'lucide-react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { subscribeToNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from '../services/notificationService';
import type { Notification } from '@/interfaces/member';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useToaster } from '@/providers/useToaster';

export function NotificationsScreen() {
  const { showToast } = useToaster();
  const colors = useThemeColors();
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToNotifications(
      user.uid,
      (list) => {
        setNotifications(list);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsubscribe();
  }, [user]);

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await markAllNotificationsAsRead(user.uid);
    } catch (error) {
      showToast({ title: 'Error', message: 'Failed to mark all as read', variant: 'danger' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await deleteNotification(user.uid, id);
    } catch (error) {
      showToast({ title: 'Error', message: 'Failed to delete notification', variant: 'danger' });
    }
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <Animated.View 
      entering={FadeIn} 
      exiting={FadeOut}
      layout={Layout}
      className={`mb-3 p-4 rounded-2xl bg-card border ${
        item.read ? 'border-stone-200/5 dark:border-stone-900/5' : 'border-primary/20'
      }`}
    >
      <TouchableOpacity 
        onPress={() => !item.read && user && markNotificationAsRead(user.uid, item.id)}
        className="flex-row items-start"
      >
        <View className={`w-10 h-10 rounded-full items-center justify-center ${
          item.read ? 'bg-background' : 'bg-primary/20'
        }`}>
          <Bell {...({ size: 18, color: item.read ? '#666' : colors.primary } as any)} />
          {!item.read && <View className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />}
        </View>
        
        <View className="flex-1 ml-4">
          <View className="flex-row justify-between items-start">
            <Text className={`text-base font-bold font-kanit ${item.read ? 'text-text-secondary' : 'text-text'}`}>
              {item.title}
            </Text>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <X {...({ size: 16, color: colors.muted } as any)} />
            </TouchableOpacity>
          </View>
          <Text className={`text-sm mt-1 font-kanit ${item.read ? 'text-text-secondary' : 'text-text'}`}>
            {item.body}
          </Text>
          <Text className="text-[10px] mt-2 text-text-secondary">
            {new Date(item.timestamp).toLocaleString()}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <ScreenWrapper className="bg-background">
      <Header 
        title="Notifications" 
        showBackButton 
        rightElement={
          notifications.some(n => !n.read) && (
            <TouchableOpacity onPress={handleMarkAllRead}>
              <CheckCircle2 {...({ size: 20, color: colors.primary } as any)} />
            </TouchableOpacity>
          )
        }
      />

      {loading ? (
        <View className="flex-1 px-5 pt-5">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} width="100%" height={100} borderRadius={24} className="mb-4" />
          ))}
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10 }}
          ListEmptyComponent={
            <View className="items-center py-20">
              <BellOff {...({ size: 48, color: colors.primary } as any)} />
              <Text className="text-xl font-bold font-kanit mt-4 text-center text-text">
                No Notifications
              </Text>
              <Text className="text-text-secondary font-kanit mt-2 text-center">
                You're all caught up!
              </Text>
            </View>
          }
        />
      )}
    </ScreenWrapper>
  );
}
