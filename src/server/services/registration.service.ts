import { eventService } from "./event.service";
import { memberRepository } from "../repositories/member.repository";
import { preRegistrationRepository } from "../repositories/preRegistration.repository";
import {
  RegistrationFilters,
  registrationRepository,
} from "../repositories/registration.repository";
import {
  AdminUpdateRegistrationInput,
  EventRegistrationInput,
} from "../validators/registration.validator";
import { normalizeEmail, normalizeMobile } from "../utils/csv";
import {
  CategoryCount,
  EventAnalyticsMetrics,
  EventRegistration,
  VenueLookupResult,
} from "@/types/database.types";

export class RegistrationService {
  /**
   * Venue Autofill Lookup Flow:
   * 1. Check if already checked-in/registered in `event_registrations` for this event.
   * 2. Check `event_pre_registrations` for this event (by email or mobile).
   * 3. Fallback to `association_members` (by email or mobile).
   * 4. Otherwise return `NONE` so attendee fills out the complete form.
   */
  async lookupForVenue(
    query: string,
    providedEventId?: number
  ): Promise<VenueLookupResult> {
    let eventId = providedEventId;
    if (!eventId) {
      const activeEvent = await eventService.getActiveEvent();
      if (!activeEvent) {
        throw new Error("No active event found.");
      }
      eventId = activeEvent.event_id;
    }

    // 1. Check if already registered at venue for this event
    const existingReg = await registrationRepository.findByEventAndEmailOrMobile(
      eventId,
      query
    );
    if (existingReg) {
      return {
        found: true,
        source:
          existingReg.registration_source === "PRE_REGISTERED"
            ? "PRE_REGISTERED"
            : "ASSOCIATION_MEMBER",
        alreadyRegistered: true,
        existingRegistration: existingReg,
        computedRegistrationFee: Number(existingReg.registration_fee) || 0,
        prefill: null,
      };
    }

    // 2. Check event_pre_registrations
    const preReg = await preRegistrationRepository.findByEventAndEmailOrMobile(
      eventId,
      query
    );
    if (preReg) {
      const fee = await eventService.calculateRegistrationFee(
        eventId,
        preReg.graduating_year,
        preReg.membership_type
      );

      return {
        found: true,
        source: "PRE_REGISTERED",
        alreadyRegistered: false,
        existingRegistration: null,
        computedRegistrationFee: fee,
        prefill: {
          member_login_id: preReg.member_login_id,
          full_name: preReg.full_name,
          email: preReg.email,
          mobile: preReg.mobile || "",
          course: preReg.course || "BE",
          stream: preReg.stream || "CSE",
          graduating_year: preReg.graduating_year,
          membership_type_used: preReg.membership_type,
          recognized_member: Boolean(preReg.member_login_id),
          food_preference: preReg.food_preference || "Vegetarian",
          accompanying_alumni_count: preReg.accompanying_alumni_count || 0,
          accompanying_family_count: preReg.accompanying_family_count || 0,
        },
      };
    }

    // 3. Check association_members
    const member = await memberRepository.findByEmailOrMobile(query);
    if (member) {
      const fee = await eventService.calculateRegistrationFee(
        eventId,
        member.graduating_year,
        member.membership_type
      );

      return {
        found: true,
        source: "ASSOCIATION_MEMBER",
        alreadyRegistered: false,
        existingRegistration: null,
        computedRegistrationFee: fee,
        prefill: {
          member_login_id: member.member_login_id,
          full_name: member.full_name,
          email: member.email,
          mobile: member.mobile || "",
          course: member.course || "BE",
          stream: member.stream || "CSE",
          graduating_year: member.graduating_year,
          membership_type_used: member.membership_type,
          recognized_member: true,
          food_preference: "Vegetarian",
          accompanying_alumni_count: 0,
          accompanying_family_count: 0,
        },
      };
    }

    // 4. Not found anywhere -> complete manual form
    return {
      found: false,
      source: "NONE",
      alreadyRegistered: false,
      existingRegistration: null,
      computedRegistrationFee: 0,
      prefill: null,
    };
  }

