import { eventRepository } from "../repositories/event.repository";
import { EventInput } from "../validators/event.validator";
import { Event } from "@/types/database.types";

export class EventService {
  async getAllEvents(): Promise<Event[]> {
    return eventRepository.getAllEvents();
  }

  async getActiveOrUpcomingEvent(): Promise<Event | null> {
    const active = await eventRepository.getActiveEvent();
    if (active) return active;

    const events = await eventRepository.getAllEvents();
    return events.length > 0 ? events[0] : null;
  }

  async getEventBySlug(slug: string): Promise<Event | null> {
    return eventRepository.getEventBySlug(slug);
  }

  async createEvent(input: EventInput): Promise<Event> {
    const existing = await eventRepository.getEventBySlug(input.slug);
    if (existing) {
      throw new Error(`An event with slug "${input.slug}" already exists`);
    }

    const newEvent = await eventRepository.createEvent({
      title: input.title,
      slug: input.slug,
      description: input.description || null,
      event_date: input.eventDate,
      event_time: input.eventTime || null,
      location: input.location,
      venue_details: input.venueDetails || null,
      status: input.status,
      banner_url: input.bannerUrl || null,
      is_active: input.isActive,
      registration_open: input.registrationOpen,
    });

    if (!newEvent) {
      throw new Error("Failed to create event");
    }

    return newEvent;
  }

  async updateEvent(id: string, input: Partial<EventInput>): Promise<Event> {
    const updates: Partial<Event> = {};
    if (input.title !== undefined) updates.title = input.title;
    if (input.slug !== undefined) updates.slug = input.slug;
    if (input.description !== undefined) updates.description = input.description;
    if (input.eventDate !== undefined) updates.event_date = input.eventDate;
    if (input.eventTime !== undefined) updates.event_time = input.eventTime;
    if (input.location !== undefined) updates.location = input.location;
    if (input.venueDetails !== undefined) updates.venue_details = input.venueDetails;
    if (input.status !== undefined) updates.status = input.status;
    if (input.bannerUrl !== undefined) updates.banner_url = input.bannerUrl;
    if (input.isActive !== undefined) updates.is_active = input.isActive;
    if (input.registrationOpen !== undefined)
      updates.registration_open = input.registrationOpen;

    const updated = await eventRepository.updateEvent(id, updates);
    if (!updated) {
      throw new Error("Event not found or failed to update");
    }
    return updated;
  }

  async deleteEvent(id: string): Promise<boolean> {
    return eventRepository.deleteEvent(id);
  }
}

export const eventService = new EventService();
