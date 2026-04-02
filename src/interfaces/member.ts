/**
 * Type definitions for gym member data structures
 * These match the fitzocrm Firestore schema
 */
import type { FoodAssessment } from '@/features/health/services/foodAnalysisService';

// Plan data from tenants/{tenantId}/branches/{branchId}/plans subcollection
export interface Plan {
  id: string;
  name: string;
  duration: number; // in days
  price: number;
  description?: string;
  features?: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Member data from tenants/{tenantId}/branches/{branchId}/members subcollection
export interface Member {
  id: string;
  name: string;
  email?: string;
  phone: string;
  dateOfBirth?: string;
  gender?: "Male" | "Female" | "Other";
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  joinDate: string;
  status: "active" | "inactive" | "suspended" | "expired";
  uid?: string; // Firebase Auth UID - links to app user
  subscriptionId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Payment data from tenants/{tenantId}/branches/{branchId}/payments subcollection
export interface Payment {
  id: string;
  memberId: string;
  amount: number;
  paymentMethod: "upi" | "cash" | "card" | "bank_transfer" | "cheque";
  paymentDate: string;
  status: "pending" | "paid" | "failed" | "refunded";
  transactionId?: string;
  notes?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MemberWorkoutAssignment {
  id: string;
  memberId: string;
  workoutChartId: string;
  snapshot: WorkoutAssignmentSnapshot;
  assignedAt?: string;
  assignedBy?: string;
  _keywords?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Subscription data from tenants/{tenantId}/branches/{branchId}/subscriptions subcollection
export interface Subscription {
  id: string;
  memberId: string;
  planId: string;
  paymentId?: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "active" | "expired" | "cancelled" | "suspended";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  plan?: {
    name?: string;
    duration?: number;
    price?: number;
    description?: string;
  };
}

// Attendance data from tenants/{tenantId}/branches/{branchId}/attendance subcollection
export interface Attendance {
  id: string;
  memberId?: string;
  uid?: string;
  timestamp?: string;
  createdAt?: any;
  userId?: string;
  status?: string;
  verifyMode?: string;
  deviceSn?: string;
  raw?: string;
  actorType?: "member" | "staff";
  actorId?: string;
  actorName?: string;
  pin?: string;
  punchedAt?: any;
  punchType?: "CHECK_IN" | "CHECK_OUT" | string;
  source?: "BIOMETRIC" | "QR" | "MANUAL" | string;
  notes?: string;
  createdBy?: string;
}

// AppUser data from appusers collection
export interface AppUser {
  uid: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  photoURL?: string;
  gyms: string[];
  activeGym?: string;
  branchIds?: string[];
  activeBranchId?: string;
  fcmToken?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Community chat mode: open = members + gym can send; broadcast = only gym can send
export type CommunityChatMode = "open" | "broadcast";

// Tenant/Gym data from tenants collection
export interface Tenant {
  id: string;
  name: string;
  gymType?: string;
  contactPerson?: string;
  email?: string;
  contactEmail?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  website?: string;
  taxId?: string;
  operatingHours?: string;
  amenities?: string[];
  capacity?: number;
  establishedDate?: string;
  status?: "Active" | "Inactive" | "Suspended" | "Pending";
  branches?: string[];
  defaultBranchId?: string;
  description?: any;
  notes?: any;
  logo?: string;
  communityChatEnabled?: boolean;
  communityChatMode?: CommunityChatMode;
}

// Community message in tenants/{tenantId}/branches/{branchId}/communityMessages
export type CommunityMessageSenderType = "member" | "staff" | "gym";

export interface CommunityMessage {
  id: string;
  senderId: string;
  senderType: CommunityMessageSenderType;
  senderName: string;
  text: string;
  tenantId: string;
  branchId?: string;
  createdAt: number;
}

// Helper type for subscription with calculated days remaining
export interface SubscriptionWithDaysRemaining extends Subscription {
  daysRemaining?: number;
}

// Helper type for attendance statistics
export interface AttendanceStats {
  totalCount: number;
  thisMonth: number;
  streak: number;
  lastAttendance?: string;
}

// Leaderboard row for gamified attendance streaks
export interface AttendanceStreakBoardEntry {
  rank: number;
  memberId: string;
  memberName: string;
  streak: number;
  totalCheckIns: number;
  isCurrentUser: boolean;
}

export type CrowdBand = "quiet" | "moderate" | "busy" | "peak";
export type CrowdTrendDirection = "up" | "down" | "flat";

export interface CrowdTrendPoint {
  hour24: number;
  hourLabel: string;
  todayCount: number;
  typicalCount: number;
}

export interface CrowdForecast {
  branchId: string;
  currentCapacityPercent: number;
  currentBand: CrowdBand;
  currentCheckInsThisHour: number;
  typicalCheckInsThisHour: number;
  trendDirection: CrowdTrendDirection;
  trendDeltaPercent: number;
  baselinePeakHourCount: number;
  nextBestWindows: string[];
  trendSeries: CrowdTrendPoint[];
  confidenceScore: number;
  confidence: "low" | "medium" | "high";
  lastUpdatedAt: string;
}

// Notification data from appusers/{uid}/notifications subcollection
export interface Notification {
  id: string;
  title: string;
  body: string;
  data?: { [key: string]: any };
  read: boolean;
  timestamp: number;
}

// --- Workout assignment (tenants/{tenantId}/branches/{branchId}/memberWorkoutAssignments) ---

/** Snapshot of workout chart at assignment time */
export interface WorkoutAssignmentSnapshot {
  title?: string;
  goal?: string;
  difficulty?: string;
  scheduleType?: string;
  description?: any | null;
  isActive?: boolean;
}

export interface MemberSession {
  id: string;
  memberId: string;
  totalSessions: number;
  redeemedSessions: number;
  status: "active" | "completed" | "cancelled";
  sessionPlan?: {
    name?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface MemberSessionRedemption {
  id: string;
  memberId: string;
  trainerName: string;
  redeemedSessions: number;
  validTill: string;
  receiptNumber: string;
  leftClasses?: number;
  totalSessions?: number;
  redeemedAt?: any;
  createdAt?: any;
  updatedAt?: any;
  status?: string;
}

export interface MemberSessionPlanItem {
  id: string;
  planName: string;
  totalSessions: number;
  redeemedSessions: number;
  leftClasses: number;
  status: "active" | "completed" | "cancelled";
}

export interface MemberRedemptionHistoryItem {
  id: string;
  trainerName: string;
  redeemedAt: string;
  validUntil: string;
  receiptNumber: string;
}

// Health and tracking metadata extensions under appusers collection
export interface UserHealth {
  id?: string;
  height?: number; // cm
  weight?: number; // kg
  fatPercentage?: number;
  bodyMeasurement?: {
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
  };
  updatedAt: number; // timestamp
}

export interface FitnessTrackingEntry {
  id?: string;
  date: string; // YYYY-MM-DD format
  fitnessScore: number;
  aiDetails: string;
  imageUrl?: string;
  createdAt: number; // timestamp
}

export interface DietTrackingEntry {
  id?: string;
  date: string; // YYYY-MM-DD
  assessment: FoodAssessment;
  imageUrl?: string;
  createdAt: number; // timestamp
}

