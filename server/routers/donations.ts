import { TRPCError } from "@trpc/server";
import { count, desc, eq, sum } from "drizzle-orm";
import { donations, fundraisingGoals, siteSettings } from "../../drizzle/schema";
import { getDb } from "../db";
import { normalizeRaiselyDonationUrl } from "../raisely";
import { DONATION_TIERS } from "../stripe";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";

export const donationsRouter = router({
  /**
   * Compatibility bridge for legacy clients. New public donation traffic is
   * sent only to the administrator-configured Raisely hosted campaign; this
   * application never creates payment sessions or receives card data.
   */
  createCheckoutSession: publicProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "The donation destination is temporarily unavailable. Please try again shortly.",
      });
    }

    const [setting] = await db
      .select({ value: siteSettings.value })
      .from(siteSettings)
      .where(eq(siteSettings.settingKey, "raiselyDonationUrl"))
      .limit(1);

    const checkoutUrl = normalizeRaiselyDonationUrl(setting?.value);
    if (!checkoutUrl) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "The Raisely donation campaign has not been configured yet.",
      });
    }

    return { checkoutUrl, provider: "raisely" as const };
  }),

  /** List historical, locally recorded donations for the authenticated user. */
  myDonations: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    return db
      .select()
      .from(donations)
      .where(eq(donations.userId, ctx.user.id))
      .orderBy(desc(donations.createdAt))
      .limit(50);
  }),

  /** Donation tiers are retained as public impact guidance. */
  tiers: publicProcedure.query(() => DONATION_TIERS),

  /**
   * Return the historical locally-recorded total and active campaign goal.
   * Raisely is the payment provider; new Raisely gifts should be reflected in
   * this local progress display through an authorised reporting integration
   * or administrator-managed campaign copy, rather than client-side payment handling.
   */
  fundraisingStats: publicProcedure.query(async () => {
    const db = await getDb();

    let goal = {
      id: 1,
      title: "Annual Education Fund 2026",
      description:
        "Help us provide school fees, meals, books, and mentorship for 500+ children in Zimbabwe this year.",
      goalCents: 1_000_000,
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

    let raisedCents = 0;
    let donorCount = 0;

    if (db) {
      const [aggregate] = await db
        .select({
          totalCents: sum(donations.amountCents),
          donors: count(donations.id),
        })
        .from(donations)
        .where(eq(donations.status, "completed"));

      raisedCents = Number(aggregate?.totalCents ?? 0);
      donorCount = Number(aggregate?.donors ?? 0);
    }

    const deadlineMs = goal.deadline ? new Date(goal.deadline).getTime() : null;
    const daysLeft = deadlineMs
      ? Math.max(0, Math.ceil((deadlineMs - Date.now()) / (1000 * 60 * 60 * 24)))
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
