/**
 * Blog / Impact Stories router
 *
 * Public procedures:
 *   blog.list        — paginated list of published posts (with optional category filter)
 *   blog.getBySlug   — single published post by slug
 *   blog.categories  — distinct category list for filter UI
 *
 * Admin-only procedures (role === "admin"):
 *   blog.adminList      — all posts (published + drafts)
 *   blog.create         — create a new post
 *   blog.update         — update an existing post
 *   blog.togglePublish  — publish / unpublish a post
 *   blog.delete         — permanently delete a post
 */
import { eq, desc, and, like, sql } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { blogPosts } from "../../drizzle/schema";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";

// ── Helpers ────────────────────────────────────────────────────────────────────

function adminGuard(role: string | undefined) {
  if (role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 200);
}

// ── Input schemas ──────────────────────────────────────────────────────────────

const postWriteSchema = z.object({
  title: z.string().min(3).max(255),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(10),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  category: z.string().max(100).default("Impact Story"),
  author: z.string().max(255).default("Hope Rising Education"),
  /** If omitted, auto-generated from title */
  slug: z.string().max(255).optional(),
});

// ── Router ─────────────────────────────────────────────────────────────────────

export const blogRouter = router({
  // ── Public: list published posts ──────────────────────────────────────────
  list: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        search: z.string().max(100).optional(),
        limit: z.number().int().min(1).max(50).default(12),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const conditions = [eq(blogPosts.published, true)];
      if (input.category) conditions.push(eq(blogPosts.category, input.category));
      if (input.search) conditions.push(like(blogPosts.title, `%${input.search}%`));

      const rows = await db
        .select({
          id: blogPosts.id,
          slug: blogPosts.slug,
          title: blogPosts.title,
          excerpt: blogPosts.excerpt,
          coverImageUrl: blogPosts.coverImageUrl,
          category: blogPosts.category,
          author: blogPosts.author,
          publishedAt: blogPosts.publishedAt,
        })
        .from(blogPosts)
        .where(and(...conditions))
        .orderBy(desc(blogPosts.publishedAt))
        .limit(input.limit)
        .offset(input.offset);

      // Total count for pagination
      const [{ total }] = await db
        .select({ total: sql<number>`count(*)` })
        .from(blogPosts)
        .where(and(...conditions));

      return { posts: rows, total: Number(total) };
    }),

  // ── Public: single post by slug ───────────────────────────────────────────
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [post] = await db
        .select()
        .from(blogPosts)
        .where(and(eq(blogPosts.slug, input.slug), eq(blogPosts.published, true)))
        .limit(1);

      if (!post) throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      return post;
    }),

  // ── Public: distinct categories ───────────────────────────────────────────
  categories: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const rows = await db
      .selectDistinct({ category: blogPosts.category })
      .from(blogPosts)
      .where(eq(blogPosts.published, true));

    return rows.map((r) => r.category);
  }),

  // ── Admin: list all posts (including drafts) ──────────────────────────────
  adminList: protectedProcedure.query(async ({ ctx }) => {
    adminGuard(ctx.user.role);
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    return db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  }),

  // ── Admin: create post ────────────────────────────────────────────────────
  create: protectedProcedure
    .input(postWriteSchema)
    .mutation(async ({ input, ctx }) => {
      adminGuard(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const slug = input.slug?.trim() || slugify(input.title);

      // Ensure slug uniqueness
      const [existing] = await db
        .select({ id: blogPosts.id })
        .from(blogPosts)
        .where(eq(blogPosts.slug, slug))
        .limit(1);
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "A post with this slug already exists" });

      await db.insert(blogPosts).values({
        slug,
        title: input.title,
        excerpt: input.excerpt ?? null,
        content: input.content,
        coverImageUrl: input.coverImageUrl || null,
        category: input.category,
        author: input.author,
        published: false,
      });

      const [created] = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.slug, slug))
        .limit(1);

      return created;
    }),

  // ── Admin: update post ────────────────────────────────────────────────────
  update: protectedProcedure
    .input(postWriteSchema.extend({ id: z.number().int() }))
    .mutation(async ({ input, ctx }) => {
      adminGuard(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [existing] = await db
        .select({ id: blogPosts.id })
        .from(blogPosts)
        .where(eq(blogPosts.id, input.id))
        .limit(1);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });

      const slug = input.slug?.trim() || slugify(input.title);

      await db
        .update(blogPosts)
        .set({
          slug,
          title: input.title,
          excerpt: input.excerpt ?? null,
          content: input.content,
          coverImageUrl: input.coverImageUrl || null,
          category: input.category,
          author: input.author,
        })
        .where(eq(blogPosts.id, input.id));

      const [updated] = await db.select().from(blogPosts).where(eq(blogPosts.id, input.id)).limit(1);
      return updated;
    }),

  // ── Admin: toggle publish ─────────────────────────────────────────────────
  togglePublish: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input, ctx }) => {
      adminGuard(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [post] = await db
        .select({ id: blogPosts.id, published: blogPosts.published, publishedAt: blogPosts.publishedAt })
        .from(blogPosts)
        .where(eq(blogPosts.id, input.id))
        .limit(1);
      if (!post) throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });

      const nowPublished = !post.published;
      await db
        .update(blogPosts)
        .set({
          published: nowPublished,
          publishedAt: nowPublished ? (post.publishedAt ?? new Date()) : post.publishedAt,
        })
        .where(eq(blogPosts.id, input.id));

      return { id: input.id, published: nowPublished };
    }),

  // ── Admin: delete post ────────────────────────────────────────────────────
  delete: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input, ctx }) => {
      adminGuard(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db.delete(blogPosts).where(eq(blogPosts.id, input.id));
      return { success: true };
    }),
});
