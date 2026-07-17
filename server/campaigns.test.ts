/**
 * Tests for the campaigns tRPC router.
 * Covers: listActive, getFeatured, listAll, create, update, updateRaised,
 *         toggleActive, toggleFeatured, delete — including admin guard checks.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock getDb ────────────────────────────────────────────────────────────────

const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockOrderBy = vi.fn();
const mockValues = vi.fn();
const mockSet = vi.fn();

vi.mock("../server/db", () => ({
  getDb: vi.fn(),
}));

import { getDb } from "../server/db";

// ── Mock schema ───────────────────────────────────────────────────────────────

vi.mock("../drizzle/schema", () => ({
  campaigns: {
    id: "id",
    isActive: "isActive",
    isFeatured: "isFeatured",
    sortOrder: "sortOrder",
    createdAt: "createdAt",
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((col, val) => ({ col, val, op: "eq" })),
  and: vi.fn((...args) => ({ args, op: "and" })),
  asc: vi.fn((col) => ({ col, dir: "asc" })),
  desc: vi.fn((col) => ({ col, dir: "desc" })),
}));

// ── Sample data ───────────────────────────────────────────────────────────────

const SAMPLE_CAMPAIGN = {
  id: 1,
  slug: "test-campaign-abc",
  title: "Test Campaign",
  excerpt: "A test campaign",
  description: "Full description",
  coverImageUrl: "https://example.com/img.jpg",
  goalCents: 1000000,
  raisedCents: 250000,
  currency: "USD",
  donateUrl: "https://donate.raisely.com/test",
  deadline: new Date("2025-12-31"),
  isActive: true,
  isFeatured: true,
  sortOrder: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const ADMIN_CTX = { user: { id: 1, role: "admin", name: "Admin", email: "admin@test.com" } };
const USER_CTX  = { user: { id: 2, role: "user",  name: "User",  email: "user@test.com" } };

// ── Helper to build a chainable mock DB ───────────────────────────────────────

function buildDb(returnValue: unknown = [SAMPLE_CAMPAIGN]) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockResolvedValue(returnValue),
    values: vi.fn().mockResolvedValue(undefined),
    set: vi.fn().mockReturnThis(),
  };
  return chain;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("campaigns.listActive", () => {
  it("returns active campaigns ordered by sortOrder", async () => {
    const db = buildDb([SAMPLE_CAMPAIGN]);
    vi.mocked(getDb).mockResolvedValue(db as never);

    const { campaignsRouter } = await import("../server/routers/campaigns");
    const caller = campaignsRouter.createCaller({} as never);
    const result = await caller.listActive();

    expect(result).toEqual([SAMPLE_CAMPAIGN]);
    expect(db.select).toHaveBeenCalled();
    expect(db.from).toHaveBeenCalled();
    expect(db.where).toHaveBeenCalled();
    expect(db.orderBy).toHaveBeenCalled();
  });

  it("returns empty array when db is null", async () => {
    vi.mocked(getDb).mockResolvedValue(null as never);

    const { campaignsRouter } = await import("../server/routers/campaigns");
    const caller = campaignsRouter.createCaller({} as never);
    const result = await caller.listActive();

    expect(result).toEqual([]);
  });
});

describe("campaigns.getFeatured", () => {
  it("returns up to 3 featured active campaigns", async () => {
    const featured = [
      { ...SAMPLE_CAMPAIGN, id: 1 },
      { ...SAMPLE_CAMPAIGN, id: 2 },
      { ...SAMPLE_CAMPAIGN, id: 3 },
      { ...SAMPLE_CAMPAIGN, id: 4 }, // should be sliced off
    ];
    const db = buildDb(featured);
    vi.mocked(getDb).mockResolvedValue(db as never);

    const { campaignsRouter } = await import("../server/routers/campaigns");
    const caller = campaignsRouter.createCaller({} as never);
    const result = await caller.getFeatured();

    expect(result).toHaveLength(3);
  });

  it("returns empty array when db is null", async () => {
    vi.mocked(getDb).mockResolvedValue(null as never);

    const { campaignsRouter } = await import("../server/routers/campaigns");
    const caller = campaignsRouter.createCaller({} as never);
    const result = await caller.getFeatured();

    expect(result).toEqual([]);
  });
});

describe("campaigns.listAll", () => {
  it("returns all campaigns for admin", async () => {
    const db = buildDb([SAMPLE_CAMPAIGN]);
    vi.mocked(getDb).mockResolvedValue(db as never);

    const { campaignsRouter } = await import("../server/routers/campaigns");
    const caller = campaignsRouter.createCaller(ADMIN_CTX as never);
    const result = await caller.listAll();

    expect(result).toEqual([SAMPLE_CAMPAIGN]);
  });

  it("throws FORBIDDEN for non-admin", async () => {
    const { campaignsRouter } = await import("../server/routers/campaigns");
    const caller = campaignsRouter.createCaller(USER_CTX as never);

    await expect(caller.listAll()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("returns empty array when db is null", async () => {
    vi.mocked(getDb).mockResolvedValue(null as never);

    const { campaignsRouter } = await import("../server/routers/campaigns");
    const caller = campaignsRouter.createCaller(ADMIN_CTX as never);
    const result = await caller.listAll();

    expect(result).toEqual([]);
  });
});

describe("campaigns.create", () => {
  const validInput = {
    title: "New Campaign",
    excerpt: "Short summary",
    description: "Full description",
    coverImageUrl: "https://example.com/img.jpg",
    goalCents: 500000,
    raisedCents: 0,
    currency: "USD",
    donateUrl: "https://donate.raisely.com/new",
    deadline: new Date("2025-12-31"),
    isActive: true,
    isFeatured: false,
    sortOrder: 1,
  };

  it("creates a campaign for admin", async () => {
    const db = buildDb();
    vi.mocked(getDb).mockResolvedValue(db as never);

    const { campaignsRouter } = await import("../server/routers/campaigns");
    const caller = campaignsRouter.createCaller(ADMIN_CTX as never);
    const result = await caller.create(validInput);

    expect(result).toEqual({ success: true });
    expect(db.insert).toHaveBeenCalled();
    expect(db.values).toHaveBeenCalled();
  });

  it("throws FORBIDDEN for non-admin", async () => {
    const { campaignsRouter } = await import("../server/routers/campaigns");
    const caller = campaignsRouter.createCaller(USER_CTX as never);

    await expect(caller.create(validInput)).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

describe("campaigns.update", () => {
  const validData = {
    title: "Updated Campaign",
    excerpt: "Updated summary",
    description: "Updated description",
    coverImageUrl: "https://example.com/img2.jpg",
    goalCents: 750000,
    raisedCents: 100000,
    currency: "USD",
    donateUrl: "https://donate.raisely.com/updated",
    deadline: new Date("2026-06-30"),
    isActive: true,
    isFeatured: true,
    sortOrder: 2,
  };

  it("updates a campaign for admin", async () => {
    const db = buildDb();
    db.orderBy = vi.fn().mockResolvedValue(undefined);
    vi.mocked(getDb).mockResolvedValue(db as never);

    const { campaignsRouter } = await import("../server/routers/campaigns");
    const caller = campaignsRouter.createCaller(ADMIN_CTX as never);
    const result = await caller.update({ id: 1, data: validData });

    expect(result).toEqual({ success: true });
  });

  it("throws FORBIDDEN for non-admin", async () => {
    const { campaignsRouter } = await import("../server/routers/campaigns");
    const caller = campaignsRouter.createCaller(USER_CTX as never);

    await expect(caller.update({ id: 1, data: validData })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

describe("campaigns.updateRaised", () => {
  it("updates raisedCents for admin", async () => {
    const db = buildDb();
    db.orderBy = vi.fn().mockResolvedValue(undefined);
    vi.mocked(getDb).mockResolvedValue(db as never);

    const { campaignsRouter } = await import("../server/routers/campaigns");
    const caller = campaignsRouter.createCaller(ADMIN_CTX as never);
    const result = await caller.updateRaised({ id: 1, raisedCents: 500000 });

    expect(result).toEqual({ success: true });
  });

  it("throws FORBIDDEN for non-admin", async () => {
    const { campaignsRouter } = await import("../server/routers/campaigns");
    const caller = campaignsRouter.createCaller(USER_CTX as never);

    await expect(caller.updateRaised({ id: 1, raisedCents: 500000 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

describe("campaigns.toggleActive", () => {
  it("toggles isActive for admin", async () => {
    const db = buildDb();
    db.orderBy = vi.fn().mockResolvedValue(undefined);
    vi.mocked(getDb).mockResolvedValue(db as never);

    const { campaignsRouter } = await import("../server/routers/campaigns");
    const caller = campaignsRouter.createCaller(ADMIN_CTX as never);
    const result = await caller.toggleActive({ id: 1, isActive: false });

    expect(result).toEqual({ success: true });
  });

  it("throws FORBIDDEN for non-admin", async () => {
    const { campaignsRouter } = await import("../server/routers/campaigns");
    const caller = campaignsRouter.createCaller(USER_CTX as never);

    await expect(caller.toggleActive({ id: 1, isActive: false })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

describe("campaigns.toggleFeatured", () => {
  it("toggles isFeatured for admin", async () => {
    const db = buildDb();
    db.orderBy = vi.fn().mockResolvedValue(undefined);
    vi.mocked(getDb).mockResolvedValue(db as never);

    const { campaignsRouter } = await import("../server/routers/campaigns");
    const caller = campaignsRouter.createCaller(ADMIN_CTX as never);
    const result = await caller.toggleFeatured({ id: 1, isFeatured: false });

    expect(result).toEqual({ success: true });
  });

  it("throws FORBIDDEN for non-admin", async () => {
    const { campaignsRouter } = await import("../server/routers/campaigns");
    const caller = campaignsRouter.createCaller(USER_CTX as never);

    await expect(caller.toggleFeatured({ id: 1, isFeatured: false })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

describe("campaigns.delete", () => {
  it("deletes a campaign for admin", async () => {
    const db = buildDb();
    db.where = vi.fn().mockResolvedValue(undefined);
    vi.mocked(getDb).mockResolvedValue(db as never);

    const { campaignsRouter } = await import("../server/routers/campaigns");
    const caller = campaignsRouter.createCaller(ADMIN_CTX as never);
    const result = await caller.delete({ id: 1 });

    expect(result).toEqual({ success: true });
  });

  it("throws FORBIDDEN for non-admin", async () => {
    const { campaignsRouter } = await import("../server/routers/campaigns");
    const caller = campaignsRouter.createCaller(USER_CTX as never);

    await expect(caller.delete({ id: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
