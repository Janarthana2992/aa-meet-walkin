// ---------------------------------------------------
// SYSTEM CONSTANTS
// ---------------------------------------------------

export const ORGANIZATION_NAME =
  "Institute of Road and Transport Technology Alumni Association";
export const SHORT_ORGANIZATION_NAME = "IRTTAA NuzhAI";

export const BATCH_YEARS = Array.from(
  { length: 2028 - 1988 },
  (_, i) => 1988 + i
).reverse();

export const DEPARTMENTS = [
  "MECH",
  "AUTO",
  "ECE",
  "EEE",
  "CSE",
  "IT",
  "CIVIL",
  "CTRANS",
  "MCA",
] as const;

export type Department = (typeof DEPARTMENTS)[number];

export const MEMBERSHIP_OPTIONS = [
  { label: "None / Not Interested", value: "None", amount: 0 },
  { label: "Life Member - ₹1,000", value: "Life Member", amount: 1000 },
  { label: "Patron Member - ₹5,000", value: "Patron Member", amount: 5000 },
  { label: "Patron Upgrade - ₹4,000", value: "Patron Upgrade", amount: 4000 },
] as const;

export const PAYMENT_MODES = ["Cash", "UPI", "Card", "Online"] as const;
export type PaymentMode = (typeof PAYMENT_MODES)[number];

export const PAYMENT_STATUSES = ["Paid", "Pending", "Waived"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const FOOD_PREFERENCES = [
  "Vegetarian",
  "Non-Vegetarian",
  "Vegan",
] as const;
export type FoodPreference = (typeof FOOD_PREFERENCES)[number];

export const EVENT_STATUSES = [
  "draft",
  "upcoming",
  "ongoing",
  "completed",
] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];
