import { firestore } from "@/lib/firebase";
import { Subscription, Payment } from "@/interfaces/member";
import { COLLECTIONS } from "@/constants/collection";

const getBranchedCollectionRef = (
  tenantId: string,
  branchId: string = "main",
  collectionName: string,
) =>
  firestore()
    .collection(COLLECTIONS.TENANTS)
    .doc(tenantId)
    .collection(COLLECTIONS.BRANCHES)
    .doc(branchId)
    .collection(collectionName);

/**
 * Get all subscriptions for a member
 */
export const getMemberSubscriptions = async (
  tenantId: string,
  memberId: string,
  branchId: string = "main",
): Promise<Subscription[]> => {
  try {
    const subscriptionsRef = getBranchedCollectionRef(
      tenantId,
      branchId,
      COLLECTIONS.SUBSCRIPTIONS,
    );

    const querySnapshot = await subscriptionsRef
      .where("memberId", "==", memberId)
      .orderBy("startDate", "desc")
      .get();

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
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
    const subscriptionsRef = getBranchedCollectionRef(
      tenantId,
      branchId,
      COLLECTIONS.SUBSCRIPTIONS,
    );

    const querySnapshot = await subscriptionsRef
      .where("memberId", "==", memberId)
      .where("status", "==", "active")
      .limit(1)
      .get();

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
  limit: number = 50,
  branchId: string = "main",
): Promise<Payment[]> => {
  try {
    const paymentsRef = getBranchedCollectionRef(tenantId, branchId, COLLECTIONS.PAYMENTS);

    const querySnapshot = await paymentsRef
      .where("memberId", "==", memberId)
      .orderBy("paymentDate", "desc")
      .limit(limit)
      .get();

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Payment[];
  } catch (error) {
    console.error("Error fetching member payments:", error);
    throw new Error("Failed to fetch payment history");
  }
};
