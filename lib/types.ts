// Shapes mirror gym-service's Prisma schema (services/gym-service/prisma/schema.prisma)
// and its controller response envelopes ({ data: ... }) — see app/api/gyms/**.

export interface Gym {
  id: number;
  name: string;
  description: string | null;
  address: string;
  city: string;
  state: string;
  amenities: string[];
  phone: string;
  sessionPrice: number;
  openTime: string;
  closeTime: string;
  slotDuration: number;
  capacity: number;
  rating: number;
  ratingCount: number;
  googleRating: number | null;
  googleRatingCount: number | null;
  equipmentRating: number | null;
  equipmentRatingCount: number;
  cleanlinessRating: number | null;
  cleanlinessRatingCount: number;
  trainerRating: number | null;
  trainerRatingCount: number;
  valueForMoneyRating: number | null;
  valueForMoneyRatingCount: number;
  staffBehaviourRating: number | null;
  staffBehaviourRatingCount: number;
  crowdRating: number | null;
  crowdRatingCount: number;
  images: { id: number; url: string; mediaType?: 'image' | 'video' }[];
  distanceKm?: number;
}

// Mirrors auth-service's JobOpening model — see /careers and app/api/jobs.
export interface JobOpening {
  id: number;
  title: string;
  department: string;
  location: string;
  employmentType: 'full_time' | 'part_time' | 'internship' | 'contract';
  description: string;
  isActive: boolean;
  createdAt: string;
}

export interface Slot {
  startTime: string;
  endTime: string;
  price: number;
  booked: number;
  available: number;
}

// Mirrors gym-service's GymClass — a recurring bookable class (e.g. "Yoga",
// held every Monday 7-8am). price null = included with an active
// subscription at this gym; price set = always charged that amount
// regardless of subscription status.
export interface GymClass {
  id: number;
  gymId: number;
  name: string;
  description: string | null;
  instructor: string | null;
  dayOfWeek: number; // 0=Sunday..6=Saturday
  startTime: string;
  endTime: string;
  capacity: number;
  price: number | null;
  isActive: boolean;
}

// One upcoming bookable occurrence of a GymClass — see gym-service's
// GET /:id/classes/:classId/occurrences.
export interface ClassOccurrence {
  date: string;
  startTime: string;
  endTime: string;
  booked: number;
  available: number;
}

export interface GymReview {
  id: number;
  gymId: number;
  customerId: number;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface Booking {
  id: number;
  gymId: number;
  gym: { id: number; name: string; address: string; city: string; imageUrl: string | null } | null;
  date: string;
  startTime: string;
  endTime: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'started' | 'cancelled' | 'completed';
  createdAt: string;
  qrToken?: string;
  slotShiftWarning?: boolean;
  // Set for a recurring-class booking instead of a plain session — see
  // gym-service's GymClass. No class-name enrichment yet, just the id.
  classId?: number | null;
}

export interface WalletTransaction {
  id: number;
  type: 'credit' | 'debit' | 'transfer' | 'bonus' | 'payout';
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'reversed';
  description: string | null;
  createdAt: string;
}

export interface SubscriptionPlan {
  planType: 'weekly' | 'monthly' | 'quarterly' | 'sixMonthly' | 'yearly';
  days: number;
  price: number;
  comparablePrice: number;
  discountPercent: number;
}

export interface GymSubscriptionPlans {
  gymId: number;
  priciestSlotPrice: number;
  plans: SubscriptionPlan[];
}

export interface GymSubscription {
  id: number;
  customerId: number;
  gymId: number;
  partnerId: number;
  planType: string;
  price: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'cancelled';
  createdAt: string;
  // Only present on an active subscription (see wallet-service's
  // getMySubscriptionsService) — null/undefined means no visit yet, or
  // booking-service was unreachable when this was fetched. Matching it
  // against the currently-picked booking date tells the UI whether that
  // day's covered session has already been used.
  lastVisitDate?: string | null;
}

// Mirrors booking-service's public/authed attendance-stat response envelopes
// — see app/api/attendance/summary and components/AttendanceStat.

export interface PublicAttendanceStats {
  sessionsAttendedThisMonth: number;
  month: string;
}

export interface AttendanceSummary {
  totalAttended: number;
  thisMonthAttended: number;
  lastAttendedAt: string | null;
  attendedDates: string[];
}

// Mirrors booking-service's attendance-warnings response envelope — see
// app/api/attendance/warnings and components/attendance/AttendanceWarningsView.
// Populated when a partner scans a customer's QR too early (>15 min before
// session start) and confirms proceeding anyway; customer-facing only.

export interface AttendanceWarning {
  bookingId: number;
  gymId: number;
  gymName: string | null;
  date: string;
  originalStartTime: string;
  originalEndTime: string;
  newStartTime: string;
  newEndTime: string;
  createdAt: string;
}

export interface AttendanceWarningSummary {
  count: number;
  warnings: AttendanceWarning[];
}

export interface SessionUser {
  id: number;
  phone: string;
  name: string | null;
  email: string | null;
  role: string;
  type: string;
  gender?: string | null;
  dateOfBirth?: string | null;
  fitnessGoals?: string[];
}
