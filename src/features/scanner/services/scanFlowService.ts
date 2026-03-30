import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { AppUser } from '@/interfaces/member';
import { parseDeepLink } from '@/services/deepLinkService';
import { useDeepLinkStore } from '@/store/useDeepLinkStore';
import { checkInvite, acceptInvite, createJoinRequest } from './qrVerifyService';
import { getMemberByUid, getActiveSubscriptionForScan, markAttendance } from '@/services/memberService';
import { BRANCH_CONFIG } from '@/constants/config';

export type ScanFlowResult =
  | { type: 'INVALID_LINK' }
  | { type: 'AUTH_REQUIRED'; tenantId: string; branchId: string }
  | { type: 'INVITE_ACCEPTED'; gymName: string; tenantId: string; branchId: string }
  | { type: 'JOIN_REQUEST_SENT'; gymName: string }
  | { type: 'NO_SUBSCRIPTION'; tenantId: string; branchId: string; memberId: string; gymName: string }
  | { type: 'ATTENDANCE_MARKED'; gymName: string };

export const executeScanFlow = async (
  data: string,
  user: FirebaseAuthTypes.User | null,
  profile: AppUser | null
): Promise<ScanFlowResult> => {
  const params = parseDeepLink(data);
  if (!params) {
    return { type: 'INVALID_LINK' };
  }

  const { tenantId, branchId } = params;

  // Step 2: Check auth
  if (!user) {
    useDeepLinkStore.getState().setPending(tenantId, branchId);
    return { type: 'AUTH_REQUIRED', tenantId, branchId };
  }

  // Step 4: Check if already a member in AppUser doc
  const isMemberOfBranch = profile?.branchIds?.includes(branchId) || 
                           (branchId === BRANCH_CONFIG.DEFAULT_BRANCH_ID && profile?.gyms?.includes(tenantId));

  let currentMemberId = "";

  if (!isMemberOfBranch) {
    // Step 5: Search invites
    const invite = await checkInvite(tenantId, branchId, user.email || undefined, user.phoneNumber || undefined);
    
    if (invite) {
      await acceptInvite(tenantId, branchId, invite.id, user.uid);
      // After accepting invite, we continue to Step 6/7 to mark attendance
      // We'll need to fetch the member id now
    } else {
      // Create Join Request
      await createJoinRequest(tenantId, branchId, user.displayName || undefined);
      return { type: 'JOIN_REQUEST_SENT', gymName: "this gym" }; // We could fetch gymName but for now simpler
    }
  }

  // Step 6: Get memberId
  const member = await getMemberByUid(tenantId, user.uid, branchId);
  if (!member) {
    // This shouldn't happen if we just accepted an invite and linked, but safety first
    // If we just accepted invite, Firestore might be syncing, but let's assume it's there
    // If not a member even after checks, maybe it's still a join request scenario
    return { type: 'JOIN_REQUEST_SENT', gymName: "this gym" };
  }
  
  currentMemberId = member.id;

  // Step 7/8: Check subscription
  const activeSub = await getActiveSubscriptionForScan(tenantId, currentMemberId, branchId);
  if (!activeSub) {
    return { 
      type: 'NO_SUBSCRIPTION', 
      tenantId, 
      branchId, 
      memberId: currentMemberId, 
      gymName: "this gym" 
    };
  }

  // Step 9: Mark attendance
  await markAttendance(tenantId, currentMemberId, branchId);
  return { type: 'ATTENDANCE_MARKED', gymName: "this gym" };
};
