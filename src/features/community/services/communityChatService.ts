import { firestore } from '@/lib/firebase';
import type { CommunityMessage, CommunityChatMode } from '@/interfaces/member';

const TENANTS_COLLECTION = 'tenants';
const BRANCHES_SUBCOLLECTION = 'branches';
const COMMUNITY_MESSAGES_SUBCOLLECTION = 'communityMessages';
const DEFAULT_BRANCH_ID = 'main';

const resolveBranchId = (branchId?: string): string =>
  branchId && branchId.trim().length > 0 ? branchId : DEFAULT_BRANCH_ID;

const getCommunityMessagesCollection = (tenantId: string, branchId?: string) =>
  firestore()
    .collection(TENANTS_COLLECTION)
    .doc(tenantId)
    .collection(BRANCHES_SUBCOLLECTION)
    .doc(resolveBranchId(branchId))
    .collection(COMMUNITY_MESSAGES_SUBCOLLECTION);

function normalizeCreatedAt(createdAt: any): number {
  if (typeof createdAt === 'number') return createdAt;
  if (createdAt?.toMillis) return createdAt.toMillis();
  if (createdAt?.seconds) return createdAt.seconds * 1000;
  return Date.now();
}

function toCommunityMessage(doc: any): CommunityMessage {
  const data = doc.data();
  return {
    id: doc.id,
    senderId: data?.senderId ?? '',
    senderType: data?.senderType ?? 'member',
    senderName: data?.senderName ?? '',
    text: data?.text ?? '',
    tenantId: data?.tenantId ?? '',
    branchId: data?.branchId ?? undefined,
    createdAt: normalizeCreatedAt(data?.createdAt),
  };
}

/**
 * Subscribe to real-time community messages
 */
export function subscribeToCommunityMessages(
  tenantId: string,
  onUpdate: (messages: CommunityMessage[]) => void,
  onError?: (error: Error) => void,
  branchId?: string,
): () => void {
  const resolvedBranchId = resolveBranchId(branchId);
  const colRef = getCommunityMessagesCollection(tenantId, resolvedBranchId);
  
  const unsubscribe = colRef
    .orderBy('createdAt', 'asc')
    .onSnapshot(
      (snapshot) => {
        const messages = snapshot.docs.map((doc) => toCommunityMessage(doc));
        onUpdate(messages);
      },
      (err: any) => {
        console.error('[CommunityChatService] Error:', err);
        if (onError) onError(new Error('Failed to load community messages'));
      },
    );
  return unsubscribe;
}

/**
 * Send a message as a member
 */
export async function sendCommunityMessage(
  tenantId: string,
  uid: string,
  senderName: string,
  text: string,
  branchId?: string,
): Promise<void> {
  const resolvedBranchId = resolveBranchId(branchId);
  const col = getCommunityMessagesCollection(tenantId, resolvedBranchId);
  await col.add({
    senderId: uid,
    senderType: 'member',
    senderName: senderName.trim() || 'Member',
    text: text.trim(),
    tenantId,
    branchId: resolvedBranchId,
    createdAt: firestore.FieldValue.serverTimestamp(),
  });
}
