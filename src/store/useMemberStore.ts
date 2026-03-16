import { create } from 'zustand';
import { Member, Tenant, AttendanceStats, CrowdForecast } from '@/interfaces/member';

interface MemberState {
  memberData: Member | null;
  tenantInfo: Tenant | null;
  attendanceStats: AttendanceStats | null;
  crowdForecast: CrowdForecast | null;
  loading: boolean;
  setMemberData: (data: Member | null) => void;
  setTenantInfo: (info: Tenant | null) => void;
  setAttendanceStats: (stats: AttendanceStats | null) => void;
  setCrowdForecast: (forecast: CrowdForecast | null) => void;
  setLoading: (loading: boolean) => void;
  clearMemberData: () => void;
}

export const useMemberStore = create<MemberState>((set) => ({
  memberData: null,
  tenantInfo: null,
  attendanceStats: null,
  crowdForecast: null,
  loading: false,
  setMemberData: (memberData) => set({ memberData }),
  setTenantInfo: (tenantInfo) => set({ tenantInfo }),
  setAttendanceStats: (attendanceStats) => set({ attendanceStats }),
  setCrowdForecast: (crowdForecast) => set({ crowdForecast }),
  setLoading: (loading) => set({ loading }),
  clearMemberData: () => set({ 
    memberData: null, 
    tenantInfo: null, 
    attendanceStats: null, 
    crowdForecast: null 
  }),
}));
