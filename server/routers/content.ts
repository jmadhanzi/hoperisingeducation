import { and, desc, eq, gt, isNull, lte, or } from "drizzle-orm";
import { z } from "zod";
import {
  announcements,
  marketingVideos,
  siteContent,
  siteSettings,
} from "../../drizzle/schema";
import { getDb } from "../db";
import { normalizeRaiselyDonationUrl } from "../raisely";
import { publicProcedure, router } from "../_core/trpc";

const pageInput = z.string().trim().min(1).max(80).regex(/^[a-z0-9-]+$/);

/**
 * Read-only public content. This router intentionally returns only data that
 * has been published by an administrator; administrator mutations live in the
 * protected admin router.
 */
export const contentRouter = router({
  pageContent: publicProcedure.input(z.object({ page: pageInput })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];

    return db
      .select({
        contentKey: siteContent.contentKey,
        label: siteContent.label,
        value: siteContent.value,
        updatedAt: siteContent.updatedAt,
      })
      .from(siteContent)
      .where(and(eq(siteContent.page, input.page), eq(siteContent.isPublished, true)))
      .orderBy(siteContent.contentKey);
  }),

  featuredVideo: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return null;

    const [video] = await db
      .select()
      .from(marketingVideos)
      .where(and(eq(marketingVideos.isActive, true), eq(marketingVideos.isFeatured, true)))
      .orderBy(desc(marketingVideos.updatedAt))
      .limit(1);

    if (video) return video;

    const [fallback] = await db
      .select()
      .from(marketingVideos)
      .where(eq(marketingVideos.isActive, true))
      .orderBy(desc(marketingVideos.updatedAt))
      .limit(1);

    return fallback ?? null;
  }),

  activeAnnouncements: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const now = new Date();
    return db
      .select()
      .from(announcements)
      .where(
        and(
          eq(announcements.isActive, true),
          or(isNull(announcements.startsAt), lte(announcements.startsAt, now)),
          or(isNull(announcements.endsAt), gt(announcements.endsAt, now)),
        ),
      )
      .orderBy(desc(announcements.createdAt))
      .limit(3);
  }),

  donationDestination: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { raiselyDonationUrl: null };

    const [setting] = await db
      .select({ value: siteSettings.value })
      .from(siteSettings)
      .where(eq(siteSettings.settingKey, "raiselyDonationUrl"))
      .limit(1);

    return { raiselyDonationUrl: normalizeRaiselyDonationUrl(setting?.value) };
  }),
});
