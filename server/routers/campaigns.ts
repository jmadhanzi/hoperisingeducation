/**
 * Campaigns router — multi-campaign fundraising system.
 * Public: listActive (all visitors), getFeatured (home page)
 * Admin: listAll, create, update, delete, updateRaised, toggleActive, toggleFeatured
 */
import { z } from "zod";
import { eq, desc, asc, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { campaigns } from "../../drizzle/schema";

// ── helpers ──────────────────────────────────────────────────────────────────

function requireAdmin(role: string) {
  if (role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
}

/** Convert a title to a URL-safe slug */
function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 100);
}

// ── input schemas ─────────────────────────────────────────────────────────────

const campaignInput = z.object({
  title: z.string().min(1).max(255),
  excerpt: z.string().max(500).optional(),
  description: z.string().optional(),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  goalCents: z.number().int().min(0).default(0),
  raisedCents: z.number().int().min(0).default(0),
  currency: z.string().length(3).default("USD"),
  donateUrl: z.string().url().optional().or(z.literal("")),
  deadline: z.date().optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

// ── router ────────────────────────────────────────────────────────────────────

export const campaignsRouter = router({
  /** Public: list all active campaigns ordered by sortOrder then newest first */
  listActive: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(campaigns)
      .where(eq(campaigns.isActive, true))
      .orderBy(asc(campaigns.sortOrder), desc(campaigns.createdAt));
  }),

  /** Public: list featured campaigns for the Home page (max 3) */
  getFeatured: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const rows = await db
      .select()
      .from(campaigns)
      .where(and(eq(campaigns.isActive, true), eq(campaigns.isFeatured, true)))
      .orderBy(asc(campaigns.sortOrder), desc(campaigns.createdAt));
    return rows.slice(0, 3);
  }),

  /** Admin: list all campaigns (active + inactive) */
  listAll: protectedProcedure.query(async ({ ctx }) => {
    requireAdmin(ctx.user.role);
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(campaigns)
      .orderBy(asc(campaigns.sortOrder), desc(campaigns.createdAt));
  }),

  /** Admin: create a new campaign */
  create: protectedProcedure.input(campaignInput).mutation(async ({ ctx, input }) => {
    requireAdmin(ctx.user.role);
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
    const slug = toSlug(input.title) + "-" + Date.now().toString(36);
    await db.insert(campaigns).values({
      slug,
      title: input.title,
      excerpt: input.excerpt ?? null,
      description: input.description ?? null,
      coverImageUrl: input.coverImageUrl || null,
      goalCents: input.goalCents,
      raisedCents: input.raisedCents,
      currency: input.currency,
      donateUrl: input.donateUrl || null,
      deadline: input.deadline ?? null,
      isActive: input.isActive,
      isFeatured: input.isFeatured,
      sortOrder: input.sortOrder,
    });
    return { success: true };
  }),

  /** Admin: update an existing campaign */
  update: protectedProcedure
    .input(z.object({ id: z.number().int(), data: campaignInput }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      await db
        .update(campaigns)
        .set({
          title: input.data.title,
          excerpt: input.data.excerpt ?? null,
          description: input.data.description ?? null,
          coverImageUrl: input.data.coverImageUrl || null,
          goalCents: input.data.goalCents,
          raisedCents: input.data.raisedCents,
          currency: input.data.currency,
          donateUrl: input.data.donateUrl || null,
          deadline: input.data.deadline ?? null,
          isActive: input.data.isActive,
          isFeatured: input.data.isFeatured,
          sortOrder: input.data.sortOrder,
        })
        .where(eq(campaigns.id, input.id));
      return { success: true };
    }),

  /** Admin: update only the raisedCents field (quick update from dashboard) */
  updateRaised: protectedProcedure
    .input(z.object({ id: z.number().int(), raisedCents: z.number().int().min(0) }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      await db
        .update(campaigns)
        .set({ raisedCents: input.raisedCents })
        .where(eq(campaigns.id, input.id));
      return { success: true };
    }),

  /** Admin: toggle isActive */
  toggleActive: protectedProcedure
    .input(z.object({ id: z.number().int(), isActive: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      await db
        .update(campaigns)
        .set({ isActive: input.isActive })
        .where(eq(campaigns.id, input.id));
      return { success: true };
    }),

  /** Admin: toggle isFeatured */
  toggleFeatured: protectedProcedure
    .input(z.object({ id: z.number().int(), isFeatured: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      await db
        .update(campaigns)
        .set({ isFeatured: input.isFeatured })
        .where(eq(campaigns.id, input.id));
      return { success: true };
    }),

  /** Admin: delete a campaign */
  delete: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      await db.delete(campaigns).where(eq(campaigns.id, input.id));
      return { success: true };
    }),
});
