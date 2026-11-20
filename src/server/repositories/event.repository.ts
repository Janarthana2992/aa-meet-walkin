import { supabase } from "../config/supabase";
import { Event } from "@/types/database.types";

export class EventRepository {
  async getAllEvents(): Promise<Event[]> {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: false });

    if (error) {
      console.error("Error fetching events:", error.message);
      return [];
    }
    return (data as Event[]) || [];
  }

  async getActiveEvent(): Promise<Event | null> {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("is_active", true)
      .order("event_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching active event:", error.message);
      return null;
    }
    return (data as Event) || null;
  }

  async getEventBySlug(slug: string): Promise<Event | null> {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching event by slug ${slug}:`, error.message);
      return null;
    }
    return (data as Event) || null;
  }

  async getEventById(id: string): Promise<Event | null> {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching event by id ${id}:`, error.message);
      return null;
    }
    return (data as Event) || null;
  }

  async createEvent(eventData: Partial<Event>): Promise<Event | null> {
    const { data, error } = await supabase
      .from("events")
      .insert(eventData)
      .select()
      .single();

    if (error) {
      console.error("Error creating event:", error.message);
      throw new Error(error.message);
    }
    return data as Event;
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event | null> {
    const { data, error } = await supabase
      .from("events")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating event ${id}:`, error.message);
      throw new Error(error.message);
    }
    return data as Event;
  }

  async deleteEvent(id: string): Promise<boolean> {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) {
      console.error(`Error deleting event ${id}:`, error.message);
      return false;
    }
    return true;
  }
}

export const eventRepository = new EventRepository();
