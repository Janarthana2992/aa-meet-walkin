import { supabase } from "../config/supabase";
import { Attendee, EventMetrics } from "@/types/database.types";

export interface AttendeeFilters {
  eventId?: string;
  batchYear?: number;
  stream?: string;
  paymentStatus?: string;
  checkedIn?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export class AttendeeRepository {
  async getAttendees(filters: AttendeeFilters = {}): Promise<Attendee[]> {
    let query = supabase.from("attendees").select("*");

    if (filters.eventId) {
      query = query.eq("event_id", filters.eventId);
    }
    if (filters.batchYear) {
      query = query.eq("batch_year", filters.batchYear);
    }
    if (filters.stream && filters.stream !== "All") {
      query = query.eq("stream", filters.stream);
    }
    if (filters.paymentStatus && filters.paymentStatus !== "All") {
      query = query.eq("payment_status", filters.paymentStatus);
    }
    if (typeof filters.checkedIn === "boolean") {
      query = query.eq("checked_in", filters.checkedIn);
    }
    if (filters.search && filters.search.trim()) {
      const term = `%${filters.search.trim()}%`;
      query = query.or(`name.ilike.${term},mobile.ilike.${term}`);
    }

    query = query.order("created_at", { ascending: false });

    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching attendees:", error.message);
      return [];
    }
    return (data as Attendee[]) || [];
  }

  async getAttendeeById(attendeeId: string): Promise<Attendee | null> {
    const { data, error } = await supabase
      .from("attendees")
      .select("*")
      .eq("attendee_id", attendeeId)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching attendee ${attendeeId}:`, error.message);
      return null;
    }
    return (data as Attendee) || null;
  }

  async getAttendeeByMobile(
    mobile: string,
    eventId?: string
  ): Promise<Attendee | null> {
    let query = supabase.from("attendees").select("*").eq("mobile", mobile);
    if (eventId) {
      query = query.eq("event_id", eventId);
    }
    const { data, error } = await query.limit(1).maybeSingle();

    if (error) {
      console.error(`Error finding attendee by mobile ${mobile}:`, error.message);
      return null;
    }
    return (data as Attendee) || null;
  }

  async insertAttendee(attendeeData: Partial<Attendee>): Promise<Attendee | null> {
    const { data, error } = await supabase
      .from("attendees")
      .insert(attendeeData)
      .select()
      .single();

    if (error) {
      console.error("Error inserting attendee:", error.message);
      throw new Error(error.message);
    }
    return data as Attendee;
  }

  async updateAttendee(
    attendeeId: string,
    updates: Partial<Attendee>
  ): Promise<Attendee | null> {
    const { data, error } = await supabase
      .from("attendees")
      .update(updates)
      .eq("attendee_id", attendeeId)
      .select()
      .single();

    if (error) {
      console.error(`Error updating attendee ${attendeeId}:`, error.message);
      throw new Error(error.message);
    }
    return data as Attendee;
  }

  async deleteAttendee(attendeeId: string): Promise<boolean> {
    const { error } = await supabase
      .from("attendees")
      .delete()
      .eq("attendee_id", attendeeId);

    if (error) {
      console.error(`Error deleting attendee ${attendeeId}:`, error.message);
      return false;
    }
    return true;
  }

  async getMetrics(eventId?: string): Promise<EventMetrics> {
    let query = supabase.from("attendees").select("*");
    if (eventId) {
      query = query.eq("event_id", eventId);
    }

    const { data, error } = await query;
    if (error || !data) {
      return {
        total: 0,
        checked_in: 0,
        walk_in: 0,
        pre_registered: 0,
        total_collection: 0,
        membership_total: 0,
        contribution_total: 0,
      };
    }

    const metrics: EventMetrics = {
      total: data.length,
      checked_in: 0,
      walk_in: 0,
      pre_registered: 0,
      total_collection: 0,
      membership_total: 0,
      contribution_total: 0,
    };

    for (const attendee of data) {
      if (attendee.registration_type === "Walk-In") {
        metrics.walk_in += 1;
      } else {
        metrics.pre_registered += 1;
      }

      if (attendee.checked_in) {
        metrics.checked_in += 1;
      }

      const paid = Number(attendee.amount_paid) || 0;
      const mem = Number(attendee.membership_amount) || 0;
      const con = Number(attendee.contribution_amount) || 0;

      metrics.total_collection += paid;
      metrics.membership_total += mem;
      metrics.contribution_total += con;
    }

    return metrics;
  }
}

export const attendeeRepository = new AttendeeRepository();
