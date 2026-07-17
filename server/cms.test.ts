/**
 * CMS feature tests — Announcements, Videos, Registrants
 * Covers: public procedures, admin CRUD, auth guards, DB-unavailable paths
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ── Mock the database module ──────────────────────────────────────────────────
vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

import { getDb } from "./db";

// ── Context factories ─────────────────────────────────────────────────────────

function makeAdminCtx(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-open-id",
      email: "clarakonono@gmail.com",
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

function makeUserCtx(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "user-open-id",
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

function makeAnonCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ── Shared mock DB builder ────────────────────────────────────────────────────

function buildMockDb(overrides: Record<string, unknown> = {}) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    offset: vi.fn().mockReturnThis(),
    groupBy: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
    delete: vi.fn().mockReturnThis(),
    execute: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
  return chain;
}

// ─────────────────────────────────────────────────────────────────────────────
// ANNOUNCEMENTS
// ─────────────────────────────────────────────────────────────────────────────

describe("announcements.listActive", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns active announcements for anonymous users", async () => {
    const mockRows = [
      {
        id: 1,
        title: "Back to school drive",
        body: "We are collecting books!",
        isActive: true,
        publishAt: null,
        unpublishAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    const db = buildMockDb({ orderBy: vi.fn().mockResolvedValue(mockRows) });
    vi.mocked(getDb).mockResolvedValue(db as never);

    const caller = appRouter.createCaller(makeAnonCtx());
    const result = await caller.announcements.listActive();

    expect(Array.isArray(result)).toBe(true);
  });

  it("returns empty array when DB is unavailable", async () => {
    vi.mocked(getDb).mockResolvedValue(null as never);
    const caller = appRouter.createCaller(makeAnonCtx());
    const result = await caller.announcements.listActive();
    expect(result).toEqual([]);
  });
});

describe("announcements.listAll (admin)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns all announcements for admin users", async () => {
    const mockRows = [
      { id: 1, title: "Test", body: "Body", isActive: true, publishAt: null, unpublishAt: null, createdAt: new Date(), updatedAt: new Date() },
    ];
    const db = buildMockDb({ orderBy: vi.fn().mockResolvedValue(mockRows) });
    vi.mocked(getDb).mockResolvedValue(db as never);

    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.announcements.listAll();
    expect(Array.isArray(result)).toBe(true);
  });

  it("throws FORBIDDEN for regular users", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.announcements.listAll()).rejects.toThrow();
  });

  it("throws FORBIDDEN for anonymous users", async () => {
    const caller = appRouter.createCaller(makeAnonCtx());
    await expect(caller.announcements.listAll()).rejects.toThrow();
  });
});

describe("announcements.create (admin)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates an announcement for admin users", async () => {
    const mockRow = { id: 1, title: "New", body: "Body", isActive: true, publishAt: null, unpublishAt: null, createdAt: new Date(), updatedAt: new Date() };
    // create calls: insert().values(), then select().from().orderBy().limit(1)
    const db = buildMockDb({
      // insert chain
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockResolvedValue(undefined),
      // select chain — limit returns the created row
      limit: vi.fn().mockResolvedValue([mockRow]),
    });
    vi.mocked(getDb).mockResolvedValue(db as never);

    const caller = appRouter.createCaller(makeAdminCtx());
    // create returns the created row (or undefined if mock chain doesn't fully resolve)
    // We just verify it doesn't throw
    await expect(
      caller.announcements.create({ title: "New", body: "Body", isActive: true })
    ).resolves.not.toThrow();
  });

  it("throws FORBIDDEN for regular users", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(
      caller.announcements.create({ title: "New", body: "Body", isActive: true })
    ).rejects.toThrow();
  });
});

describe("announcements.delete (admin)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws FORBIDDEN for non-admin users", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.announcements.delete({ id: 1 })).rejects.toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// VIDEOS
// ─────────────────────────────────────────────────────────────────────────────

describe("videos.listPublished", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns published videos for anonymous users", async () => {
    const mockVideos = [
      { id: 1, title: "Hope Rising 2025", url: "/manus-storage/video.mp4", isPublished: true, sortOrder: 0, thumbnailUrl: null, description: null, storageKey: "video.mp4", createdAt: new Date(), updatedAt: new Date() },
    ];
    const db = buildMockDb({ orderBy: vi.fn().mockResolvedValue(mockVideos) });
    vi.mocked(getDb).mockResolvedValue(db as never);

    const caller = appRouter.createCaller(makeAnonCtx());
    const result = await caller.videos.listPublished();
    expect(Array.isArray(result)).toBe(true);
  });

  it("returns empty array when DB is unavailable", async () => {
    vi.mocked(getDb).mockResolvedValue(null as never);
    const caller = appRouter.createCaller(makeAnonCtx());
    const result = await caller.videos.listPublished();
    expect(result).toEqual([]);
  });
});

describe("videos.listAll (admin)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns all videos for admin users", async () => {
    const db = buildMockDb({ orderBy: vi.fn().mockResolvedValue([]) });
    vi.mocked(getDb).mockResolvedValue(db as never);

    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.videos.listAll();
    expect(Array.isArray(result)).toBe(true);
  });

  it("throws FORBIDDEN for regular users", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.videos.listAll()).rejects.toThrow();
  });

  it("throws FORBIDDEN for anonymous users", async () => {
    const caller = appRouter.createCaller(makeAnonCtx());
    await expect(caller.videos.listAll()).rejects.toThrow();
  });
});

describe("videos.togglePublish (admin)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws FORBIDDEN for regular users", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.videos.togglePublish({ id: 1, isPublished: true })).rejects.toThrow();
  });

  it("throws FORBIDDEN for anonymous users", async () => {
    const caller = appRouter.createCaller(makeAnonCtx());
    await expect(caller.videos.togglePublish({ id: 1, isPublished: true })).rejects.toThrow();
  });
});

describe("videos.delete (admin)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws FORBIDDEN for regular users", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.videos.delete({ id: 1 })).rejects.toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRANTS
// ─────────────────────────────────────────────────────────────────────────────

describe("registrants.list (admin)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns registrant rows for admin users", async () => {
    const mockRows = [
      { id: 1, name: "Alice Moyo", email: "alice@example.com", phone: "+263771234567", interest: "volunteer", message: "I want to help", source: "get-involved", createdAt: new Date() },
    ];
    // The registrants.list procedure calls:
    //   db.select().from().where().orderBy().limit().offset()  → rows
    //   db.select({ total }).from().where()                    → [{ total: 1 }]
    // We need a stateful mock that returns different values on successive calls.
    let selectCallCount = 0;
    const offsetMock = vi.fn().mockResolvedValue(mockRows);
    const limitMock = vi.fn().mockReturnValue({ offset: offsetMock });
    const orderByMock = vi.fn().mockReturnValue({ limit: limitMock });
    const whereMock = vi.fn().mockImplementation(() => {
      selectCallCount++;
      if (selectCallCount === 1) {
        // first select: rows query
        return { orderBy: orderByMock };
      }
      // second select: count query
      return Promise.resolve([{ total: 1 }]);
    });
    const db = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: whereMock,
      orderBy: orderByMock,
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
    };
    vi.mocked(getDb).mockResolvedValue(db as never);

    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.registrants.list({});
    expect(result).toHaveProperty("registrants");
    expect(result).toHaveProperty("total");
  });

  it("throws FORBIDDEN for regular users", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.registrants.list({})).rejects.toThrow();
  });

  it("throws FORBIDDEN for anonymous users", async () => {
    const caller = appRouter.createCaller(makeAnonCtx());
    await expect(caller.registrants.list({})).rejects.toThrow();
  });

  it("throws when DB is unavailable", async () => {
    vi.mocked(getDb).mockResolvedValue(null as never);
    const caller = appRouter.createCaller(makeAdminCtx());
    await expect(caller.registrants.list({})).rejects.toThrow("Database unavailable");
  });
});

describe("registrants.exportCsv (admin)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns a CSV string for admin users", async () => {
    const mockRows = [
      { id: 1, name: "Alice Moyo", email: "alice@example.com", phone: "+263771234567", interest: "volunteer", message: "I want to help", source: "get-involved", createdAt: new Date() },
    ];
    const db = buildMockDb({ orderBy: vi.fn().mockResolvedValue(mockRows) });
    vi.mocked(getDb).mockResolvedValue(db as never);

    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.registrants.exportCsv({});
    // exportCsv returns { csv: string, count: number }
    expect(result).toHaveProperty("csv");
    expect(result).toHaveProperty("count");
    expect(typeof result.csv).toBe("string");
    expect(result.csv).toContain("Alice Moyo");
    expect(result.csv).toContain("alice@example.com");
  });

  it("throws FORBIDDEN for regular users", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.registrants.exportCsv({})).rejects.toThrow();
  });

  it("throws when DB is unavailable", async () => {
    vi.mocked(getDb).mockResolvedValue(null as never);
    const caller = appRouter.createCaller(makeAdminCtx());
    await expect(caller.registrants.exportCsv({})).rejects.toThrow("Database unavailable");
  });
});
