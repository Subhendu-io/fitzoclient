import { 
  getFirestore, 
  collection, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  serverTimestamp,
  FirebaseFirestoreTypes
} from "@react-native-firebase/firestore";
import type { CommunityMessage, CommunityChatMode } from '@/interfaces/member';

const TENANTS_COLLECTION = 'tenants';
const BRANCHES_SUBCOLLECTION = 'branches';
const COMMUNITY_MESSAGES_SUBCOLLECTION = 'communityMessages';
const DEFAULT_BRANCH_ID = 'main';

const resolveBranchId = (branchId?: string): string =>
  branchId && branchId.trim().length > 0 ? branchId : DEFAULT_BRANCH_ID;

const getCommunityMessagesCollection = (tenantId: string, branchId?: string) => {
  const db = getFirestore();
  return collection(
    db,
    TENANTS_COLLECTION,
    tenantId,
    BRANCHES_SUBCOLLECTION,
    resolveBranchId(branchId),
    COMMUNITY_MESSAGES_SUBCOLLECTION
  );
};

function normalizeCreatedAt(createdAt: any): number {
  if (typeof createdAt === 'number') return createdAt;
  if (createdAt?.toMillis) return createdAt.toMillis();
  if (createdAt?.seconds) return createdAt.seconds * 1000;
  return Date.now();
}

function toCommunityMessage(docSnapshot: FirebaseFirestoreTypes.QueryDocumentSnapshot): CommunityMessage {
  const data = docSnapshot.data();
  return {
    id: docSnapshot.id,
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
  const q = query(colRef, orderBy('createdAt', 'asc'));
  
  const unsubscribe = onSnapshot(
    q,
    (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
      const messages = snapshot.docs.map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => toCommunityMessage(docSnap));
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
  await addDoc(col, {
    senderId: uid,
    senderType: 'member',
    senderName: senderName.trim() || 'Member',
    text: text.trim(),
    tenantId,
    branchId: resolvedBranchId,
    createdAt: serverTimestamp(),
  });
}
