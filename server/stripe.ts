import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-06-24.dahlia",
});

/**
 * Predefined donation tiers for Hope Rising Education.
 * Amounts are in USD cents.
 */
export const DONATION_TIERS = [
  {
    id: "tier_25",
    label: "Supporter",
    amountCents: 2500,
    description: "Provides a week of school supplies for one child",
  },
  {
    id: "tier_50",
    label: "Champion",
    amountCents: 5000,
    description: "Covers a month of nutritious meals for one child",
  },
  {
    id: "tier_100",
    label: "Advocate",
    amountCents: 10000,
    description: "Funds a full term of tutoring and mentorship",
  },
  {
    id: "tier_250",
    label: "Benefactor",
    amountCents: 25000,
    description: "Sponsors a child's school fees for an entire year",
  },
  {
    id: "tier_500",
    label: "Patron",
    amountCents: 50000,
    description: "Transforms an entire classroom with resources",
  },
  {
    id: "tier_1000",
    label: "Visionary",
    amountCents: 100000,
    description: "Builds a safe learning environment for 30 children",
  },
] as const;

/**
 * Maps a donation amount to a human-readable impact description.
 * Mirrors client/src/pages/Donate.tsx's IMPACT_MAP so the Stripe checkout
 * page always shows text the server derived from the trusted amount,
 * never arbitrary caller-supplied text.
 */
const IMPACT_MAP: { min: number; max: number; label: string }[] = [
  { min: 0, max: 2499, label: "provides school stationery for one child" },
  { min: 2500, max: 4999, label: "provides a week of school supplies for one child" },
  { min: 5000, max: 9999, label: "covers a month of nutritious meals for one child" },
  { min: 10000, max: 24999, label: "funds a full term of tutoring and mentorship" },
  { min: 25000, max: 49999, label: "sponsors a child's school fees for an entire year" },
  { min: 50000, max: 99999, label: "transforms an entire classroom with resources" },
  { min: 100000, max: Infinity, label: "builds a safe learning environment for 30 children" },
];

export function getImpactDescription(amountCents: number): string {
  const match = IMPACT_MAP.find(r => amountCents >= r.min && amountCents <= r.max);
  return (match ?? IMPACT_MAP[0]).label;
}
