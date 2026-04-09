import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
} from "@react-native-firebase/firestore";
import { getAuth, getFirestore, getStorage } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collection";
import { UserHealth, FitnessTrackingEntry, DietTrackingEntry } from "@/interfaces/member";

const db = getFirestore();

/**
 * Gets the base path to the user's appusers document.
 */
const getUserDocRef = () => {
  const authUid = getAuth().currentUser?.uid;
  if (!authUid) throw new Error("User must be logged in to access health data.");
  return doc(db, COLLECTIONS.APPUSERS, authUid);
};

// --- User Health Profile ---

/**
 * Get the user's core health profile (height, weight, body measurements, etc.)
 */
export const getUserHealth = async (): Promise<UserHealth | null> => {
  try {
    const healthRef = doc(getUserDocRef(), COLLECTIONS.USER_HEALTH, "current");
    const snapshot = await getDoc(healthRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...(snapshot.data() || {}) } as UserHealth;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user health details:", error);
    return null;
  }
};

/**
 * Save or update the user's core health profile.
 */
export const saveUserHealth = async (data: Partial<UserHealth>): Promise<void> => {
  try {
    const healthRef = doc(getUserDocRef(), COLLECTIONS.USER_HEALTH, "current");
    await setDoc(
      healthRef,
      {
        ...data,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error saving user health details:", error);
    throw error;
  }
};

// --- Fitness Tracking ---

/**
 * Save a daily fitness tracking outcome (e.g. AI-generated fitness score).
 * Normally called after parsing attendance patterns or receiving AI assessment.
 */
export const saveFitnessTracking = async (
  data: Omit<FitnessTrackingEntry, "id" | "createdAt">
): Promise<void> => {
  try {
    const fitnessColRef = collection(getUserDocRef(), COLLECTIONS.FITNESS, COLLECTIONS.TRACKING);
    // You could also use doc(fitnessColRef, data.date) if you want 1 doc per date.
    // For now, appending it to the subcollection so history is preserved.
    await addDoc(fitnessColRef, {
      ...data,
      createdAt: Date.now(),
    });
  } catch (error) {
    console.error("Error saving fitness tracking entry:", error);
    throw error;
  }
};

// --- Diet Tracking ---

/**
 * Save a diet analysis (food assessment) to the timeline.
 */
export const saveDietTracking = async (
  data: Omit<DietTrackingEntry, "id" | "createdAt">
): Promise<void> => {
  try {
    const dietColRef = collection(getUserDocRef(), COLLECTIONS.DIET, COLLECTIONS.TRACKING);
    await addDoc(dietColRef, {
      ...data,
      createdAt: Date.now(),
    });
  } catch (error) {
    console.error("Error saving diet tracking entry:", error);
    throw error;
  }
};

/**
 * Upload an image (diet or fitness) to Firebase storage.
 * Stores in `users/{userId}/{folder}/{timestamp}.jpg`
 */
export const uploadHealthImage = async (
  localUri: string,
  folder: "fitnessTracking" | "dietTracking"
): Promise<string> => {
  const authUid = getAuth().currentUser?.uid;
  if (!authUid) throw new Error("User must be logged in.");

  const filename = `${Date.now()}.jpg`;
  const storagePath = `users/${authUid}/${folder}/${filename}`;
  const reference = getStorage().ref(storagePath);

  try {
    await reference.putFile(localUri);
    return await reference.getDownloadURL();
  } catch (error) {
    console.error("Error uploading health image:", error);
    throw error;
  }
};
