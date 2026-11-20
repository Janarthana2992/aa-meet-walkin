import { attendeeService } from "../services/attendee.service";
import {
  walkInRegistrationSchema,
  checkInUpdateSchema,
} from "../validators/attendee.validator";

export class AttendeeController {
  async handleWalkInRegistration(payload: unknown) {
    try {
      const parsed = walkInRegistrationSchema.parse(payload);
      const attendee = await attendeeService.registerWalkIn(parsed);
      return {
        success: true,
        data: attendee,
        message: "Registration completed successfully",
      };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to process registration";
      return {
        success: false,
        error: message,
      };
    }
  }

  async handleSearch(params: {
    eventId?: string;
    batchYear?: string;
    stream?: string;
    paymentStatus?: string;
    checkedIn?: string;
    search?: string;
  }) {
    try {
      const attendees = await attendeeService.searchAttendees({
        eventId: params.eventId || undefined,
        batchYear: params.batchYear ? parseInt(params.batchYear) : undefined,
        stream: params.stream,
        paymentStatus: params.paymentStatus,
        checkedIn:
          params.checkedIn === "true"
            ? true
            : params.checkedIn === "false"
            ? false
            : undefined,
        search: params.search,
        limit: 20,
      });

      return {
        success: true,
        data: attendees,
      };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to search attendees";
      return {
        success: false,
        error: message,
      };
    }
  }

  async handleCheckIn(attendeeId: string, payload: unknown) {
    try {
      const parsed = checkInUpdateSchema.parse(payload);
      const attendee = await attendeeService.checkInAttendee(attendeeId, parsed);
      return {
        success: true,
        data: attendee,
        message: `Checked in ${attendee.name} successfully`,
      };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to check in attendee";
      return {
        success: false,
        error: message,
      };
    }
  }

  async handleDashboard(eventId?: string) {
    try {
      const summary = await attendeeService.getDashboardSummary(eventId);
      return {
        success: true,
        data: summary,
      };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load dashboard metrics";
      return {
        success: false,
        error: message,
      };
    }
  }
}

export const attendeeController = new AttendeeController();
