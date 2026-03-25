import { 
  getFirestore, 
  collection, 
  doc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  FirebaseFirestoreTypes
} from "@react-native-firebase/firestore";
import { Subscription, Payment } from "@/interfaces/member";
import { COLLECTIONS } from "@/constants/collection";

const getBranchedCollectionRef = (
  tenantId: string,
  branchId: string = "main",
  collectionName: string,
) => {
  const db = getFirestore();
  return collection(
    db,
    COLLECTIONS.TENANTS,
    tenantId,
    COLLECTIONS.BRANCHES,
    branchId,
    collectionName
  );
};

/**
 * Get all subscriptions for a member
 */
export const getMemberSubscriptions = async (
  tenantId: string,
  memberId: string,
  branchId: string = "main",
): Promise<Subscription[]> => {
  try {
    const colRef = getBranchedCollectionRef(
      tenantId,
      branchId,
      COLLECTIONS.SUBSCRIPTIONS,
    );

    const q = query(
      colRef,
      where("memberId", "==", memberId),
      orderBy("startDate", "desc")
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Subscription[];
  } catch (error) {
    console.error("Error fetching member subscriptions:", error);
    throw new Error("Failed to fetch subscription information");
  }
};

/**
 * Get active subscription for a member
 */
export const getActiveSubscription = async (
  tenantId: string,
  memberId: string,
  branchId: string = "main",
): Promise<Subscription | null> => {
  try {
    const colRef = getBranchedCollectionRef(
      tenantId,
      branchId,
      COLLECTIONS.SUBSCRIPTIONS,
    );

    const q = query(
      colRef,
      where("memberId", "==", memberId),
      where("status", "==", "active"),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const subDoc = querySnapshot.docs[0];
      return { id: subDoc.id, ...subDoc.data() } as Subscription;
    }
    return null;
  } catch (error) {
    console.error("Error fetching active subscription:", error);
    throw new Error("Failed to fetch subscription information");
  }
};

/**
 * Get payment history for a member
 */
export const getMemberPayments = async (
  tenantId: string,
  memberId: string,
  limitCount: number = 50,
  branchId: string = "main",
): Promise<Payment[]> => {
  try {
    const colRef = getBranchedCollectionRef(tenantId, branchId, COLLECTIONS.PAYMENTS);

    const q = query(
      colRef,
      where("memberId", "==", memberId),
      orderBy("paymentDate", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Payment[];
  } catch (error) {
    console.error("Error fetching member payments:", error);
    throw new Error("Failed to fetch payment history");
  }
};
