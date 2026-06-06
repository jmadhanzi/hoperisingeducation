import { describe, expect, it, vi, beforeEach } from "vitest";
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
      email: "admin@hoperisingeducation.org",
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
    groupBy: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
  return chain;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("admin.recentDonors", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns donor rows for admin users", async () => {
    const mockDonors = [
      {
        id: 1,
        donorName: "Jane Doe",
        donorEmail: "jane@example.com",
        amountCents: 5000,
        currency: "usd",
        status: "completed",
        isRecurring: false,
        message: "Keep up the great work!",
        stripeSessionId: "cs_test_abc123",
        createdAt: new Date("2026-01-15T10:00:00Z"),
      },
    ];

    const db = buildMockDb({ limit: vi.fn().mockResolvedValue(mockDonors) });
    vi.mocked(getDb).mockResolvedValue(db as ReturnType<typeof buildMockDb> as never);

    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.admin.recentDonors();

    expect(result).toHaveLength(1);
    expect(result[0].donorName).toBe("Jane Doe");
    expect(result[0].amountCents).toBe(5000);
    expect(result[0].status).toBe("completed");
  });

  it("throws FORBIDDEN for regular users", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.admin.recentDonors()).rejects.toThrow();
  });

  it("throws FORBIDDEN for unauthenticated users", async () => {
    const caller = appRouter.createCaller(makeAnonCtx());
    await expect(caller.admin.recentDonors()).rejects.toThrow();
  });

  it("throws INTERNAL_SERVER_ERROR when database is unavailable", async () => {
    vi.mocked(getDb).mockResolvedValue(null as never);
    const caller = appRouter.createCaller(makeAdminCtx());
    await expect(caller.admin.recentDonors()).rejects.toThrow("Database unavailable");
  });
});

describe("admin.campaignStats", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns aggregated stats for admin users", async () => {
    const mockGoal = {
      id: 1,
      title: "Annual Education Fund 2026",
      description: "Help us provide education for children.",
      goalCents: 1_000_000,
      deadline: new Date("2026-12-31T23:59:59Z"),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockAgg = [
      { status: "completed", totalCents: "250000", donors: "5" },
      { status: "pending", totalCents: "10000", donors: "2" },
    ];

    const db = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValueOnce([mockGoal]),
      groupBy: vi.fn().mockResolvedValue(mockAgg),
    };

    vi.mocked(getDb).mockResolvedValue(db as never);

    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.admin.campaignStats();

    expect(result.raisedCents).toBe(250000);
    expect(result.donorCount).toBe(5);
    expect(result.pendingCount).toBe(2);
    expect(result.goalCents).toBe(1_000_000);
    expect(result.percentComplete).toBe(25);
    expect(result.campaign?.title).toBe("Annual Education Fund 2026");
  });

  it("throws FORBIDDEN for regular users", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.admin.campaignStats()).rejects.toThrow();
  });
});

describe("admin.updateCampaignGoal", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates the campaign goal and returns the updated record", async () => {
    const updatedGoal = {
      id: 1,
      title: "Updated Campaign",
      description: "New description",
      goalCents: 2_000_000,
      deadline: new Date("2026-06-30T23:59:59Z"),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const db = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([updatedGoal]),
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
    };

    vi.mocked(getDb).mockResolvedValue(db as never);

    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.admin.updateCampaignGoal({
      id: 1,
      goalCents: 2_000_000,
      title: "Updated Campaign",
      description: "New description",
      deadline: "2026-06-30T23:59:59Z",
    });

    expect(result?.goalCents).toBe(2_000_000);
    expect(result?.title).toBe("Updated Campaign");
  });

  it("throws BAD_REQUEST when no fields are provided", async () => {
    const db = buildMockDb();
    vi.mocked(getDb).mockResolvedValue(db as never);

    const caller = appRouter.createCaller(makeAdminCtx());
    await expect(
      caller.admin.updateCampaignGoal({ id: 1 })
    ).rejects.toThrow("No fields to update");
  });

  it("throws FORBIDDEN for regular users", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(
      caller.admin.updateCampaignGoal({ id: 1, goalCents: 500000 })
    ).rejects.toThrow();
  });

  it("throws FORBIDDEN for unauthenticated users", async () => {
    const caller = appRouter.createCaller(makeAnonCtx());
    await expect(
      caller.admin.updateCampaignGoal({ id: 1, goalCents: 500000 })
    ).rejects.toThrow();
  });
});
