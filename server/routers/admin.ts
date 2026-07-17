import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, like, or, sum } from "drizzle-orm";
import { z } from "zod";
import type { InsertFundraisingGoal } from "../../drizzle/schema";
import {
  announcements,
  donations,
  fundraisingGoals,
  marketingVideos,
  registrations,
  siteContent,
  siteSettings,
} from "../../drizzle/schema";
import { getDb } from "../db";
import { storagePut } from "../storage";
import { isRaiselyDonationUrl, normalizeRaiselyDonationUrl } from "../raisely";
import { adminProcedure, router } from "../_core/trpc";

const MAX_VIDEO_BYTES = 20 * 1024 * 1024;
const videoMimeTypes = ["video/mp4", "video/webm", "video/quicktime"] as const;
const externalOrManagedUrl = z
  .string()
  .trim()
  .min(1)
  .max(1024)
  .refine(value => value.startsWith("/manus-storage/") || /^https:\/\//i.test(value), {
    message: "Use a secure HTTPS URL or a managed storage URL.",
  });

const contentInput = z.object({
  page: z.string().trim().min(1).max(80).regex(/^[a-z0-9-]+$/),
  contentKey: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/),
  label: z.string().trim().min(1).max(255),
  value: z.string().trim().min(1).max(20_000),
  isPublished: z.boolean(),
});

const marketingVideoInput = z.object({
  id: z.number().int().positive().optional(),
  title: z.string().trim().min(2).max(255),
  description: z.string().trim().max(4_000).nullable().optional(),
  videoUrl: externalOrManagedUrl,
  thumbnailUrl: externalOrManagedUrl.nullable().optional(),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
});

const announcementInput = z.object({
  id: z.number().int().positive().optional(),
  title: z.string().trim().min(2).max(255),
  body: z.string().trim().min(2).max(5_000),
  ctaLabel: z.string().trim().max(80).nullable().optional(),
  ctaUrl: externalOrManagedUrl.nullable().optional(),
  isActive: z.boolean(),
  startsAt: z.string().datetime({ offset: true }).nullable().optional(),
  endsAt: z.string().datetime({ offset: true }).nullable().optional(),
});

function databaseUnavailable(): TRPCError {
  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Database unavailable. Please try again shortly.",
  });
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const normalized = String(value).replace(/\r?\n/g, " ");
  const safe = /^[=+\-@]/.test(normalized) ? `'${normalized}` : normalized;
  return `"${safe.replace(/"/g, '""')}"`;
}

function registrationsToCsv(rows: Array<typeof registrations.$inferSelect>): string {
  const headings = [
    "ID",
    "Type",
    "Status",
    "Name",
    "Email",
    "Phone",
    "Subject",
    "Interest",
    "Location",
    "Skills",
    "Hours per week",
    "Message",
    "Submitted at",
  ];
  const body = rows.map(row => [
    row.id,
    row.type,
    row.status,
    row.name,
    row.email,
    row.phone,
    row.subject,
    row.interest,
    row.location,
    row.skills,
    row.hoursPerWeek,
    row.message,
    row.createdAt?.toISOString?.() ?? row.createdAt,
  ].map(csvCell).join(","));

  return [headings.map(csvCell).join(","), ...body].join("\r\n");
}

