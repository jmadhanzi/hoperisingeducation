/**
 * Media Library router
 * Admin-only procedures for uploading, listing, and deleting media files.
 * File bytes are stored in S3 via storagePut; metadata lives in mediaFiles table.
 */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, desc } from "drizzle-orm";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { mediaFiles } from "../../drizzle/schema";
import { storagePut } from "../storage";

// ── Admin guard middleware ────────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const mediaRouter = router({
  /**
   * Upload a file from a base64 data URI.
   * The client sends { filename, mimeType, dataUrl, folder?, altText? }.
   */
  upload: adminProcedure
    .input(
      z.object({
        filename: z.string().min(1).max(255),
        mimeType: z.string().min(1).max(100),
        /** Base64-encoded file content (without the data: prefix) */
        base64: z.string().min(1),
        folder: z.string().max(100).default("general"),
        altText: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      // Decode base64 to Buffer
      const buffer = Buffer.from(input.base64, "base64");
      const sizeBytes = buffer.length;

      // Enforce 50 MB limit
      if (sizeBytes > 50 * 1024 * 1024) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "File exceeds 50 MB limit" });
      }

      // Build a unique storage key
      const ext = input.filename.split(".").pop() ?? "bin";
      const safeBase = input.filename
        .replace(/\.[^.]+$/, "")
        .replace(/[^a-z0-9]/gi, "-")
        .toLowerCase()
        .slice(0, 60);
      const storageKey = `media/${input.folder}/${safeBase}-${Date.now()}.${ext}`;

      const { key, url } = await storagePut(storageKey, buffer, input.mimeType);

      const [result] = await db
        .insert(mediaFiles)
        .values({
          key,
          url,
          filename: input.filename,
          mimeType: input.mimeType,
          size: sizeBytes,
          altText: input.altText ?? null,
          folder: input.folder,
          uploadedBy: ctx.user.id,
        })
        .$returningId();

      const [inserted] = await db
        .select()
        .from(mediaFiles)
        .where(eq(mediaFiles.id, result.id));

      return inserted;
    }),

  /** List all media files, newest first. Optionally filter by folder. */
  list: adminProcedure
    .input(
      z.object({
        folder: z.string().optional(),
        limit: z.number().int().min(1).max(200).default(100),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { files: [], total: 0 };

      const { eq: eqOp, and, sql, count } = await import("drizzle-orm");

      const whereClause = input.folder
        ? eqOp(mediaFiles.folder, input.folder)
        : undefined;

      const [{ total }] = await db
        .select({ total: sql<number>`count(*)` })
        .from(mediaFiles)
        .where(whereClause);

      const files = await db
        .select()
        .from(mediaFiles)
        .where(whereClause)
        .orderBy(desc(mediaFiles.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return { files, total: Number(total) };
    }),

  /** Update alt text / caption for a media file. */
  updateAlt: adminProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        altText: z.string().max(500),
        folder: z.string().max(100).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      await db
        .update(mediaFiles)
        .set({
          altText: input.altText,
          ...(input.folder ? { folder: input.folder } : {}),
        })
        .where(eq(mediaFiles.id, input.id));

      const [updated] = await db
        .select()
        .from(mediaFiles)
        .where(eq(mediaFiles.id, input.id));

      if (!updated) throw new TRPCError({ code: "NOT_FOUND" });
      return updated;
    }),

  /** Delete a media file record (the S3 object becomes unreachable). */
  delete: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      await db.delete(mediaFiles).where(eq(mediaFiles.id, input.id));
      return { success: true };
    }),

  /** List distinct folder names for the filter sidebar. */
  folders: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const { sql } = await import("drizzle-orm");
    const rows = await db
      .selectDistinct({ folder: mediaFiles.folder })
      .from(mediaFiles)
      .orderBy(mediaFiles.folder);

    return rows.map((r) => r.folder);
  }),
});
