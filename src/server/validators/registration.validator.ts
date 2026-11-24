import { z } from "zod";
import {
  PAYMENT_MODES,
  REGISTRATION_MEMBERSHIP_TYPES,
  REGISTRATION_SOURCES,
} from "../constants";

export const venueLookupSchema = z.object({
  eventId: z.coerce.number().int().positive().optional(),
  query: z.string().trim().min(3, "Please enter your email or mobile number"),
});

export type VenueLookupInput = z.infer<typeof venueLookupSchema>;

export const eventRegistrationSchema = z.object({
  eventId: z.coerce.number().int().positive("Valid active event ID is required"),
  memberLoginId: z.string().trim().optional().nullable(),
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  mobile: z.string().trim().min(7, "Please enter a valid mobile number").max(20),
  course: z.string().trim().optional().nullable(),
  stream: z.string().trim().optional().nullable(),
  graduatingYear: z.coerce
    .number()
    .int()
    .min(1980, "Graduating year must be 1980 or later")
    .max(2035, "Graduating year must be 2035 or earlier"),
  membershipTypeUsed: z
    .enum(REGISTRATION_MEMBERSHIP_TYPES)
    .default("UNREGISTERED_MEMBER"),
  registrationSource: z.enum(REGISTRATION_SOURCES).default("ON_SPOT"),
  recognizedMember: z.boolean().default(false),
  foodPreference: z.string().trim().default("Vegetarian"),
  accompanyingAlumniCount: z.coerce.number().int().min(0).default(0),
  accompanyingFamilyCount: z.coerce.number().int().min(0).default(0),
  voluntaryContribution: z.coerce.number().min(0).default(0),
  paymentMode: z.enum(PAYMENT_MODES).optional().nullable(),
  utrLast4: z.string().trim().optional().nullable(),
});

export type EventRegistrationInput = z.infer<typeof eventRegistrationSchema>;

export const adminUpdateRegistrationSchema = z.object({
  fullName: z.string().trim().min(2).optional(),
  email: z.string().trim().email().optional(),
  mobile: z.string().trim().max(20).optional().nullable(),
  course: z.string().trim().optional().nullable(),
  stream: z.string().trim().optional().nullable(),
  graduatingYear: z.coerce.number().int().min(1980).max(2035).optional().nullable(),
  foodPreference: z.string().trim().optional().nullable(),
  accompanyingAlumniCount: z.coerce.number().int().min(0).optional(),
  accompanyingFamilyCount: z.coerce.number().int().min(0).optional(),
  registrationFee: z.coerce.number().min(0).optional(),
  voluntaryContribution: z.coerce.number().min(0).optional(),
  paymentMode: z.enum(PAYMENT_MODES).optional().nullable(),
  paymentConfirmed: z.boolean().optional(),
  utrLast4: z.string().trim().max(4).optional().nullable(),
});

export type AdminUpdateRegistrationInput = z.infer<
  typeof adminUpdateRegistrationSchema
>;
