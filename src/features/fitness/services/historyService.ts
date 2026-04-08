import { 
  getFirestore, 
  collection, 
  doc, 
  query, 
  where, 
  limit, 
  getDocs, 
  orderBy 
} from "@react-native-firebase/firestore";
import { Attendance, MemberWorkoutAssignment } from "@/interfaces/member";
import { parseAttendanceTimestamp } from "@/utils/attendanceUtils";
import { COLLECTIONS } from "@/constants/collection";
import { BRANCH_CONFIG } from "@/constants/config";

const getBranchedCollectionRef = (
  tenantId: string,
  branchId: string = BRANCH_CONFIG.DEFAULT_BRANCH_ID,
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
 * Get attendance records for a member
 */
export const getMemberAttendance = async (
  tenantId: string,
  memberId: string,
  startDate?: Date,
  endDate?: Date,
  limitCount: number = 50,
  branchId: string = BRANCH_CONFIG.DEFAULT_BRANCH_ID,
): Promise<Attendance[]> => {
  try {
    const attendanceRef = getBranchedCollectionRef(tenantId, branchId, COLLECTIONS.ATTENDANCE);

    // Fetch records using both legacy memberId and new actorId
    const [legacySnapshot, newSnapshot] = await Promise.all([
      getDocs(query(attendanceRef, where("memberId", "==", memberId), limit(limitCount * 2))),
      getDocs(query(attendanceRef, where("actorId", "==", memberId), limit(limitCount * 2))),
    ]).catch(async () => {
      // Fallback if index missing
      return Promise.all([
        getDocs(query(attendanceRef, where("memberId", "==", memberId))),
        getDocs(query(attendanceRef, where("actorId", "==", memberId))),
      ]);
    });

    const combinedDocs = [...(legacySnapshot?.docs || []), ...(newSnapshot?.docs || [])];

    // Deduplicate
    const uniqueDocsMap = new Map();
    combinedDocs.forEach((docSnap) => uniqueDocsMap.set(docSnap.id, docSnap));
    const uniqueDocs = Array.from(uniqueDocsMap.values());

    let records = uniqueDocs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
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

    return records.slice(0, limitCount);
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

    const q = query(
      assignmentsRef,
      where("memberId", "==", memberId),
      orderBy("assignedAt", "desc"),
      limit(50)
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((docSnap: any) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as MemberWorkoutAssignment[];
  } catch (error) {
    console.error("Error fetching workout history:", error);
    // Return empty array instead of throwing to avoid UI crashes
    return [];
  }
};
