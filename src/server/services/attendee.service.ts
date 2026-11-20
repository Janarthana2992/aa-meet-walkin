import {
  attendeeRepository,
  AttendeeFilters,
} from "../repositories/attendee.repository";
import { eventRepository } from "../repositories/event.repository";
import {
  CheckInUpdateInput,
  WalkInRegistrationInput,
} from "../validators/attendee.validator";
import { Attendee, EventMetrics } from "@/types/database.types";

export class AttendeeService {
  /**
   * Generates a standard IRTTAA attendee ID.
   * Format: IRTTAA-<timestamp_suffix>-<mobile_suffix>
   */
  private generateAttendeeId(mobile: string): string {
    const timestamp = Date.now().toString().slice(-6);
    const mobileSuffix = mobile.slice(-4);
    return `IRTTAA-${timestamp}-${mobileSuffix}`;
  }

  /**
   * Process a walk-in attendee registration.
   * Calculates total payment and automatically marks attendee as checked in.
   */
  async registerWalkIn(input: WalkInRegistrationInput): Promise<Attendee> {
    // Determine target event
    let eventId = input.eventId;
    if (!eventId) {
      const activeEvent = await eventRepository.getActiveEvent();
      eventId = activeEvent ? activeEvent.id : undefined;
    }

    // Check for duplicate registration by mobile
    const existing = await attendeeRepository.getAttendeeByMobile(
      input.mobile,
      eventId
    );
    if (existing) {
      throw new Error(
        `Mobile number ${input.mobile} is already registered as ${existing.name} (${existing.attendee_id}).`
      );
    }

    const attendeeId = this.generateAttendeeId(input.mobile);
    const membershipAmount = Number(input.membershipAmount) || 0;
    const contributionAmount = Number(input.contributionAmount) || 0;
    const totalAmount = membershipAmount + contributionAmount;

    const payload: Partial<Attendee> = {
      attendee_id: attendeeId,
      event_id: eventId || null,
      name: input.name.trim(),
      course: "Bachelor of Engineering",
      stream: input.department,
      batch_year: Number(input.batchYear),
      email: input.email ? input.email.trim() : null,
      mobile: input.mobile.trim(),
      status: "Walk-In",
      food_preference: input.foodPreference,
      family_members: Number(input.familyMembers) || 0,
      gender: null,
      city: input.city ? input.city.trim() : null,
      company: input.company ? input.company.trim() : null,
      registration_type: "Walk-In",
      payment_status: "Paid",
      payment_mode: input.paymentMode,
      amount_paid: totalAmount,
      membership_amount: membershipAmount,
      contribution_amount: contributionAmount,
      remarks: input.remarks ? input.remarks.trim() : null,
      checked_in: true,
      checked_in_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    const newAttendee = await attendeeRepository.insertAttendee(payload);
    if (!newAttendee) {
      throw new Error("Failed to save registration record. Please try again.");
    }

    return newAttendee;
  }

  /**
   * Search attendees for check-in desks.
   */
  async searchAttendees(filters: AttendeeFilters): Promise<Attendee[]> {
    return attendeeRepository.getAttendees(filters);
  }

  /**
   * Check in an attendee with payment reconciliation.
   */
  async checkInAttendee(
    attendeeId: string,
    updates: CheckInUpdateInput
  ): Promise<Attendee> {
    const existing = await attendeeRepository.getAttendeeById(attendeeId);
    if (!existing) {
      throw new Error(`Attendee ID ${attendeeId} not found.`);
    }

    const membershipAmount =
      updates.membershipAmount !== undefined
        ? Number(updates.membershipAmount)
        : Number(existing.membership_amount) || 0;

    const contributionAmount =
      updates.contributionAmount !== undefined
        ? Number(updates.contributionAmount)
        : Number(existing.contribution_amount) || 0;

    const totalPaid =
      updates.amountPaid !== undefined
        ? Number(updates.amountPaid)
        : membershipAmount + contributionAmount;

    const patch: Partial<Attendee> = {
      checked_in: true,
      checked_in_at: new Date().toISOString(),
      payment_status: updates.paymentStatus || "Paid",
      amount_paid: totalPaid,
      membership_amount: membershipAmount,
      contribution_amount: contributionAmount,
    };

    if (updates.mobile) patch.mobile = updates.mobile.trim();
    if (updates.email !== undefined) patch.email = updates.email ? updates.email.trim() : null;
    if (updates.paymentMode) patch.payment_mode = updates.paymentMode;
    if (updates.remarks) patch.remarks = updates.remarks.trim();

    const updated = await attendeeRepository.updateAttendee(attendeeId, patch);
    if (!updated) {
      throw new Error("Failed to update check-in status.");
    }
    return updated;
  }

  /**
   * Dashboard metrics and analytics.
   */
  async getDashboardSummary(eventId?: string): Promise<{
    metrics: EventMetrics;
    batchAnalytics: { category: string; count: number }[];
    departmentAnalytics: { category: string; count: number }[];
    recentAttendees: Attendee[];
  }> {
    const [metrics, attendees] = await Promise.all([
      attendeeRepository.getMetrics(eventId),
      attendeeRepository.getAttendees({ eventId, limit: 1000 }),
    ]);

    const batchMap = new Map<string, number>();
    const deptMap = new Map<string, number>();

    for (const a of attendees) {
      const b = a.batch_year ? a.batch_year.toString() : "Unknown";
      batchMap.set(b, (batchMap.get(b) || 0) + 1);

      const d = (a.stream as string) || "Unknown";
      deptMap.set(d, (deptMap.get(d) || 0) + 1);
    }

    const batchAnalytics = Array.from(batchMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => (a.category > b.category ? 1 : -1));

    const departmentAnalytics = Array.from(deptMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    return {
      metrics,
      batchAnalytics,
      departmentAnalytics,
      recentAttendees: attendees.slice(0, 10),
    };
  }
}

export const attendeeService = new AttendeeService();
