import { TRPCError } from "@trpc/server";
import { desc, eq, sum, count } from "drizzle-orm";
import type { InsertFundraisingGoal } from "../../drizzle/schema";
import { z } from "zod";
import { getDb } from "../db";
import { donations, fundraisingGoals } from "../../drizzle/schema";
import { adminProcedure, router } from "../_core/trpc";

export const adminRouter = router({
  /**
   * Get the last 50 donations with donor info, amount, status, and date.
   * Admin-only.
   */
  recentDonors: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const rows = await db
      .select({
        id: donations.id,
        donorName: donations.donorName,
        donorEmail: donations.donorEmail,
        amountCents: donations.amountCents,
        currency: donations.currency,
        status: donations.status,
        isRecurring: donations.isRecurring,
        message: donations.message,
        stripeSessionId: donations.stripeSessionId,
        createdAt: donations.createdAt,
      })
      .from(donations)
      .orderBy(desc(donations.createdAt))
      .limit(50);

    return rows;
  }),

  /**
   * Get overall campaign stats for the admin dashboard header cards.
   * Admin-only.
   */
  campaignStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    // Active campaign
    const [activeGoal] = await db
      .select()
      .from(fundraisingGoals)
      .where(eq(fundraisingGoals.isActive, true))
      .limit(1);

    // Aggregate all donations by status
    const allAgg = await db
      .select({
        status: donations.status,
        totalCents: sum(donations.amountCents),
        donors: count(donations.id),
      })
      .from(donations)
      .groupBy(donations.status);

    const completedRow = allAgg.find(r => r.status === "completed");
    const pendingRow = allAgg.find(r => r.status === "pending");
    const failedRow = allAgg.find(r => r.status === "failed");
    const refundedRow = allAgg.find(r => r.status === "refunded");

    const raisedCents = Number(completedRow?.totalCents ?? 0);
    const donorCount = Number(completedRow?.donors ?? 0);
    const pendingCount = Number(pendingRow?.donors ?? 0);
    const failedCount = Number(failedRow?.donors ?? 0);
    const refundedCount = Number(refundedRow?.donors ?? 0);
    const totalTransactions = allAgg.reduce((acc, r) => acc + Number(r.donors ?? 0), 0);

    const goalCents = activeGoal?.goalCents ?? 1_000_000;
    const percentComplete = goalCents > 0 ? Math.min(100, Math.round((raisedCents / goalCents) * 100)) : 0;

    const deadlineMs = activeGoal?.deadline ? new Date(activeGoal.deadline).getTime() : null;
    const daysLeft = deadlineMs
      ? Math.max(0, Math.ceil((deadlineMs - Date.now()) / (1000 * 60 * 60 * 24)))
      : null;

    return {
      campaign: activeGoal ?? null,
      raisedCents,
      goalCents,
      percentComplete,
      donorCount,
      pendingCount,
      failedCount,
      refundedCount,
      totalTransactions,
      daysLeft,
    };
  }),

  /**
   * Update the active campaign's goal amount and/or deadline.
   * Admin-only.
   */
  updateCampaignGoal: adminProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        goalCents: z.number().int().min(100).max(100_000_000).optional(),
        deadline: z.string().datetime({ offset: true }).nullable().optional(),
        title: z.string().min(3).max(255).optional(),
        description: z.string().max(1000).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const updateData: Partial<InsertFundraisingGoal> = {};
      if (input.goalCents !== undefined) updateData.goalCents = input.goalCents;
      if (input.title !== undefined) updateData.title = input.title;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.deadline !== undefined) {
        updateData.deadline = input.deadline ? new Date(input.deadline) : null;
      }

      if (Object.keys(updateData).length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No fields to update" });
      }

      await db
        .update(fundraisingGoals)
        .set(updateData)
        .where(eq(fundraisingGoals.id, input.id));

      const [updated] = await db
        .select()
        .from(fundraisingGoals)
        .where(eq(fundraisingGoals.id, input.id))
        .limit(1);

      return updated ?? null;
    }),
});
