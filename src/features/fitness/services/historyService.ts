import { firestore } from "@/lib/firebase";
import { Attendance, MemberWorkoutAssignment } from "@/interfaces/member";
import { parseAttendanceTimestamp } from "@/utils/attendanceUtils";
import { COLLECTIONS } from "@/constants/collection";
import { BRANCH_CONFIG } from "@/constants/config";

const getBranchedCollectionRef = (
  tenantId: string,
  branchId: string = BRANCH_CONFIG.DEFAULT_BRANCH_ID,
  collectionName: string,
) =>
  firestore()
    .collection(COLLECTIONS.TENANTS)
    .doc(tenantId)
    .collection(COLLECTIONS.BRANCHES)
    .doc(branchId)
    .collection(collectionName);

/**
 * Get attendance records for a member
 */
export const getMemberAttendance = async (
  tenantId: string,
  memberId: string,
  startDate?: Date,
  endDate?: Date,
  limit: number = 50,
  branchId: string = BRANCH_CONFIG.DEFAULT_BRANCH_ID,
): Promise<Attendance[]> => {
  try {
    const attendanceRef = getBranchedCollectionRef(tenantId, branchId, COLLECTIONS.ATTENDANCE);

    // Fetch records using both legacy memberId and new actorId
    const [legacySnapshot, newSnapshot] = await Promise.all([
      attendanceRef
        .where("memberId", "==", memberId)
        .limit(limit * 2)
        .get(),
      attendanceRef
        .where("actorId", "==", memberId)
        .limit(limit * 2)
        .get(),
    ]).catch(async () => {
      // Fallback if index missing
      return Promise.all([
        attendanceRef
          .where("memberId", "==", memberId)
          .get()
          .catch(() => ({ docs: [] })),
        attendanceRef
          .where("actorId", "==", memberId)
          .get()
          .catch(() => ({ docs: [] })),
      ]);
    });

    const combinedDocs = [...(legacySnapshot?.docs || []), ...(newSnapshot?.docs || [])];

    // Deduplicate
    const uniqueDocsMap = new Map();
    combinedDocs.forEach((doc) => uniqueDocsMap.set(doc.id, doc));
    const uniqueDocs = Array.from(uniqueDocsMap.values());

    let records = uniqueDocs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Attendance[];

    // Sort manually
    records.sort((a, b) => {
      const dateA = parseAttendanceTimestamp(a.punchedAt || a.timestamp);
      const dateB = parseAttendanceTimestamp(b.punchedAt || b.timestamp);
      return dateB.getTime() - dateA.getTime();
    });

    // Filter by date range
    if (startDate || endDate) {
      records = records.filter((record) => {
        const recordDate = parseAttendanceTimestamp(record.punchedAt || record.timestamp);
        if (startDate && recordDate < startDate) return false;
        if (endDate && recordDate > endDate) return false;
        return true;
      });
    }

    return records.slice(0, limit);
  } catch (error) {
    console.error("Error fetching member attendance:", error);
    throw new Error("Failed to fetch attendance records");
  }
};

/**
 * Get workout assignments for a member
 */
export const getWorkoutHistory = async (
  tenantId: string,
  memberId: string,
  branchId: string = BRANCH_CONFIG.DEFAULT_BRANCH_ID,
): Promise<MemberWorkoutAssignment[]> => {
  try {
    const assignmentsRef = getBranchedCollectionRef(
      tenantId,
      branchId,
      COLLECTIONS.WORKOUT_ASSIGNMENTS,
    );

    const querySnapshot = await assignmentsRef
      .where("memberId", "==", memberId)
      .orderBy("assignedAt", "desc")
      .limit(50)
      .get();

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MemberWorkoutAssignment[];
  } catch (error) {
    console.error("Error fetching workout history:", error);
    // Return empty array instead of throwing to avoid UI crashes
    return [];
  }
};
