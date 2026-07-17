/**
 * Announcements router
 *
 * Public procedures:
 *   announcements.listActive — currently visible announcements (respects schedule + isActive)
 *
 * Admin-only procedures (role === "admin"):
 *   announcements.listAll  — all announcements including inactive/scheduled
 *   announcements.create   — create a new announcement
 *   announcements.update   — update an existing announcement
 *   announcements.delete   — permanently delete an announcement
 */
import { eq, desc, and, lte, or, isNull, gte } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { announcements } from "../../drizzle/schema";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";

// ── Helpers ────────────────────────────────────────────────────────────────────

function adminGuard(role: string | undefined) {
  if (role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
}

/**
 * Strip all HTML tags except a safe allowlist: <b>, <strong>, <em>, <i>, <a>, <br>.
 * Prevents XSS while preserving basic rich text.
 */
function sanitizeHtml(input: string): string {
  // Remove all tags not in the allowlist
  return input
    .replace(/<(?!\/?(?:b|strong|em|i|br|a)(?:\s[^>]*)?>)[^>]+>/gi, "")
    // Remove javascript: hrefs
    .replace(/href\s*=\s*["']?\s*javascript:[^"'\s>]*/gi, 'href="#"')
    // Remove event handlers
    .replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, "");
}

// ── Input schemas ──────────────────────────────────────────────────────────────

const announcementWriteSchema = z.object({
  title: z.string().min(1).max(255),
  body: z.string().min(1),
  publishAt: z.string().datetime().optional().nullable(),
  unpublishAt: z.string().datetime().optional().nullable(),
  isActive: z.boolean().default(true),
});

// ── Router ─────────────────────────────────────────────────────────────────────

export const announcementsRouter = router({
  // ── Public: list currently visible announcements ──────────────────────────
  listActive: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const now = new Date();

    const rows = await db
      .select()
      .from(announcements)
      .where(
        and(
          eq(announcements.isActive, true),
          // publishAt is null OR publishAt <= now
          or(isNull(announcements.publishAt), lte(announcements.publishAt, now)),
          // unpublishAt is null OR unpublishAt > now
          or(isNull(announcements.unpublishAt), gte(announcements.unpublishAt, now))
        )
      )
      .orderBy(desc(announcements.createdAt));

    return rows;
  }),

  // ── Admin: list all announcements ─────────────────────────────────────────
  listAll: protectedProcedure.query(async ({ ctx }) => {
    adminGuard(ctx.user.role);
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    return db.select().from(announcements).orderBy(desc(announcements.createdAt));
  }),

  // ── Admin: create announcement ────────────────────────────────────────────
  create: protectedProcedure
    .input(announcementWriteSchema)
    .mutation(async ({ input, ctx }) => {
      adminGuard(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const sanitizedBody = sanitizeHtml(input.body);

      await db.insert(announcements).values({
        title: input.title,
        body: sanitizedBody,
        publishAt: input.publishAt ? new Date(input.publishAt) : null,
        unpublishAt: input.unpublishAt ? new Date(input.unpublishAt) : null,
        isActive: input.isActive,
      });

      const [created] = await db
        .select()
        .from(announcements)
        .orderBy(desc(announcements.createdAt))
        .limit(1);

      return created;
    }),

  // ── Admin: update announcement ────────────────────────────────────────────
  update: protectedProcedure
    .input(announcementWriteSchema.extend({ id: z.number().int() }))
    .mutation(async ({ input, ctx }) => {
      adminGuard(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [existing] = await db
        .select({ id: announcements.id })
        .from(announcements)
        .where(eq(announcements.id, input.id))
        .limit(1);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Announcement not found" });

      const sanitizedBody = sanitizeHtml(input.body);

      await db
        .update(announcements)
        .set({
          title: input.title,
          body: sanitizedBody,
          publishAt: input.publishAt ? new Date(input.publishAt) : null,
          unpublishAt: input.unpublishAt ? new Date(input.unpublishAt) : null,
          isActive: input.isActive,
        })
        .where(eq(announcements.id, input.id));

      const [updated] = await db
        .select()
        .from(announcements)
        .where(eq(announcements.id, input.id))
        .limit(1);
      return updated;
    }),

  // ── Admin: delete announcement ────────────────────────────────────────────
  delete: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input, ctx }) => {
      adminGuard(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db.delete(announcements).where(eq(announcements.id, input.id));
      return { success: true };
    }),
});
