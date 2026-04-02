import { getFunctions, httpsCallable } from '@react-native-firebase/functions';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  limit, 
  getDocs, 
  doc, 
  writeBatch, 
  arrayUnion 
} from '@react-native-firebase/firestore';
import { COLLECTIONS } from '@/constants/collection';

export type VerifyQrScanStatus =
  | 'MEMBER_READY'
  | 'MEMBER_LINKED'
  | 'LEAD_CREATED'
  | 'PHONE_REQUIRED'
  | 'TENANT_INVALID'
  | 'BRANCH_INVALID'
  /** @deprecated server may still return for older deployments */
  | 'EXISTING_MEMBER'
  | 'NO_MEMBER';

export interface VerifyQrScanMemberPreview {
  memberId: string;
  name?: string;
  phoneMasked?: string;
}

export interface VerifyQrScanResult {
  status: VerifyQrScanStatus;
  /** Set when member is linked or ready for check-in */
  memberId?: string;
  /** Set when a lead was created or reused */
  leadId?: string;
  memberPreview?: VerifyQrScanMemberPreview;
  gymName?: string;
  branchName?: string;
}

export interface VerifyQrScanInput {
  tenantId: string;
  branchId: string;
  /** Hint for server-side phone matching (from Firebase Auth user) */
  phone?: string | null;
  /** Hint for server-side email matching (from Firebase Auth user) */
  email?: string | null;
}

const VERIFY_QR_CALLABLE = 'verifyQrScan';
const LINK_MEMBER_CALLABLE = 'linkMemberProfile';
const CREATE_JOIN_REQUEST_CALLABLE = 'createJoinRequest';

/**
 * Call the verifyQrScan Cloud Function.
 */
export const verifyQrScan = async (
  input: VerifyQrScanInput,
): Promise<VerifyQrScanResult> => {
  const { tenantId, branchId, phone, email } = input;
  if (!tenantId?.trim()) {
    throw new Error('tenantId is required');
  }
  const branchIdNorm = branchId?.trim() || 'main';

  const functions = getFunctions();
  const callable = httpsCallable(functions, VERIFY_QR_CALLABLE);
  const { data } = await callable({
    tenantId: tenantId.trim(),
    branchId: branchIdNorm,
    // Pass phone/email hints — server can use these for member matching
    ...(phone ? { phone } : {}),
    ...(email ? { email } : {}),
  });

  console.log('[verifyQrScan] server response:', JSON.stringify(data));
  return data as VerifyQrScanResult;
};

export interface LinkMemberProfileInput {
  tenantId: string;
  branchId: string;
  memberId: string;
  consent: boolean;
}

export interface LinkMemberProfileResult {
  status: 'LINKED' | 'ALREADY_LINKED';
  linkedMemberId: string;
}

/**
 * Call the linkMemberProfile Cloud Function.
 */
export const linkMemberProfile = async (
  input: LinkMemberProfileInput,
): Promise<LinkMemberProfileResult> => {
  const { tenantId, branchId, memberId, consent } = input;
  if (!tenantId?.trim() || !memberId?.trim()) {
    throw new Error('tenantId and memberId are required');
  }
  if (!consent) {
    throw new Error('Consent is required to link your profile');
  }
  const branchIdNorm = branchId?.trim() || 'main';

  const functions = getFunctions();
  const callable = httpsCallable(functions, LINK_MEMBER_CALLABLE);
  const { data } = await callable({
    tenantId: tenantId.trim(),
    branchId: branchIdNorm,
    memberId: memberId.trim(),
    consent: true,
  });

  return data as LinkMemberProfileResult;
};

export interface CreateJoinRequestInput {
  tenantId: string;
  branchId: string;
  displayName?: string;
}

export interface CreateJoinRequestResult {
  status: 'REQUESTED' | 'ALREADY_REQUESTED' | 'ALREADY_MEMBER';
  requestId: string;
}

export const createJoinRequest = async (
  tenantId: string,
  branchId: string,
  displayName?: string,
): Promise<CreateJoinRequestResult> => {
  const functions = getFunctions();
  const callable = httpsCallable(functions, CREATE_JOIN_REQUEST_CALLABLE);
  const { data } = await callable({
    tenantId: tenantId.trim(),
    branchId: branchId?.trim() || 'main',
    displayName: displayName?.trim() || undefined,
  });

  return data as CreateJoinRequestResult;
};

export interface Invite {
  id: string;
  tenantId: string;
  branchId: string;
  email?: string;
  phone?: string;
  status: 'Invited' | 'Accepted' | 'Declined';
}

/**
 * Check if there's an active invitation for the user at this branch.
 */
export const checkInvite = async (
  tenantId: string,
  branchId: string,
  email?: string,
  phone?: string
): Promise<Invite | null> => {
  const db = getFirestore();

  const invitesRef = collection(
    db,
    COLLECTIONS.TENANTS,
    tenantId,
    COLLECTIONS.BRANCHES,
    branchId,
    COLLECTIONS.INVITES
  );

  // Try email first
  if (email) {
    const qEmail = query(
      invitesRef,
      where('email', '==', email.toLowerCase()),
      where('status', '==', 'Invited'),
      limit(1)
    );
    const snapEmail = await getDocs(qEmail);
    if (!snapEmail.empty) {
      return { id: snapEmail.docs[0].id, ...snapEmail.docs[0].data() } as Invite;
    }
  }

  // Try phone if email fails or not provided
  if (phone) {
    const qPhone = query(
      invitesRef,
      where('phone', '==', phone),
      where('status', '==', 'Invited'),
      limit(1)
    );
    const snapPhone = await getDocs(qPhone);
    if (!snapPhone.empty) {
      return { id: snapPhone.docs[0].id, ...snapPhone.docs[0].data() } as Invite;
    }
  }

  return null;
};

/**
 * Accept an invite and link the member.
 * This should technically update both the invite and the appUser gyms/branches.
 */
export const acceptInvite = async (
  tenantId: string,
  branchId: string,
  inviteId: string,
  uid: string
): Promise<void> => {
  const db = getFirestore();

  const inviteRef = doc(
    db,
    COLLECTIONS.TENANTS,
    tenantId,
    COLLECTIONS.BRANCHES,
    branchId,
    COLLECTIONS.INVITES,
    inviteId
  );

  const userRef = doc(db, COLLECTIONS.APPUSERS, uid);

  const batch = writeBatch(db);

  // Update invite status
  batch.update(inviteRef, {
    status: 'Accepted',
    acceptedAt: new Date().toISOString(),
    uid: uid
  });

  // Add gym and branch to user profile
  batch.update(userRef, {
    gyms: arrayUnion(tenantId),
    branchIds: arrayUnion(branchId),
    activeGym: tenantId,
    activeBranchId: branchId,
    updatedAt: new Date().toISOString()
  });

  await batch.commit();
};