  /**
   * Submits final venue registration & check-in snapshot into `event_registrations`.
   */
  async submitRegistration(
    input: EventRegistrationInput
  ): Promise<EventRegistration> {
    const cleanEmail = normalizeEmail(input.email);

    const existing = await registrationRepository.findByEventAndEmail(
      input.eventId,
      cleanEmail
    );
    if (existing) {
      throw new Error(
        `${existing.full_name} (${cleanEmail}) is already checked in for this event.`
      );
    }

    const registrationFee = await eventService.calculateRegistrationFee(
      input.eventId,
      input.graduatingYear,
      input.membershipTypeUsed
    );
    const voluntaryContribution = Math.max(
      0,
      Number(input.voluntaryContribution) || 0
    );
    const totalAmount = registrationFee + voluntaryContribution;
    const paymentRequired = totalAmount > 0;

    let paymentMode = input.paymentMode || null;
    let utrLast4 = input.utrLast4 ? input.utrLast4.trim() : null;

    if (paymentRequired) {
      if (!paymentMode) {
        throw new Error("Please select a payment mode (ONLINE or CASH).");
      }
      if (paymentMode === "ONLINE") {
        if (!utrLast4 || !/^[0-9]{4}$/.test(utrLast4)) {
          throw new Error(
            "Please enter the last 4 digits of your UPI/UTR transaction reference."
          );
        }
      } else {
        utrLast4 = null;
      }
    } else {
      paymentMode = null;
      utrLast4 = null;
    }

    const nowIso = new Date().toISOString();

    return registrationRepository.insertRegistration({
      event_id: input.eventId,
      member_login_id: input.memberLoginId || null,
      full_name: input.fullName.trim(),
      email: cleanEmail,
      mobile: normalizeMobile(input.mobile),
      course: input.course || null,
      stream: input.stream || null,
      graduating_year: input.graduatingYear,
      membership_type_used: input.membershipTypeUsed,
      registration_source: input.registrationSource,
      recognized_member: input.recognizedMember,
      food_preference: input.foodPreference || "Vegetarian",
      accompanying_alumni_count: Number(input.accompanyingAlumniCount) || 0,
      accompanying_family_count: Number(input.accompanyingFamilyCount) || 0,
      registration_fee: registrationFee,
      voluntary_contribution: voluntaryContribution,
      total_amount: totalAmount,
      payment_required: paymentRequired,
      payment_mode: paymentMode,
      payment_confirmed: true,
      utr_last4: utrLast4,
      paid_at: paymentRequired ? nowIso : null,
      checked_in_at: nowIso,
    });
  }

  async listRegistrations(
    filters: RegistrationFilters
  ): Promise<EventRegistration[]> {
    return registrationRepository.listRegistrations(filters);
  }

  async updateRegistration(
    registrationId: number,
    input: AdminUpdateRegistrationInput
  ): Promise<EventRegistration> {
    const updates: Partial<EventRegistration> = {};
    if (input.fullName !== undefined) updates.full_name = input.fullName;
    if (input.email !== undefined) updates.email = normalizeEmail(input.email);
    if (input.mobile !== undefined) updates.mobile = normalizeMobile(input.mobile);
    if (input.course !== undefined) updates.course = input.course;
    if (input.stream !== undefined) updates.stream = input.stream;
    if (input.graduatingYear !== undefined)
      updates.graduating_year = input.graduatingYear;
    if (input.foodPreference !== undefined)
      updates.food_preference = input.foodPreference;
    if (input.accompanyingAlumniCount !== undefined)
      updates.accompanying_alumni_count = input.accompanyingAlumniCount;
    if (input.accompanyingFamilyCount !== undefined)
      updates.accompanying_family_count = input.accompanyingFamilyCount;

    if (
      input.registrationFee !== undefined ||
      input.voluntaryContribution !== undefined
    ) {
      const fee = Number(input.registrationFee ?? 0);
      const contrib = Number(input.voluntaryContribution ?? 0);
      updates.registration_fee = fee;
      updates.voluntary_contribution = contrib;
      updates.total_amount = fee + contrib;
      updates.payment_required = updates.total_amount > 0;
    }

    if (input.paymentMode !== undefined) updates.payment_mode = input.paymentMode;
    if (input.paymentConfirmed !== undefined)
      updates.payment_confirmed = input.paymentConfirmed;
    if (input.utrLast4 !== undefined) updates.utr_last4 = input.utrLast4;

    return registrationRepository.updateRegistration(registrationId, updates);
  }

