/**
 * Blog router tests
 *
 * Tests cover:
 *   - blog.list: returns only published posts, respects category filter and limit
 *   - blog.getBySlug: returns a published post by slug, throws NOT_FOUND for unknown slug
 *   - blog.categories: returns an array of strings
 *   - blog.adminList: throws FORBIDDEN for non-admin, returns array for admin
 *   - blog.create: throws FORBIDDEN for non-admin, creates a draft for admin
 *   - blog.togglePublish: throws FORBIDDEN for non-admin
 *   - blog.delete: throws FORBIDDEN for non-admin
 */
import { describe, it, expect, afterEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ── Mock database ─────────────────────────────────────────────────────────────
// We use the real DB for integration-style tests (list, getBySlug, categories)
// and mock it only where we need to isolate admin mutations.

// ── Context helpers ───────────────────────────────────────────────────────────

function makePublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function makeUserCtx(): TrpcContext {
  return {
    user: {
      id: 99,
      openId: "user-99",
      email: "user@example.com",
      name: "Regular User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function makeAdminCtx(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-1",
      email: "admin@example.com",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("blog.list", () => {
  it("returns an object with posts array and total number", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.blog.list({});
    expect(result).toHaveProperty("posts");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.posts)).toBe(true);
    expect(typeof result.total).toBe("number");
  });

  it("respects the limit parameter", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.blog.list({ limit: 1 });
    expect(result.posts.length).toBeLessThanOrEqual(1);
  });

  it("respects the category filter", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.blog.list({ category: "Impact Story" });
    result.posts.forEach((p) => expect(p.category).toBe("Impact Story"));
  });

  it("returns total count consistent with posts length for small datasets", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.blog.list({ limit: 50 });
    // total should be >= posts.length (posts.length <= limit)
    expect(result.total).toBeGreaterThanOrEqual(result.posts.length);
  });
});

describe("blog.getBySlug", () => {
  it("returns a published post for a known slug", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.blog.getBySlug({ slug: "books-for-all-2025" });
    expect(result.slug).toBe("books-for-all-2025");
    expect(typeof result.title).toBe("string");
    expect(result.published).toBe(true);
  });

  it("throws NOT_FOUND for an unknown slug", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.blog.getBySlug({ slug: "this-slug-does-not-exist-xyz-999" })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

describe("blog.categories", () => {
  it("returns an array of strings", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.blog.categories();
    expect(Array.isArray(result)).toBe(true);
    result.forEach((c) => expect(typeof c).toBe("string"));
  });

  it("includes Impact Story category (from seeded data)", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.blog.categories();
    expect(result).toContain("Impact Story");
  });
});

describe("blog.adminList", () => {
  it("throws UNAUTHORIZED/FORBIDDEN for unauthenticated users", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.blog.adminList()).rejects.toThrow();
  });

  it("throws FORBIDDEN for regular (non-admin) users", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.blog.adminList()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("returns an array for admin users", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.blog.adminList();
    expect(Array.isArray(result)).toBe(true);
  });

  it("includes both published and draft posts for admin", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.blog.adminList();
    // Should have at least the 3 seeded published posts
    expect(result.length).toBeGreaterThanOrEqual(3);
  });
});

describe("blog.create", () => {
  const testSlug = `vitest-post-${Date.now()}`;

  afterEach(async () => {
    // Clean up test post
    try {
      const { getDb } = await import("./db");
      const { blogPosts } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (db) await db.delete(blogPosts).where(eq(blogPosts.slug, testSlug));
    } catch {
      // ignore cleanup errors
    }
  });

  it("throws FORBIDDEN for regular users", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(
      caller.blog.create({
        title: "Unauthorized Post",
        content: "<p>Should not be created</p>",
        slug: testSlug,
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("creates a draft post for admin users", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.blog.create({
      title: "Vitest Blog Post",
      content: "<p>Test content body for vitest integration test</p>",
      slug: testSlug,
      category: "News",
    });
    expect(result.slug).toBe(testSlug);
    expect(result.published).toBe(false);
    expect(result.title).toBe("Vitest Blog Post");
  });

  it("throws CONFLICT if slug already exists", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    // First create
    await caller.blog.create({
      title: "Vitest Blog Post",
      content: "<p>First post</p>",
      slug: testSlug,
    });
    // Second create with same slug should fail
    await expect(
      caller.blog.create({
        title: "Duplicate Slug Post",
        content: "<p>Second post</p>",
        slug: testSlug,
      })
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });
});

describe("blog.togglePublish", () => {
  it("throws FORBIDDEN for regular users", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.blog.togglePublish({ id: 1 })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("toggles the published state for admin users", async () => {
    // Use the first seeded post (id=1 in most cases — find it by slug)
    const adminCaller = appRouter.createCaller(makeAdminCtx());
    const posts = await adminCaller.blog.adminList();
    const post = posts.find((p) => p.slug === "books-for-all-2025");
    if (!post) return; // skip if seeded post not found

    const result = await adminCaller.blog.togglePublish({ id: post.id });
    expect(typeof result.published).toBe("boolean");
    expect(result.published).toBe(!post.published);

    // Restore original state
    await adminCaller.blog.togglePublish({ id: post.id });
  });
});

describe("blog.delete", () => {
  it("throws FORBIDDEN for regular users", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.blog.delete({ id: 9999 })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("returns success for admin deleting a non-existent post (idempotent)", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    // Deleting a non-existent ID should not throw — Drizzle DELETE is idempotent
    const result = await caller.blog.delete({ id: 999999 });
    expect(result.success).toBe(true);
  });
});
