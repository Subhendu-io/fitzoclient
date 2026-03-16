import { firestore } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  limit,
  addDoc,
  orderBy,
  FieldValue,
  serverTimestamp,
} from "@react-native-firebase/firestore";
import {
  Member,
  Tenant,
  Attendance,
  AttendanceStats,
  CrowdForecast,
  AttendanceStreakBoardEntry,
  MemberSessionRedemption,
  Subscription,
  Payment,
  MemberWorkoutAssignment,
  MemberSessionPlanItem,
  MemberRedemptionHistoryItem,
} from "@/interfaces/member";
import { COLLECTIONS } from "@/constants/collection";
import { BRANCH_CONFIG } from "@/constants/config";

const db = firestore();

const isPermissionDeniedError = (error: unknown): boolean => {
  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message?: unknown }).message ?? "")
      : "";

  return message.includes("permission-denied");
};

const resolveBranchId = (branchId?: string): string =>
  branchId && branchId.trim().length > 0 ? branchId : BRANCH_CONFIG.DEFAULT_BRANCH_ID;

const getTenantDocRef = (tenantId: string) =>
  doc(db, COLLECTIONS.TENANTS, tenantId);

const getBranchedCollectionRef = (
  tenantId: string,
  branchId: string | undefined,
  collectionName: string,
) =>
  collection(
    doc(db, COLLECTIONS.TENANTS, tenantId, COLLECTIONS.BRANCHES, resolveBranchId(branchId)),
    collectionName
  );

/**
 * Get tenant/gym information
 */
export const getTenantInfo = async (tenantId: string): Promise<Tenant | null> => {
  try {
    const tenantDoc = await getDoc(getTenantDocRef(tenantId));
    if (tenantDoc.exists()) {
      return { id: tenantDoc.id, ...tenantDoc.data() } as Tenant;
    }
    return null;
  } catch (error) {
    console.error("Error fetching tenant info:", error);
    throw error;
  }
};

/**
 * Get member record by Firebase Auth UID
 */
export const getMemberByUid = async (
  tenantId: string,
  uid: string,
  branchId?: string,
): Promise<Member | null> => {
  try {
    const resolvedBranchId = resolveBranchId(branchId);
    const colRef = getBranchedCollectionRef(
      tenantId,
      resolvedBranchId,
      COLLECTIONS.MEMBERS,
    );
    const q = query(colRef, where("uid", "==", uid), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const memberDoc = querySnapshot.docs[0];
      return { id: memberDoc.id, ...memberDoc.data() } as Member;
    }
    return null;
  } catch (error) {
    console.error("Error fetching member by uid:", error);
    throw error;
  }
};

/**
 * Mark attendance for a member
 */
