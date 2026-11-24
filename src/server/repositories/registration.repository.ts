import { supabase, supabaseAdmin } from "../config/supabase";
import { EventRegistration } from "@/types/database.types";
import { extractPhoneDigits, normalizeEmail } from "../utils/csv";

const client = supabaseAdmin || supabase;

export interface RegistrationFilters {
  eventId?: number;
  graduatingYear?: number;
  stream?: string;
  registrationSource?: string;
  paymentMode?: string;
  search?: string;
  limit?: number;
}

export class RegistrationRepository {
  async listRegistrations(
    filters: RegistrationFilters = {}
  ): Promise<EventRegistration[]> {
    let query = client.from("event_registrations").select("*");

    if (filters.eventId) {
      query = query.eq("event_id", filters.eventId);
    }
    if (filters.graduatingYear) {
      query = query.eq("graduating_year", filters.graduatingYear);
    }
    if (filters.stream && filters.stream !== "All") {
      query = query.eq("stream", filters.stream);
    }
    if (filters.registrationSource && filters.registrationSource !== "All") {
      query = query.eq("registration_source", filters.registrationSource);
    }
    if (filters.paymentMode && filters.paymentMode !== "All") {
      query = query.eq("payment_mode", filters.paymentMode);
    }
    if (filters.search && filters.search.trim()) {
      const term = `%${filters.search.trim()}%`;
      query = query.or(
        `full_name.ilike.${term},email.ilike.${term},mobile.ilike.${term},utr_last4.ilike.${term}`
      );
    }

    query = query.order("checked_in_at", { ascending: false });

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error listing event registrations:", error.message);
      return [];
    }
    return (data as EventRegistration[]) || [];
  }

  async findByEventAndEmailOrMobile(
    eventId: number,
    emailOrMobile: string
  ): Promise<EventRegistration | null> {
    const trimmed = emailOrMobile.trim();
    if (!trimmed) return null;

    if (trimmed.includes("@")) {
      const { data, error } = await client
        .from("event_registrations")
        .select("*")
        .eq("event_id", eventId)
        .ilike("email", normalizeEmail(trimmed))
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error finding registration by email:", error.message);
        return null;
      }
      return (data as EventRegistration) || null;
    }

    const digits = extractPhoneDigits(trimmed);
    if (digits.length < 7) return null;

    const { data, error } = await client
      .from("event_registrations")
      .select("*")
      .eq("event_id", eventId)
      .ilike("mobile", `%${digits}%`)
      .limit(10);

    if (error || !data) {
      if (error)
        console.error("Error finding registration by mobile:", error.message);
      return null;
    }

    const exact = (data as EventRegistration[]).find(
      (r) => extractPhoneDigits(r.mobile) === digits
    );
    return exact || (data[0] as EventRegistration) || null;
  }

  async findByEventAndEmail(
    eventId: number,
    email: string
  ): Promise<EventRegistration | null> {
    const { data, error } = await client
      .from("event_registrations")
      .select("*")
      .eq("event_id", eventId)
      .ilike("email", normalizeEmail(email))
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error checking existing registration:", error.message);
      return null;
    }
    return (data as EventRegistration) || null;
  }

  async insertRegistration(
    payload: Partial<EventRegistration>
  ): Promise<EventRegistration> {
    const { data, error } = await client
      .from("event_registrations")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Error creating registration:", error.message);
      throw new Error(error.message);
    }
    return data as EventRegistration;
  }

  async updateRegistration(
    registrationId: number,
    updates: Partial<EventRegistration>
  ): Promise<EventRegistration> {
    const { data, error } = await client
      .from("event_registrations")
      .update(updates)
      .eq("registration_id", registrationId)
      .select()
      .single();

    if (error) {
      console.error(`Error updating registration ${registrationId}:`, error.message);
      throw new Error(error.message);
    }
    return data as EventRegistration;
  }

  async deleteRegistration(registrationId: number): Promise<boolean> {
    const { error } = await client
      .from("event_registrations")
      .delete()
      .eq("registration_id", registrationId);

    if (error) {
      console.error(`Error deleting registration ${registrationId}:`, error.message);
      return false;
    }
    return true;
  }
}

export const registrationRepository = new RegistrationRepository();
