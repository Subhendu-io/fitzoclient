import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { firestore } from "@/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  getDocs,
  writeBatch,
  serverTimestamp,
} from "@react-native-firebase/firestore";
import { COLLECTIONS } from "@/constants/collection";
import { APP_CONFIG } from "@/constants/config";
import Constants from "expo-constants";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const db = firestore();

export async function registerForPushNotificationsAsync(uid: string) {
  const { status } = await Notifications.requestPermissionsAsync();

  if (status !== "granted") {
    console.warn("Failed to get push token for push notification!");
    return;
  }

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ||
    Constants?.easConfig?.projectId ||
    APP_CONFIG.EXPO_PROJECT_ID;

  if (!projectId) {
    console.warn("Skipping Expo push token registration because no EAS projectId is configured.");
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

  // Update token in Firebase
  await setDoc(doc(db, COLLECTIONS.APPUSERS, uid), {
    fcmToken: token,
    updatedAt: serverTimestamp(),
  }, { merge: true });

  return token;
}

export function subscribeToNotifications(
  uid: string,
  onUpdate: (notifications: any[]) => void,
  onError?: (error: Error) => void,
) {
  const notificationsRef = collection(db, COLLECTIONS.APPUSERS, uid, COLLECTIONS.NOTIFICATIONS);
  const q = query(notificationsRef, orderBy("timestamp", "desc"));
  
  return onSnapshot(
    q,
    (snapshot) => {
      const notifications = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      }));
      onUpdate(notifications);
    },
    (err) => {
      console.error("Error fetching notifications:", err);
      if (onError) onError(err);
    },
  );
}

export async function markNotificationAsRead(uid: string, notificationId: string) {
  await updateDoc(doc(db, COLLECTIONS.APPUSERS, uid, COLLECTIONS.NOTIFICATIONS, notificationId), {
    read: true,
  });
}

export async function markAllNotificationsAsRead(uid: string) {
  const batch = writeBatch(db);
  const notificationsRef = collection(db, COLLECTIONS.APPUSERS, uid, COLLECTIONS.NOTIFICATIONS);
  const q = query(notificationsRef, where("read", "==", false));
  const notifications = await getDocs(q);

  notifications.forEach((doc: any) => {
    batch.update(doc.ref, { read: true });
  });

  await batch.commit();
}

export async function deleteNotification(uid: string, notificationId: string) {
  await deleteDoc(doc(db, COLLECTIONS.APPUSERS, uid, COLLECTIONS.NOTIFICATIONS, notificationId));
}
