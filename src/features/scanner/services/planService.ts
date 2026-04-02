import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import { Plan } from "@/interfaces/member";
import { COLLECTIONS } from "@/constants/collection";

/**
 * Fetch all active plans for a branch.
 * Path: tenants/{tenantId}/branches/{branchId}/plans
 */
export const getBranchPlans = async (
  tenantId: string,
  branchId: string = "main",
): Promise<Plan[]> => {
  try {
    const db = getFirestore();
    const plansRef = collection(
      db,
      COLLECTIONS.TENANTS,
      tenantId,
      COLLECTIONS.BRANCHES,
      branchId,
      COLLECTIONS.PLANS,
    );

    const q = query(plansRef, where("isActive", "==", true));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(
      (docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }),
    ) as Plan[];
  } catch (error) {
    console.error("Error fetching branch plans:", error);
    throw new Error("Failed to fetch available plans");
  }
};
