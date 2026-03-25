import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DeepLinkState {
  pendingTenantId: string | null;
  pendingBranchId: string | null;
  setPending: (tenantId: string, branchId: string) => void;
  clearPending: () => void;
}

export const useDeepLinkStore = create<DeepLinkState>()(
  persist(
    (set) => ({
      pendingTenantId: null,
      pendingBranchId: null,
      setPending: (pendingTenantId, pendingBranchId) => set({ pendingTenantId, pendingBranchId }),
      clearPending: () => set({ pendingTenantId: null, pendingBranchId: null }),
    }),
    {
      name: 'deeplink-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
