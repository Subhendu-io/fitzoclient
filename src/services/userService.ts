import { firestore } from "../lib/firebase";
import { AppUser } from "../interfaces/member";
import { COLLECTIONS } from "@/constants/collection";

export const getAppUser = async (uid: string): Promise<AppUser | null> => {
  const doc = await firestore().collection(COLLECTIONS.APPUSERS).doc(uid).get();
  if (doc.exists()) {
    return doc.data() as AppUser;
  }
  return null;
};

export const updateAppUser = async (uid: string, data: Partial<AppUser>): Promise<void> => {
  await firestore()
    .collection(COLLECTIONS.APPUSERS)
    .doc(uid)
    .update({
      ...data,
      updatedAt: new Date().toISOString(),
    });
};
