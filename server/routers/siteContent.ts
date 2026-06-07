/**
 * Site Content router
 * Public: getAll — returns all content rows as a key→value map.
 * Admin: upsert — create or update a content slot.
 * Admin: upsertMany — batch update multiple slots at once.
 * Admin: seed — insert default content rows (idempotent).
 */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { siteContent } from "../../drizzle/schema";

// ── Admin guard ───────────────────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// ── Default content definitions ───────────────────────────────────────────────
export const DEFAULT_CONTENT: Array<{
  key: string;
  label: string;
  type: "text" | "textarea" | "html";
  value: string;
  section: string;
}> = [
  // Hero section
  { key: "hero.badge", label: "Hero Badge Text", type: "text", value: "THOUSANDS OF CHILDREN ARE WAITING FOR HELP", section: "Hero" },
  { key: "hero.title1", label: "Hero Title Line 1", type: "text", value: "Empowering Children", section: "Hero" },
  { key: "hero.title2", label: "Hero Title Line 2", type: "text", value: "Through Education", section: "Hero" },
  { key: "hero.subtitle", label: "Hero Subtitle", type: "textarea", value: "Join us in providing access to quality education for vulnerable children in Zimbabwe. Together, we can break the cycle of poverty and build a future full of hope.", section: "Hero" },

  // Mission / About section
  { key: "about.tagline", label: "About Page Tagline", type: "text", value: "Transforming lives through education since 2018", section: "About" },
  { key: "about.mission", label: "Mission Statement", type: "textarea", value: "Hope Rising Education is dedicated to providing quality education and resources to vulnerable children in Zimbabwe, empowering them to break the cycle of poverty and build brighter futures.", section: "About" },
  { key: "about.vision", label: "Vision Statement", type: "textarea", value: "A Zimbabwe where every child, regardless of their background, has access to quality education and the opportunity to reach their full potential.", section: "About" },
  { key: "about.story", label: "Our Story", type: "html", value: "<p>Hope Rising Education was founded in 2018 by a group of passionate educators and community leaders who witnessed firsthand the devastating impact of poverty on children's access to education in Zimbabwe.</p><p>What started as a small book drive has grown into a comprehensive educational support organization serving hundreds of children across multiple provinces.</p>", section: "About" },

  // Stats section
  { key: "stats.children", label: "Children Helped (stat)", type: "text", value: "500+", section: "Stats" },
  { key: "stats.schools", label: "Schools Supported (stat)", type: "text", value: "15+", section: "Stats" },
  { key: "stats.teachers", label: "Teachers Trained (stat)", type: "text", value: "80+", section: "Stats" },
  { key: "stats.scholarships", label: "Scholarships Awarded (stat)", type: "text", value: "50+", section: "Stats" },

  // Programs section
  { key: "programs.books.title", label: "Books for All — Title", type: "text", value: "Books for All", section: "Programs" },
  { key: "programs.books.description", label: "Books for All — Description", type: "textarea", value: "Providing textbooks, workbooks, and reading materials to students who lack access to essential learning resources.", section: "Programs" },
  { key: "programs.teachers.title", label: "Teacher Training — Title", type: "text", value: "Teacher Training", section: "Programs" },
  { key: "programs.teachers.description", label: "Teacher Training — Description", type: "textarea", value: "Equipping educators with modern teaching methods, resources, and support to deliver quality education.", section: "Programs" },
  { key: "programs.scholarships.title", label: "Scholarships — Title", type: "text", value: "Scholarships", section: "Programs" },
  { key: "programs.scholarships.description", label: "Scholarships — Description", type: "textarea", value: "Funding secondary school education for academically gifted students from low-income families.", section: "Programs" },
  { key: "programs.infrastructure.title", label: "Infrastructure — Title", type: "text", value: "School Infrastructure", section: "Programs" },
  { key: "programs.infrastructure.description", label: "Infrastructure — Description", type: "textarea", value: "Building and renovating classrooms, libraries, and sanitation facilities to create safe learning environments.", section: "Programs" },

  // Contact info
  { key: "contact.email", label: "Contact Email", type: "text", value: "info@hoperisingeducation.org", section: "Contact" },
  { key: "contact.phone", label: "Contact Phone", type: "text", value: "+263 77 123 4567", section: "Contact" },
  { key: "contact.address", label: "Physical Address", type: "textarea", value: "123 Education Drive, Harare, Zimbabwe", section: "Contact" },

  // Footer
  { key: "footer.tagline", label: "Footer Tagline", type: "textarea", value: "Empowering children through education. Together we can break the cycle of poverty and build a brighter future for Zimbabwe.", section: "Footer" },
];

