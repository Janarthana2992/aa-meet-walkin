import { eventService } from "../services/event.service";
import { eventSchema } from "../validators/event.validator";

export class EventController {
  async handleListEvents() {
    try {
      const events = await eventService.getAllEvents();
      return {
        success: true,
        data: events,
      };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch events";
      return {
        success: false,
        error: message,
      };
    }
  }

  async handleGetActiveEvent() {
    try {
      const event = await eventService.getActiveOrUpcomingEvent();
      return {
        success: true,
        data: event,
      };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch active event";
      return {
        success: false,
        error: message,
      };
    }
  }

  async handleCreateEvent(payload: unknown) {
    try {
      const parsed = eventSchema.parse(payload);
      const event = await eventService.createEvent(parsed);
      return {
        success: true,
        data: event,
        message: "Event created successfully",
      };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create event";
      return {
        success: false,
        error: message,
      };
    }
  }

  async handleUpdateEvent(id: string, payload: unknown) {
    try {
      const parsed = eventSchema.partial().parse(payload);
      const event = await eventService.updateEvent(id, parsed);
      return {
        success: true,
        data: event,
        message: "Event updated successfully",
      };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update event";
      return {
        success: false,
        error: message,
      };
    }
  }

  async handleDeleteEvent(id: string) {
    try {
      const success = await eventService.deleteEvent(id);
      return {
        success,
        message: success ? "Event deleted" : "Failed to delete event",
      };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete event";
      return {
        success: false,
        error: message,
      };
    }
  }
}

export const eventController = new EventController();
