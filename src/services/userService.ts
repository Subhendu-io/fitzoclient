import { 
  getFirestore, 
  doc, 
  getDoc, 
  updateDoc 
} from "@react-native-firebase/firestore";
import { AppUser } from "../interfaces/member";
import { COLLECTIONS } from "@/constants/collection";

export const getAppUser = async (uid: string): Promise<AppUser | null> => {
  const userDoc = await getDoc(doc(getFirestore(), COLLECTIONS.APPUSERS, uid));
  if (userDoc.exists()) {
    return userDoc.data() as AppUser;
  }
  return null;
};

export const updateAppUser = async (uid: string, data: Partial<AppUser>): Promise<void> => {
  await updateDoc(doc(getFirestore(), COLLECTIONS.APPUSERS, uid), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};