async function getRegistrationsForAdmin(input: {
  type: "all" | "contact" | "volunteer";
  status: "all" | "new" | "in_progress" | "archived";
  search?: string;
}) {
  const db = await getDb();
  if (!db) throw databaseUnavailable();

  const conditions = [];
  if (input.type !== "all") conditions.push(eq(registrations.type, input.type));
  if (input.status !== "all") conditions.push(eq(registrations.status, input.status));
  if (input.search?.trim()) {
    const term = `%${escapeLike(input.search.trim())}%`;
    const searchFilter = or(
      like(registrations.name, term),
      like(registrations.email, term),
      like(registrations.phone, term),
      like(registrations.subject, term),
      like(registrations.interest, term),
    );
    if (searchFilter) conditions.push(searchFilter);
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const query = db.select().from(registrations);
  return whereClause
    ? query.where(whereClause).orderBy(desc(registrations.createdAt)).limit(500)
    : query.orderBy(desc(registrations.createdAt)).limit(500);
}

/**
 * Protected administrator operations. Every procedure is guarded by the
 * server-side role and approved-email middleware in adminProcedure.
 */
export const adminRouter = router({
  /** Get the last 50 historical donation rows. */
  recentDonors: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw databaseUnavailable();

    return db
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
  }),

  /** Get historical fundraising totals and the active campaign. */
  campaignStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw databaseUnavailable();

    const [activeGoal] = await db
      .select()
      .from(fundraisingGoals)
      .where(eq(fundraisingGoals.isActive, true))
      .limit(1);

    const allAgg = await db
      .select({
        status: donations.status,
        totalCents: sum(donations.amountCents),
        donors: count(donations.id),
      })
      .from(donations)
      .groupBy(donations.status);

    const completedRow = allAgg.find(row => row.status === "completed");
    const pendingRow = allAgg.find(row => row.status === "pending");
    const failedRow = allAgg.find(row => row.status === "failed");
    const refundedRow = allAgg.find(row => row.status === "refunded");

    const raisedCents = Number(completedRow?.totalCents ?? 0);
    const donorCount = Number(completedRow?.donors ?? 0);
    const goalCents = activeGoal?.goalCents ?? 1_000_000;

    return {
      campaign: activeGoal ?? null,
      raisedCents,
      goalCents,
      percentComplete: goalCents > 0 ? Math.min(100, Math.round((raisedCents / goalCents) * 100)) : 0,
      donorCount,
      pendingCount: Number(pendingRow?.donors ?? 0),
      failedCount: Number(failedRow?.donors ?? 0),
      refundedCount: Number(refundedRow?.donors ?? 0),
      totalTransactions: allAgg.reduce((total, row) => total + Number(row.donors ?? 0), 0),
      daysLeft: activeGoal?.deadline
        ? Math.max(0, Math.ceil((new Date(activeGoal.deadline).getTime() - Date.now()) / 86_400_000))
        : null,
    };
  }),

  /** Update a historical campaign goal; this remains available for impact copy. */
  updateCampaignGoal: adminProcedure
    .input(z.object({
      id: z.number().int().positive(),
      goalCents: z.number().int().min(100).max(100_000_000).optional(),
      deadline: z.string().datetime({ offset: true }).nullable().optional(),
      title: z.string().trim().min(3).max(255).optional(),
      description: z.string().trim().max(1_000).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw databaseUnavailable();

      const updateData: Partial<InsertFundraisingGoal> = {};
      if (input.goalCents !== undefined) updateData.goalCents = input.goalCents;
      if (input.title !== undefined) updateData.title = input.title;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.deadline !== undefined) updateData.deadline = input.deadline ? new Date(input.deadline) : null;
      if (Object.keys(updateData).length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No fields to update." });
      }

      await db.update(fundraisingGoals).set(updateData).where(eq(fundraisingGoals.id, input.id));
      const [updated] = await db.select().from(fundraisingGoals).where(eq(fundraisingGoals.id, input.id)).limit(1);
      return updated ?? null;
    }),

  listSiteContent: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw databaseUnavailable();
    return db.select().from(siteContent).orderBy(siteContent.page, siteContent.contentKey);
  }),

  saveSiteContent: adminProcedure.input(contentInput).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw databaseUnavailable();

    await db.insert(siteContent).values(input).onDuplicateKeyUpdate({
      set: {
        label: input.label,
        value: input.value,
        isPublished: input.isPublished,
        updatedAt: new Date(),
      },
    });

    const [saved] = await db
      .select()
      .from(siteContent)
      .where(and(eq(siteContent.page, input.page), eq(siteContent.contentKey, input.contentKey)))
      .limit(1);
    return saved ?? null;
  }),

  listMarketingVideos: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw databaseUnavailable();
    return db.select().from(marketingVideos).orderBy(desc(marketingVideos.updatedAt));
  }),

  uploadMarketingVideo: adminProcedure
    .input(z.object({
      fileName: z.string().trim().min(1).max(160),
      contentType: z.enum(videoMimeTypes),
      base64Data: z.string().min(4).max(30_000_000),
    }))
    .mutation(async ({ input }) => {
      if (!/^[A-Za-z0-9+/]+={0,2}$/.test(input.base64Data)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid video upload payload." });
      }
      const data = Buffer.from(input.base64Data, "base64");
      if (data.length === 0 || data.length > MAX_VIDEO_BYTES) {
        throw new TRPCError({
          code: "PAYLOAD_TOO_LARGE",
          message: "Marketing videos must be 20 MB or smaller.",
        });
      }

      const extension = input.contentType === "video/webm"
        ? "webm"
        : input.contentType === "video/quicktime"
          ? "mov"
          : "mp4";
      const fileStem = input.fileName.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "hope-rising-video";
      const uploaded = await storagePut(
        `marketing-videos/${fileStem}-${crypto.randomUUID()}.${extension}`,
        data,
        input.contentType,
      );
      return uploaded;
    }),

  saveMarketingVideo: adminProcedure.input(marketingVideoInput).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw databaseUnavailable();

    if (input.isFeatured) {
      await db.update(marketingVideos).set({ isFeatured: false });
    }

    const values = {
      title: input.title,
      description: input.description || null,
      videoUrl: input.videoUrl,
      thumbnailUrl: input.thumbnailUrl || null,
      isFeatured: input.isFeatured,
      isActive: input.isActive,
    };

    if (input.id) {
      await db.update(marketingVideos).set(values).where(eq(marketingVideos.id, input.id));
      const [updated] = await db.select().from(marketingVideos).where(eq(marketingVideos.id, input.id)).limit(1);
      return updated ?? null;
    }

    const result = await db.insert(marketingVideos).values(values);
    const insertedId = Number(result[0].insertId);
    const [created] = await db.select().from(marketingVideos).where(eq(marketingVideos.id, insertedId)).limit(1);
    return created ?? null;
  }),

  deleteMarketingVideo: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw databaseUnavailable();
      await db.delete(marketingVideos).where(eq(marketingVideos.id, input.id));
      return { success: true };
    }),

  listAnnouncements: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw databaseUnavailable();
    return db.select().from(announcements).orderBy(desc(announcements.updatedAt));
  }),

  saveAnnouncement: adminProcedure.input(announcementInput).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw databaseUnavailable();
    if (input.startsAt && input.endsAt && new Date(input.startsAt) >= new Date(input.endsAt)) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "An announcement must end after it starts." });
    }

    const values = {
      title: input.title,
      body: input.body,
      ctaLabel: input.ctaLabel || null,
      ctaUrl: input.ctaUrl || null,
      isActive: input.isActive,
      startsAt: input.startsAt ? new Date(input.startsAt) : null,
      endsAt: input.endsAt ? new Date(input.endsAt) : null,
    };

    if (input.id) {
      await db.update(announcements).set(values).where(eq(announcements.id, input.id));
      const [updated] = await db.select().from(announcements).where(eq(announcements.id, input.id)).limit(1);
      return updated ?? null;
    }

    const result = await db.insert(announcements).values(values);
    const insertedId = Number(result[0].insertId);
    const [created] = await db.select().from(announcements).where(eq(announcements.id, insertedId)).limit(1);
    return created ?? null;
  }),

  deleteAnnouncement: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw databaseUnavailable();
      await db.delete(announcements).where(eq(announcements.id, input.id));
      return { success: true };
    }),

  listRegistrations: adminProcedure
    .input(z.object({
      type: z.enum(["all", "contact", "volunteer"]).default("all"),
      status: z.enum(["all", "new", "in_progress", "archived"]).default("all"),
      search: z.string().trim().max(120).optional(),
    }))
    .query(async ({ input }) => getRegistrationsForAdmin(input)),

  exportRegistrationsCsv: adminProcedure
    .input(z.object({
      type: z.enum(["all", "contact", "volunteer"]).default("all"),
      status: z.enum(["all", "new", "in_progress", "archived"]).default("all"),
      search: z.string().trim().max(120).optional(),
    }))
    .query(async ({ input }) => {
      const rows = await getRegistrationsForAdmin(input);
      return {
        fileName: `hope-rising-registrants-${new Date().toISOString().slice(0, 10)}.csv`,
        csv: registrationsToCsv(rows),
        count: rows.length,
      };
    }),

  updateRegistrationStatus: adminProcedure
    .input(z.object({
      id: z.number().int().positive(),
      status: z.enum(["new", "in_progress", "archived"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw databaseUnavailable();
      await db.update(registrations).set({ status: input.status }).where(eq(registrations.id, input.id));
      return { success: true };
    }),

  getDonationConfiguration: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw databaseUnavailable();
    const [setting] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.settingKey, "raiselyDonationUrl"))
      .limit(1);
    return { raiselyDonationUrl: setting?.value || "" };
  }),

  saveDonationConfiguration: adminProcedure
    .input(z.object({
      raiselyDonationUrl: z.string().trim().max(1024).nullable().refine(
        value => value === null || isRaiselyDonationUrl(value),
        { message: "Use a secure HTTPS URL hosted by Raisely." },
      ),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw databaseUnavailable();
      const value = normalizeRaiselyDonationUrl(input.raiselyDonationUrl) || "";
      await db.insert(siteSettings).values({
        settingKey: "raiselyDonationUrl",
        value,
      }).onDuplicateKeyUpdate({
        set: { value, updatedAt: new Date() },
      });
      return { raiselyDonationUrl: value };
    }),
});
