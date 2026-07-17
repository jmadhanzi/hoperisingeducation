/**
 * Marketing Videos router
 *
 * Public procedures:
 *   videos.listPublished — published videos ordered by sortOrder
 *
 * Admin-only procedures (role === "admin"):
 *   videos.listAll       — all videos (published + unpublished)
 *   videos.upload        — upload a new video file (multipart via base64)
 *   videos.update        — update title / description / thumbnailUrl
 *   videos.reorder       — update sortOrder for multiple videos at once
 *   videos.togglePublish — publish / unpublish a video
 *   videos.delete        — permanently delete a video
 */
import { eq, asc, desc } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { marketingVideos } from "../../drizzle/schema";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { storagePut } from "../storage";

// ── Helpers ────────────────────────────────────────────────────────────────────

function adminGuard(role: string | undefined) {
  if (role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
}

const MAX_VIDEO_BYTES = 200 * 1024 * 1024; // 200 MB
const ALLOWED_MIME_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

// ── Router ─────────────────────────────────────────────────────────────────────

export const videosRouter = router({
  // ── Public: list published videos ─────────────────────────────────────────
  listPublished: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    return db
      .select()
      .from(marketingVideos)
      .where(eq(marketingVideos.isPublished, true))
      .orderBy(asc(marketingVideos.sortOrder), desc(marketingVideos.createdAt));
  }),

  // ── Admin: list all videos ─────────────────────────────────────────────────
  listAll: protectedProcedure.query(async ({ ctx }) => {
    adminGuard(ctx.user.role);
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    return db
      .select()
      .from(marketingVideos)
      .orderBy(asc(marketingVideos.sortOrder), desc(marketingVideos.createdAt));
  }),

  // ── Admin: upload a new video ──────────────────────────────────────────────
  upload: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        description: z.string().max(1000).optional(),
        /** Base64-encoded file content */
        fileBase64: z.string(),
        /** Original filename, e.g. "campaign-video.mp4" */
        filename: z.string().max(255),
        mimeType: z.string().max(100),
        /** File size in bytes (client-reported; validated server-side) */
        size: z.number().int(),
        thumbnailUrl: z.string().url().optional().or(z.literal("")),
      })
    )
    .mutation(async ({ input, ctx }) => {
      adminGuard(ctx.user.role);

      // Validate MIME type
      if (!ALLOWED_MIME_TYPES.includes(input.mimeType)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Unsupported file type: ${input.mimeType}. Allowed: MP4, WebM, MOV.`,
        });
      }

      // Validate size
      if (input.size > MAX_VIDEO_BYTES) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `File too large (${(input.size / 1024 / 1024).toFixed(1)} MB). Maximum is 200 MB.`,
        });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Decode base64 and upload to storage
      const buffer = Buffer.from(input.fileBase64, "base64");
      const safeFilename = input.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storageKey = `marketing-videos/${Date.now()}-${safeFilename}`;

      const { key, url } = await storagePut(storageKey, buffer, input.mimeType);

      // Get current max sortOrder
      const allVideos = await db.select({ sortOrder: marketingVideos.sortOrder }).from(marketingVideos);
      const maxSort = allVideos.reduce((m, v) => Math.max(m, v.sortOrder), -1);

      await db.insert(marketingVideos).values({
        title: input.title,
        description: input.description ?? null,
        storageKey: key,
        url,
        thumbnailUrl: input.thumbnailUrl || null,
        sortOrder: maxSort + 1,
        isPublished: false,
        size: input.size,
      });

      const [created] = await db
        .select()
        .from(marketingVideos)
        .where(eq(marketingVideos.storageKey, key))
        .limit(1);

      return created;
    }),

  // ── Admin: update video metadata ──────────────────────────────────────────
  update: protectedProcedure
    .input(
      z.object({
        id: z.number().int(),
        title: z.string().min(1).max(255),
        description: z.string().max(1000).optional().nullable(),
        thumbnailUrl: z.string().url().optional().or(z.literal("")).nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      adminGuard(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [existing] = await db
        .select({ id: marketingVideos.id })
        .from(marketingVideos)
        .where(eq(marketingVideos.id, input.id))
        .limit(1);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Video not found" });

      await db
        .update(marketingVideos)
        .set({
          title: input.title,
          description: input.description ?? null,
          thumbnailUrl: input.thumbnailUrl || null,
        })
        .where(eq(marketingVideos.id, input.id));

      const [updated] = await db
        .select()
        .from(marketingVideos)
        .where(eq(marketingVideos.id, input.id))
        .limit(1);
      return updated;
    }),

  // ── Admin: reorder videos ─────────────────────────────────────────────────
  reorder: protectedProcedure
    .input(
      z.object({
        /** Array of { id, sortOrder } pairs */
        items: z.array(z.object({ id: z.number().int(), sortOrder: z.number().int() })),
      })
    )
    .mutation(async ({ input, ctx }) => {
      adminGuard(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      for (const item of input.items) {
        await db
          .update(marketingVideos)
          .set({ sortOrder: item.sortOrder })
          .where(eq(marketingVideos.id, item.id));
      }

      return { success: true };
    }),

  // ── Admin: toggle publish ─────────────────────────────────────────────────
  togglePublish: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input, ctx }) => {
      adminGuard(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [video] = await db
        .select({ id: marketingVideos.id, isPublished: marketingVideos.isPublished })
        .from(marketingVideos)
        .where(eq(marketingVideos.id, input.id))
        .limit(1);
      if (!video) throw new TRPCError({ code: "NOT_FOUND", message: "Video not found" });

      const nowPublished = !video.isPublished;
      await db
        .update(marketingVideos)
        .set({ isPublished: nowPublished })
        .where(eq(marketingVideos.id, input.id));

      return { id: input.id, isPublished: nowPublished };
    }),

  // ── Admin: delete video ───────────────────────────────────────────────────
  delete: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input, ctx }) => {
      adminGuard(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db.delete(marketingVideos).where(eq(marketingVideos.id, input.id));
      return { success: true };
    }),
});
