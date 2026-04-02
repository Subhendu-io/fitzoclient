import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { parseDeepLink } from '@/services/deepLinkService';
import { useDeepLinkStore } from '@/store/useDeepLinkStore';
import { verifyQrScan, linkMemberProfile } from './qrVerifyService';
import {
  getMemberByUid,
  getMemberByPhoneOrEmail,
  getActiveSubscriptionForScan,
  markAttendance,
} from '@/services/memberService';

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
 * Attempt to resolve a member by UID, then by phone/email.
 * If found by phone/email, links the member profile automatically.
 * Returns the resolved memberId or null.
 */
const resolveMemberId = async (
  tenantId: string,
  branchId: string,
  user: FirebaseAuthTypes.User,
  serverMemberId?: string,
): Promise<string | null> => {
  // 1. Try UID lookup first
  console.log('[resolveMemberId] Step 1: Trying getMemberByUid for uid:', user.uid);
  let member = await getMemberByUid(tenantId, user.uid, branchId);
  if (member) {
    console.log('[resolveMemberId] ✅ Found member by UID:', member.id);
    return member.id;
  }
  console.log('[resolveMemberId] ❌ No member found by UID');

  // 2. If server gave us a memberId, try linking it
  if (serverMemberId) {
    console.log('[resolveMemberId] Step 2: Trying linkMemberProfile for memberId:', serverMemberId);
    try {
      await linkMemberProfile({
        tenantId,
        branchId,
        memberId: serverMemberId,
        consent: true,
      });
      member = await getMemberByUid(tenantId, user.uid, branchId);
      if (member) {
        console.log('[resolveMemberId] ✅ Linked and found member:', member.id);
        return member.id;
      }
    } catch (err) {
      console.log('[resolveMemberId] ❌ linkMemberProfile failed:', err);
    }
  }

  // 3. Try phone/email lookup
  const phone = user.phoneNumber || null;
  const email = user.email || null;
  console.log('[resolveMemberId] Step 3: Trying phone/email lookup. phone:', phone, 'email:', email);

  if (phone || email) {
    member = await getMemberByPhoneOrEmail(tenantId, phone, email, branchId);
    if (member) {
      console.log('[resolveMemberId] ✅ Found member by phone/email:', member.id, '→ linking...');
      // Found by phone/email — link their profile
      try {
        await linkMemberProfile({
          tenantId,
          branchId,
          memberId: member.id,
          consent: true,
        });
        console.log('[resolveMemberId] ✅ linkMemberProfile succeeded');
      } catch (err) {
        console.log('[resolveMemberId] ⚠️ linkMemberProfile failed (continuing):', err);
      }
      return member.id;
    }
    console.log('[resolveMemberId] ❌ No member found by phone/email (possible Firestore rules block)');
  }

  console.log('[resolveMemberId] ❌ All resolution methods failed');
  return null;
};

/**
 * Server-owned QR flow: `verifyQrScan` resolves uid → phone link → lead.
 * Client additionally checks phone/email match before giving up and showing lead.
 */
export const executeScanFlow = async (
  data: string,
  user: FirebaseAuthTypes.User | null,
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

  console.log('[scanFlow] Calling verifyQrScan for tenant:', tenantId, 'branch:', branchId);
  console.log('[scanFlow] User phone:', user.phoneNumber, 'email:', user.email);

  const resolved = await verifyQrScan({
    tenantId,
    branchId,
    phone: user.phoneNumber,
    email: user.email,
  });

  console.log('[scanFlow] verifyQrScan status:', resolved.status, 'memberId:', resolved.memberId);

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

  // For LEAD_CREATED: server didn't find a UID match, but a member with the
  // same phone/email may already exist. Try resolving before showing lead.
  if (resolved.status === 'LEAD_CREATED') {
    console.log('[scanFlow] LEAD_CREATED — attempting client-side member resolution...');
    const memberId = await resolveMemberId(tenantId, branchId, user);

    if (memberId) {
      console.log('[scanFlow] ✅ Resolved member:', memberId, '— checking subscription...');
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
    }

    console.log('[scanFlow] ❌ Could not resolve member — showing LEAD_PENDING');
    return {
      type: 'LEAD_PENDING',
      leadId: resolved.leadId || 'unknown',
      gymName: gymLabel,
      branchName: resolved.branchName,
      tenantId,
      branchId,
    };
  }

  // Legacy server response
  if (resolved.status === 'NO_MEMBER') {
    return { type: 'INVALID_LINK' };
  }

  // MEMBER_READY, MEMBER_LINKED, EXISTING_MEMBER (legacy) → check-in path
  const serverMemberId = resolved.memberId ?? resolved.memberPreview?.memberId;
  const memberId = await resolveMemberId(tenantId, branchId, user, serverMemberId);

  if (!memberId) {
    return {
      type: 'LEAD_PENDING',
      leadId: 'unknown',
      gymName: gymLabel,
      branchName: resolved.branchName,
      tenantId,
      branchId,
    };
  }

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