export const siteContentRouter = router({
  /** Returns all content rows as a flat key→value record. */
  getAll: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      // Return defaults if DB is unavailable
      return Object.fromEntries(DEFAULT_CONTENT.map((c) => [c.key, c.value]));
    }

    const rows = await db.select().from(siteContent);
    const map: Record<string, string> = {};
    for (const row of rows) {
      map[row.key] = row.value;
    }
    return map;
  }),

  /** Returns all content rows with full metadata (for the admin editor). */
  getAllFull: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return DEFAULT_CONTENT.map((c, i) => ({ ...c, id: i + 1, updatedAt: new Date() }));
    return db.select().from(siteContent).orderBy(siteContent.section, siteContent.key);
  }),

  /** Create or update a single content slot. */
  upsert: adminProcedure
    .input(
      z.object({
        key: z.string().min(1).max(255),
        value: z.string(),
        label: z.string().min(1).max(255).optional(),
        type: z.enum(["text", "textarea", "html"]).optional(),
        section: z.string().max(100).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      // Find existing row
      const [existing] = await db
        .select()
        .from(siteContent)
        .where(eq(siteContent.key, input.key));

      if (existing) {
        await db
          .update(siteContent)
          .set({
            value: input.value,
            ...(input.label ? { label: input.label } : {}),
            ...(input.type ? { type: input.type } : {}),
            ...(input.section ? { section: input.section } : {}),
          })
          .where(eq(siteContent.key, input.key));
      } else {
        const defaults = DEFAULT_CONTENT.find((c) => c.key === input.key);
        await db.insert(siteContent).values({
          key: input.key,
          value: input.value,
          label: input.label ?? defaults?.label ?? input.key,
          type: input.type ?? defaults?.type ?? "text",
          section: input.section ?? defaults?.section ?? "general",
        });
      }

      const [updated] = await db
        .select()
        .from(siteContent)
        .where(eq(siteContent.key, input.key));

      return updated;
    }),

  /** Batch upsert — saves multiple content slots in one call. */
  upsertMany: adminProcedure
    .input(
      z.array(
        z.object({
          key: z.string().min(1).max(255),
          value: z.string(),
        })
      )
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      for (const item of input) {
        const [existing] = await db
          .select({ id: siteContent.id })
          .from(siteContent)
          .where(eq(siteContent.key, item.key));

        if (existing) {
          await db
            .update(siteContent)
            .set({ value: item.value })
            .where(eq(siteContent.key, item.key));
        } else {
          const defaults = DEFAULT_CONTENT.find((c) => c.key === item.key);
          await db.insert(siteContent).values({
            key: item.key,
            value: item.value,
            label: defaults?.label ?? item.key,
            type: defaults?.type ?? "text",
            section: defaults?.section ?? "general",
          });
        }
      }

      return { success: true, count: input.length };
    }),

  /** Seed all default content rows (idempotent — skips existing keys). */
  seed: adminProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

    let inserted = 0;
    for (const item of DEFAULT_CONTENT) {
      const [existing] = await db
        .select({ id: siteContent.id })
        .from(siteContent)
        .where(eq(siteContent.key, item.key));

      if (!existing) {
        await db.insert(siteContent).values(item);
        inserted++;
      }
    }

    return { success: true, inserted };
  }),
});
