import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { parseDeepLink } from '@/services/deepLinkService';
import { useDeepLinkStore } from '@/store/useDeepLinkStore';
import { verifyQrScan, linkMemberProfile } from './qrVerifyService';
import { getMemberByUid, getActiveSubscriptionForScan, markAttendance } from '@/services/memberService';

export type ScanFlowResult =
  | { type: 'INVALID_LINK' }
  | { type: 'AUTH_REQUIRED'; tenantId: string; branchId: string }
  | { type: 'PHONE_REQUIRED'; gymName: string; tenantId: string; branchId: string }
  | {
      type: 'LEAD_PENDING';
      leadId: string;
      gymName: string;
      branchName?: string;
      tenantId: string;
      branchId: string;
    }
  | {
      type: 'NO_SUBSCRIPTION';
      tenantId: string;
      branchId: string;
      memberId: string;
      gymName: string;
    }
  | { type: 'ATTENDANCE_MARKED'; gymName: string };

/**
 * Server-owned QR flow: `verifyQrScan` resolves uid → phone link → lead.
 * Client only runs subscription check + attendance when a memberId is available.
 */
export const executeScanFlow = async (
  data: string,
  user: FirebaseAuthTypes.User | null,
  // profile unused — server drives membership via verifyQrScan
  _profile?: unknown,
): Promise<ScanFlowResult> => {
  const params = parseDeepLink(data);
  if (!params) {
    return { type: 'INVALID_LINK' };
  }

  const { tenantId, branchId } = params;

  if (!user) {
    useDeepLinkStore.getState().setPending(tenantId, branchId);
    return { type: 'AUTH_REQUIRED', tenantId, branchId };
  }

  const resolved = await verifyQrScan({
    tenantId,
    branchId,
  });

  const gymLabel = resolved.gymName?.trim() || 'this gym';

  if (resolved.status === 'TENANT_INVALID' || resolved.status === 'BRANCH_INVALID') {
    return { type: 'INVALID_LINK' };
  }

  if (resolved.status === 'PHONE_REQUIRED') {
    return {
      type: 'PHONE_REQUIRED',
      gymName: gymLabel,
      tenantId,
      branchId,
    };
  }

  if (resolved.status === 'LEAD_CREATED') {
    if (!resolved.leadId) {
      return {
        type: 'LEAD_PENDING',
        leadId: 'unknown',
        gymName: gymLabel,
        branchName: resolved.branchName,
        tenantId,
        branchId,
      };
    }
    return {
      type: 'LEAD_PENDING',
      leadId: resolved.leadId,
      gymName: gymLabel,
      branchName: resolved.branchName,
      tenantId,
      branchId,
    };
  }

  // Legacy server response — app should call updated verifyQrScan
  if (resolved.status === 'NO_MEMBER') {
    return { type: 'INVALID_LINK' };
  }

  // MEMBER_READY, MEMBER_LINKED, EXISTING_MEMBER (legacy) → check-in path
  let memberId = resolved.memberId ?? resolved.memberPreview?.memberId;

  // Always verify uid linkage before attendance. This prevents permission-denied
  // when backend returned a memberId but members/{memberId}.uid is still missing.
  let linkedMember = await getMemberByUid(tenantId, user.uid, branchId);
  if (!linkedMember && memberId) {
    try {
      await linkMemberProfile({
        tenantId,
        branchId,
        memberId,
        consent: true,
      });
      linkedMember = await getMemberByUid(tenantId, user.uid, branchId);
    } catch {
      // Fall through to unresolved member handling below.
    }
  }

  if (!linkedMember) {
    return {
      type: 'LEAD_PENDING',
      leadId: 'unknown',
      gymName: gymLabel,
      branchName: resolved.branchName,
      tenantId,
      branchId,
    };
  }
  memberId = linkedMember.id;

  const activeSub = await getActiveSubscriptionForScan(tenantId, memberId, branchId);
  if (!activeSub) {
    return {
      type: 'NO_SUBSCRIPTION',
      tenantId,
      branchId,
      memberId,
      gymName: gymLabel,
    };
  }

  await markAttendance(tenantId, memberId, branchId);
  return { type: 'ATTENDANCE_MARKED', gymName: gymLabel };
};
