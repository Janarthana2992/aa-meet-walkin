import { z } from "zod";
import { DEPARTMENTS, FOOD_PREFERENCES, PAYMENT_MODES, PAYMENT_STATUSES } from "../constants";

export const walkInRegistrationSchema = z.object({
  eventId: z.string().uuid("Invalid event ID").optional().nullable(),
  name: z.string().trim().min(2, "Full name must be at least 2 characters"),
  batchYear: z.coerce.number().int().min(1980).max(2035),
  department: z.string().min(1, "Please select a department"),
  mobile: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),
  email: z.string().trim().email("Invalid email address").or(z.literal("")),
  city: z.string().trim().optional(),
  company: z.string().trim().optional(),
  foodPreference: z.enum(FOOD_PREFERENCES).default("Vegetarian"),
  familyMembers: z.coerce.number().int().min(0).default(0),
  paymentMode: z.enum(PAYMENT_MODES).default("UPI"),
  membershipType: z.string().default("None"),
  membershipAmount: z.coerce.number().min(0).default(0),
  contributionAmount: z.coerce.number().min(0).default(0),
  remarks: z.string().trim().optional(),
});

export type WalkInRegistrationInput = z.infer<typeof walkInRegistrationSchema>;

export const checkInUpdateSchema = z.object({
  mobile: z.string().trim().regex(/^[0-9]{10}$/, "Mobile number must be 10 digits").optional(),
  email: z.string().trim().email().or(z.literal("")).optional(),
  amountPaid: z.coerce.number().min(0).optional(),
  membershipAmount: z.coerce.number().min(0).optional(),
  contributionAmount: z.coerce.number().min(0).optional(),
  paymentMode: z.enum(PAYMENT_MODES).optional(),
  paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
  remarks: z.string().optional(),
});

export type CheckInUpdateInput = z.infer<typeof checkInUpdateSchema>;