  async deleteRegistration(registrationId: number): Promise<boolean> {
    return registrationRepository.deleteRegistration(registrationId);
  }

  /**
   * Computes rich analytics for an event (or across all events if omitted).
   */
  async getDashboardAnalytics(eventId?: number): Promise<{
    metrics: EventAnalyticsMetrics;
    batchAnalytics: CategoryCount[];
    streamAnalytics: CategoryCount[];
    foodAnalytics: CategoryCount[];
    recentRegistrations: EventRegistration[];
  }> {
    const [registrations, preRegCount] = await Promise.all([
      registrationRepository.listRegistrations({ eventId }),
      eventId
        ? preRegistrationRepository.getCountByEvent(eventId)
        : Promise.resolve(0),
    ]);

    const metrics: EventAnalyticsMetrics = {
      total_registrations: registrations.length,
      pre_registered_checked_in: 0,
      on_spot_registrations: 0,
      recognized_members_count: 0,
      pre_registrations_imported: preRegCount,
      total_registration_fee: 0,
      total_voluntary_contribution: 0,
      total_collected: 0,
      online_collected: 0,
      cash_collected: 0,
      total_accompanying_alumni: 0,
      total_accompanying_family: 0,
      total_headcount: 0,
    };

    const batchMap = new Map<string, { count: number; amount: number }>();
    const streamMap = new Map<string, number>();
    const foodMap = new Map<string, number>();

    for (const reg of registrations) {
      if (reg.registration_source === "PRE_REGISTERED") {
        metrics.pre_registered_checked_in += 1;
      } else {
        metrics.on_spot_registrations += 1;
      }

      if (reg.recognized_member) {
        metrics.recognized_members_count += 1;
      }

      const fee = Number(reg.registration_fee) || 0;
      const contrib = Number(reg.voluntary_contribution) || 0;
      const total = Number(reg.total_amount) || 0;

      metrics.total_registration_fee += fee;
      metrics.total_voluntary_contribution += contrib;
      metrics.total_collected += total;

      if (reg.payment_mode === "ONLINE") {
        metrics.online_collected += total;
      } else if (reg.payment_mode === "CASH") {
        metrics.cash_collected += total;
      }

      const alumExtra = Number(reg.accompanying_alumni_count) || 0;
      const famExtra = Number(reg.accompanying_family_count) || 0;
      metrics.total_accompanying_alumni += alumExtra;
      metrics.total_accompanying_family += famExtra;
      metrics.total_headcount += 1 + alumExtra + famExtra;

      const batchKey = reg.graduating_year
        ? reg.graduating_year.toString()
        : "Unknown";
      const prevBatch = batchMap.get(batchKey) || { count: 0, amount: 0 };
      batchMap.set(batchKey, {
        count: prevBatch.count + 1,
        amount: prevBatch.amount + total,
      });

      const streamKey = reg.stream || "Unknown";
      streamMap.set(streamKey, (streamMap.get(streamKey) || 0) + 1);

      const foodKey = reg.food_preference || "Vegetarian";
      foodMap.set(foodKey, (foodMap.get(foodKey) || 0) + 1);
    }

    const batchAnalytics: CategoryCount[] = Array.from(batchMap.entries())
      .map(([category, info]) => ({
        category,
        count: info.count,
        amount: info.amount,
      }))
      .sort((a, b) => (a.category > b.category ? 1 : -1));

    const streamAnalytics: CategoryCount[] = Array.from(streamMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    const foodAnalytics: CategoryCount[] = Array.from(foodMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    return {
      metrics,
      batchAnalytics,
      streamAnalytics,
      foodAnalytics,
      recentRegistrations: registrations.slice(0, 15),
    };
  }
}

export const registrationService = new RegistrationService();