export const markAttendance = async (
  tenantId: string,
  memberId: string,
  branchId?: string,
): Promise<void> => {
  try {
    const resolvedBranchId = resolveBranchId(branchId);
    const colRef = getBranchedCollectionRef(tenantId, resolvedBranchId, COLLECTIONS.ATTENDANCE);

    await addDoc(colRef, {
      memberId,
      actorType: "member",
      actorId: memberId,
      punchedAt: serverTimestamp(),
      source: "QR",
      punchType: "CHECK_IN",
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error marking attendance:", error);
    throw error;
  }
};

/**
 * Get attendance stats for a member
 */
export const getAttendanceStats = async (
  tenantId: string,
  memberId: string,
  branchId?: string,
): Promise<AttendanceStats> => {
  try {
    const attendance = await getMemberAttendance(
      tenantId,
      memberId,
      undefined,
      undefined,
      1000,
      branchId,
    );

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const { parseAttendanceTimestamp } = require("@/utils/attendanceUtils");

    const thisMonth = attendance.filter((r) => {
      const date = parseAttendanceTimestamp(r.punchedAt || r.timestamp);
      return date >= startOfMonth;
    }).length;

    // Calculate streak
    let streak = 0;
    const sortedDates = Array.from(
      new Set(
        attendance.map((r) => {
          const d = parseAttendanceTimestamp(r.punchedAt || r.timestamp);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        }),
      ),
    ).sort((a, b) => b - a);

    if (sortedDates.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      let checkDate =
        sortedDates[0] === today.getTime()
          ? today
          : sortedDates[0] === yesterday.getTime()
            ? yesterday
            : null;

      if (checkDate) {
        for (const dateTs of sortedDates) {
          if (dateTs === checkDate.getTime()) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }

    return {
      totalCount: attendance.length,
      thisMonth,
      streak,
      lastAttendance: attendance[0]?.punchedAt || attendance[0]?.timestamp,
    };
  } catch (error) {
    if (!isPermissionDeniedError(error)) {
      console.error("Error calculating attendance stats:", error);
    }
    return { totalCount: 0, thisMonth: 0, streak: 0 };
  }
};

/**
 * Get attendance streak leaderboard
 */
export const getAttendanceStreakBoard = async (
  tenantId: string,
  currentMemberId?: string,
  limit: number = 5,
  branchId?: string,
): Promise<AttendanceStreakBoardEntry[]> => {
  const stats = await getAttendanceStats(tenantId, currentMemberId || "", branchId);
  return [
    {
      rank: 1,
      memberId: currentMemberId || "me",
      memberName: "You",
      streak: stats.streak,
      totalCheckIns: stats.totalCount,
      isCurrentUser: true,
    },
  ];
};

/**
 * Get latest member session redemption
 */
export const getLatestMemberSessionRedemption = async (
  tenantId: string,
  memberId: string,
  branchId?: string,
): Promise<MemberSessionRedemption | null> => {
  try {
    const sessionsRef = getBranchedCollectionRef(tenantId, branchId, COLLECTIONS.MEMBER_SESSIONS);
    const q = query(sessionsRef, where("memberId", "==", memberId), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const sessionDoc = snapshot.docs[0];
    const redemptionsRef = collection(sessionDoc.ref, COLLECTIONS.MEMBER_SESSION_REDEMPTIONS);
    const qRed = query(redemptionsRef, orderBy("redeemedAt", "desc"), limit(1));
    const redemptionsSnapshot = await getDocs(qRed);

    if (redemptionsSnapshot.empty) {
      const data = sessionDoc.data();
      return {
        id: sessionDoc.id,
        memberId,
        trainerName: "—",
        redeemedSessions: data.redeemedSessions || 0,
        validTill: "",
        receiptNumber: "—",
        totalSessions: data.totalSessions,
        status: data.status,
      } as MemberSessionRedemption;
    }

    const red = redemptionsSnapshot.docs[0].data();
    const sess = sessionDoc.data();
    return {
      id: redemptionsSnapshot.docs[0].id,
      memberId,
      trainerName: red.trainerName || "—",
      redeemedSessions: sess.redeemedSessions || 0,
      validTill: red.validUntil || "",
      receiptNumber: redemptionsSnapshot.docs[0].id,
      totalSessions: sess.totalSessions,
      redeemedAt: red.redeemedAt,
      status: sess.status,
    } as MemberSessionRedemption;
  } catch (error) {
    if (isPermissionDeniedError(error)) {
      return null;
    }
    console.error("Error fetching latest redemption:", error);
    return null;
  }
};

/**
 * Get all session plans for a member
 */
export const getMemberSessionPlans = async (
  tenantId: string,
  memberId: string,
  branchId?: string,
): Promise<MemberSessionPlanItem[]> => {
  try {
    const sessionsRef = getBranchedCollectionRef(tenantId, branchId, COLLECTIONS.MEMBER_SESSIONS);
    const q = query(sessionsRef, where("memberId", "==", memberId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        planName: data.planName || data.title || "Session Plan",
        totalSessions: data.totalSessions || 0,
        redeemedSessions: data.redeemedSessions || 0,
        leftClasses: Math.max(0, (data.totalSessions || 0) - (data.redeemedSessions || 0)),
        status: data.status || "active",
      } as MemberSessionPlanItem;
    });
  } catch (error) {
    console.error("Error fetching member session plans:", error);
    return [];
  }
};

/**
 * Get redemption history for a member
 */
export const getMemberRedemptionHistory = async (
  tenantId: string,
  memberId: string,
  currentLimit: number = 20,
  branchId?: string,
): Promise<MemberRedemptionHistoryItem[]> => {
  try {
    const sessionsRef = getBranchedCollectionRef(tenantId, branchId, COLLECTIONS.MEMBER_SESSIONS);
    const q = query(sessionsRef, where("memberId", "==", memberId));
    const sessionSnapshot = await getDocs(q);

    const allRedemptions: MemberRedemptionHistoryItem[] = [];

    await Promise.all(
      sessionSnapshot.docs.map(async (sessionDoc: any) => {
        const redemptionsRef = collection(sessionDoc.ref, COLLECTIONS.MEMBER_SESSION_REDEMPTIONS);
        const qRed = query(redemptionsRef, orderBy("redeemedAt", "desc"), limit(currentLimit));
        const redSnapshot = await getDocs(qRed);

        redSnapshot.docs.forEach((redDoc: any) => {
          const data = redDoc.data();
          allRedemptions.push({
            id: redDoc.id,
            trainerName: data.trainerName || "—",
            redeemedAt: data.redeemedAt,
            validUntil: data.validUntil || "",
            receiptNumber: redDoc.id,
          });
        });
      }),
    );

    return allRedemptions
      .sort((a, b) => new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime())
      .slice(0, currentLimit);
  } catch (error) {
    console.error("Error fetching redemption history:", error);
    return [];
  }
};

/**
 * Get crowd forecast for a branch
 */
export const getCrowdForecast = async (
  tenantId: string,
  branchId?: string,
): Promise<CrowdForecast | null> => {
  try {
    const resolvedBranchId = resolveBranchId(branchId);
    const forecastDocRef = doc(db, COLLECTIONS.TENANTS, tenantId, COLLECTIONS.BRANCHES, resolvedBranchId, COLLECTIONS.CROWD_FORECASTS, "current");
    const forecastDoc = await getDoc(forecastDocRef);

    if (forecastDoc.exists()) {
      return forecastDoc.data() as CrowdForecast;
    }
    return null;
  } catch (error) {
    if (isPermissionDeniedError(error)) {
      return null;
    }
    console.error("Error fetching crowd forecast:", error);
    return null;
  }
};

/**
 * Get subscription information for a member
 */
export const getMemberSubscriptions = async (
  tenantId: string,
  memberId: string,
  branchId?: string,
): Promise<Subscription[]> => {
  try {
    const subscriptionsRef = getBranchedCollectionRef(
      tenantId,
      branchId,
      COLLECTIONS.SUBSCRIPTIONS,
    );
    const q = query(subscriptionsRef, where("memberId", "==", memberId), orderBy("startDate", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as Subscription[];
  } catch (error) {
    console.error("Error fetching member subscriptions:", error);
    return [];
  }
};

/**
 * Get the currently active subscription
 */
export const getActiveSubscription = async (
  tenantId: string,
  memberId: string,
  branchId?: string,
): Promise<Subscription | null> => {
  try {
    const subscriptions = await getMemberSubscriptions(tenantId, memberId, branchId);
    return subscriptions.find((s) => s.status === "active") || null;
  } catch (error) {
    return null;
  }
};

/**
 * Get payment history for a member
 */
export const getMemberPayments = async (
  tenantId: string,
  memberId: string,
  currentLimit: number = 50,
  branchId?: string,
): Promise<Payment[]> => {
  try {
    const paymentsRef = getBranchedCollectionRef(tenantId, branchId, COLLECTIONS.PAYMENTS);
    const q = query(paymentsRef, where("memberId", "==", memberId), orderBy("paymentDate", "desc"), limit(currentLimit));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as Payment[];
  } catch (error) {
    console.error("Error fetching member payments:", error);
    return [];
  }
};

/**
 * Get attendance records for a member
 */
export const getMemberAttendance = async (
  tenantId: string,
  memberId: string,
  startDate?: Date,
  endDate?: Date,
  currentLimit: number = 50,
  branchId?: string,
): Promise<Attendance[]> => {
  try {
    const attendanceRef = getBranchedCollectionRef(tenantId, branchId, COLLECTIONS.ATTENDANCE);

    // Fetch records
    const qLegacy = query(attendanceRef, where("memberId", "==", memberId), limit(currentLimit));
    const qNew = query(attendanceRef, where("actorId", "==", memberId), limit(currentLimit));

    const [legacySnapshot, newSnapshot] = await Promise.all([
      getDocs(qLegacy),
      getDocs(qNew),
    ]);

    const combinedDocs = [...legacySnapshot.docs, ...newSnapshot.docs];
    const uniqueDocsMap = new Map();
    combinedDocs.forEach((doc) => uniqueDocsMap.set(doc.id, doc));

    const { parseAttendanceTimestamp } = require("@/utils/attendanceUtils");

    let records = Array.from(uniqueDocsMap.values()).map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Attendance[];

    // Filter by date range
    if (startDate || endDate) {
      records = records.filter((record) => {
        const recordDate = parseAttendanceTimestamp(record.punchedAt || record.timestamp);
        if (startDate && recordDate < startDate) return false;
        if (endDate && recordDate > endDate) return false;
        return true;
      });
    }

    // Sort by date
    records.sort((a, b) => {
      const dateA = parseAttendanceTimestamp(a.punchedAt || a.timestamp);
      const dateB = parseAttendanceTimestamp(b.punchedAt || b.timestamp);
      return dateB.getTime() - dateA.getTime();
    });

    return records.slice(0, currentLimit);
  } catch (error) {
    if (isPermissionDeniedError(error)) {
      return [];
    }
    console.error("Error fetching member attendance:", error);
    throw error;
  }
};

/**
 * Get workout assignments for a member
 */
export const getWorkoutAssignments = async (
  tenantId: string,
  memberId: string,
  branchId?: string,
): Promise<MemberWorkoutAssignment[]> => {
  try {
    const assignmentsRef = getBranchedCollectionRef(
      tenantId,
      branchId,
      COLLECTIONS.WORKOUT_ASSIGNMENTS,
    );
    const q = query(assignmentsRef, where("memberId", "==", memberId), orderBy("assignedAt", "desc"), limit(20));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as MemberWorkoutAssignment[];
  } catch (error) {
    if (isPermissionDeniedError(error)) {
      return [];
    }
    console.error("Error fetching workout assignments:", error);
    return [];
  }
};
