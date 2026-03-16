import { functions } from '@/lib/firebase';

export type VerifyQrScanStatus =
  | 'EXISTING_MEMBER'
  | 'NO_MEMBER'
  | 'TENANT_INVALID'
  | 'BRANCH_INVALID';

export interface VerifyQrScanMemberPreview {
  memberId: string;
  name?: string;
  phoneMasked?: string;
}

export interface VerifyQrScanResult {
  status: VerifyQrScanStatus;
  memberPreview?: VerifyQrScanMemberPreview;
  gymName?: string;
  branchName?: string;
}

export interface VerifyQrScanInput {
  tenantId: string;
  branchId: string;
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
  const { tenantId, branchId } = input;
  if (!tenantId?.trim()) {
    throw new Error('tenantId is required');
  }
  const branchIdNorm = branchId?.trim() || 'main';

  const callable = functions().httpsCallable(VERIFY_QR_CALLABLE);
  const { data } = await callable({
    tenantId: tenantId.trim(),
    branchId: branchIdNorm,
  });

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

  const callable = functions().httpsCallable(LINK_MEMBER_CALLABLE);
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
  input: CreateJoinRequestInput,
): Promise<CreateJoinRequestResult> => {
  const { tenantId, branchId, displayName } = input;
  if (!tenantId?.trim()) {
    throw new Error('tenantId is required');
  }

  const callable = functions().httpsCallable(CREATE_JOIN_REQUEST_CALLABLE);
  const { data } = await callable({
    tenantId: tenantId.trim(),
    branchId: branchId?.trim() || 'main',
    displayName: displayName?.trim() || undefined,
  });

  return data as CreateJoinRequestResult;
};
