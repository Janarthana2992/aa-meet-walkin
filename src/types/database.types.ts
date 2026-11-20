import {
  Department,
  EventStatus,
  FoodPreference,
  PaymentMode,
  PaymentStatus,
} from "../server/constants";

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  location: string;
  venue_details: string | null;
  status: EventStatus;
  banner_url: string | null;
  is_active: boolean;
  registration_open: boolean;
  created_at: string;
  updated_at: string;
}

export interface Attendee {
  attendee_id: string;
  event_id: string | null;
  name: string;
  course: string | null;
  stream: Department | string | null;
  batch_year: number | null;
  email: string | null;
  mobile: string;
  status: string | null;
  food_preference: FoodPreference | string | null;
  family_members: number;
  gender: string | null;
  city: string | null;
  company: string | null;
  registration_type: "Pre-Registered" | "Walk-In";
  payment_status: PaymentStatus;
  payment_mode: PaymentMode;
  amount_paid: number;
  membership_amount: number;
  contribution_amount: number;
  remarks: string | null;
  checked_in: boolean;
  checked_in_at: string | null;
  qr_code_path: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "volunteer";
  created_at: string;
}

export interface EventMetrics {
  total: number;
  checked_in: number;
  walk_in: number;
  pre_registered: number;
  total_collection: number;
  membership_total: number;
  contribution_total: number;
}
