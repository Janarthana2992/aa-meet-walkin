import { z } from "zod";
import { EVENT_STATUSES } from "../constants";

export const eventSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  slug: z
    .string()
    .trim()
    .min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().trim().optional(),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Event date must be in YYYY-MM-DD format"),
  eventTime: z.string().trim().optional(),
  location: z.string().trim().min(2, "Location is required"),
  venueDetails: z.string().trim().optional(),
  status: z.enum(EVENT_STATUSES).default("upcoming"),
  bannerUrl: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  registrationOpen: z.boolean().default(true),
});

export type EventInput = z.infer<typeof eventSchema>;
