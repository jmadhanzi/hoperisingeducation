import { TRPCError } from "@trpc/server";
import { eq, desc, sum, count, and } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "../db";
import { donations, fundraisingGoals } from "../../drizzle/schema";
import Stripe from "stripe";
import { stripe, DONATION_TIERS } from "../stripe";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";

export const donationsRouter = router({
  /**
   * Create a Stripe Checkout Session for a donation.
   * Works for both anonymous and authenticated donors.
   */
  createCheckoutSession: publicProcedure
    .input(
      z.object({
        amountCents: z.number().int().min(100).max(1000000),
        isRecurring: z.boolean().default(false),
        donorName: z.string().max(255).optional(),
        donorEmail: z.string().email().optional(),
        message: z.string().max(1000).optional(),
        origin: z.string().url(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { amountCents, isRecurring, donorName, donorEmail, message, origin } = input;

      const customerEmail = donorEmail ?? ctx.user?.email ?? undefined;
      const customerName = donorName ?? ctx.user?.name ?? undefined;

      const lineItem: Stripe.Checkout.SessionCreateParams.LineItem[] = [
        {
          price_data: {
            currency: "usd",
            unit_amount: amountCents,
            product_data: {
              name: "Hope Rising Education Donation",
              description: isRecurring
                ? "Monthly recurring donation to support children's education in Zimbabwe"
                : "One-time donation to support children's education in Zimbabwe",
              images: [
                "https://d2xsxph8kpxj0f.cloudfront.net/310519663208076335/8TaPKuh8NEV6zjk5GTYvjo/hero-children-E3Zp4N9BdqMr2BPpEu4Yxq.webp",
              ],
            },
            ...(isRecurring
              ? { recurring: { interval: "month" } }
              : {}),
          },
          quantity: 1,
        },
      ];

      const session = await stripe.checkout.sessions.create({
        mode: isRecurring ? "subscription" : "payment",
        line_items: lineItem,
        customer_email: customerEmail,
        allow_promotion_codes: true,
        client_reference_id: ctx.user?.id?.toString(),
        metadata: {
          user_id: ctx.user?.id?.toString() ?? "",
          customer_email: customerEmail ?? "",
          customer_name: customerName ?? "",
          message: message ?? "",
          is_recurring: isRecurring ? "true" : "false",
        },
        success_url: `${origin}/donate?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/donate?cancelled=true`,
      });

      const db = await getDb();
      if (db) {
        await db.insert(donations).values({
          stripeSessionId: session.id,
          amountCents,
          currency: "usd",
          donorName: customerName ?? null,
          donorEmail: customerEmail ?? null,
          message: message ?? null,
          isRecurring,
          status: "pending",
          userId: ctx.user?.id ?? null,
        });
      }

      return { checkoutUrl: session.url };
    }),

  /**
   * List completed donations for the authenticated user.
   */
  myDonations: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const rows = await db
      .select()
      .from(donations)
      .where(eq(donations.userId, ctx.user.id))
      .orderBy(desc(donations.createdAt))
      .limit(50);

    return rows;
  }),

  /**
   * Get donation tiers for display on the frontend.
   */
  tiers: publicProcedure.query(() => DONATION_TIERS),

  /**
   * Get live fundraising stats for the progress bar.
   * Returns the active campaign goal, total raised (completed donations only),
   * unique donor count, and days remaining.
   * This is a public procedure — no login required.
   */
  fundraisingStats: publicProcedure.query(async () => {
    const db = await getDb();

    // ── Active campaign goal ──────────────────────────────────────────────
    let goal = {
      id: 1,
      title: "Annual Education Fund 2026",
      description:
        "Help us provide school fees, meals, books, and mentorship for 500+ children in Zimbabwe this year.",
      goalCents: 1_000_000, // $10,000 default
      deadline: new Date("2026-12-31T23:59:59Z"),
      isActive: true,
    };

    if (db) {
      const [activeGoal] = await db
        .select()
        .from(fundraisingGoals)
        .where(eq(fundraisingGoals.isActive, true))
        .limit(1);
      if (activeGoal) goal = activeGoal as typeof goal;
    }

    // ── Aggregate completed donations ─────────────────────────────────────
    let raisedCents = 0;
    let donorCount = 0;

    if (db) {
      const [agg] = await db
        .select({
          totalCents: sum(donations.amountCents),
          donors: count(donations.id),
        })
        .from(donations)
        .where(eq(donations.status, "completed"));

      raisedCents = Number(agg?.totalCents ?? 0);
      donorCount = Number(agg?.donors ?? 0);
    }

    // ── Days remaining ────────────────────────────────────────────────────
    const now = Date.now();
    const deadlineMs = goal.deadline ? new Date(goal.deadline).getTime() : null;
    const daysLeft = deadlineMs
      ? Math.max(0, Math.ceil((deadlineMs - now) / (1000 * 60 * 60 * 24)))
      : null;

    const percentComplete = goal.goalCents > 0
      ? Math.min(100, Math.round((raisedCents / goal.goalCents) * 100))
      : 0;

    return {
      campaignTitle: goal.title,
      campaignDescription: goal.description ?? "",
      goalCents: goal.goalCents,
      raisedCents,
      donorCount,
      percentComplete,
      daysLeft,
      deadline: goal.deadline ? goal.deadline.toISOString() : null,
    };
  }),
});
