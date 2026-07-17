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
