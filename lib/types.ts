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
  images: { id: number; url: string }[];
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
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
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
  planType: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
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
}
