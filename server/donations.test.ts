import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import type { TrpcContext } from "./_core/context";

// ── Mock donation tiers ──────────────────────────────────────────────────────
vi.mock("./stripe", () => ({
  DONATION_TIERS: [
    { id: "tier_25", label: "Supporter", amountCents: 2500, description: "Test tier" },
  ],
}));

// ── Mock database ────────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null), // null = DB unavailable (safe for unit tests)
}));

// Keep each test independent: most historic reporting tests expect no database.
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getDb).mockResolvedValue(null);
});

// ── Helpers ──────────────────────────────────────────────────────────────────
function makePublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function makeAuthCtx(): TrpcContext {
  return {
    user: {
      id: 42,
      openId: "user-42",
      email: "donor@example.com",
      name: "Jane Donor",
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

// ── Tests ────────────────────────────────────────────────────────────────────
describe("donations.tiers", () => {
  it("returns the donation tiers array", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const tiers = await caller.donations.tiers();
    expect(Array.isArray(tiers)).toBe(true);
    expect(tiers.length).toBeGreaterThan(0);
    expect(tiers[0]).toHaveProperty("amountCents");
  });
});

function donationConfigurationDb(value: string | undefined) {
  return {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue(value === undefined ? [] : [{ value }]),
        })),
      })),
    })),
  };
}

describe("donations.createCheckoutSession", () => {
  it("returns the configured Raisely URL for an anonymous visitor", async () => {
    vi.mocked(getDb).mockResolvedValue(
      donationConfigurationDb("https://www.raisely.com/hope-rising") as never,
    );

    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.donations.createCheckoutSession()).resolves.toEqual({
      checkoutUrl: "https://www.raisely.com/hope-rising",
      provider: "raisely",
    });
  });

  it("does not require donor payment details or authentication to return the hosted campaign", async () => {
    vi.mocked(getDb).mockResolvedValue(
      donationConfigurationDb("https://donate.raisely.com/hope-rising") as never,
    );

    const caller = appRouter.createCaller(makeAuthCtx());
    await expect(caller.donations.createCheckoutSession()).resolves.toMatchObject({
      checkoutUrl: "https://donate.raisely.com/hope-rising",
      provider: "raisely",
    });
  });

  it("fails closed when no campaign URL has been configured", async () => {
    vi.mocked(getDb).mockResolvedValue(donationConfigurationDb(undefined) as never);

    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.donations.createCheckoutSession()).rejects.toMatchObject({
      code: "PRECONDITION_FAILED",
    });
  });

  it("fails closed for a non-Raisely stored URL", async () => {
    vi.mocked(getDb).mockResolvedValue(
      donationConfigurationDb("https://example.com/not-a-campaign") as never,
    );

    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.donations.createCheckoutSession()).rejects.toMatchObject({
      code: "PRECONDITION_FAILED",
    });
  });
});

describe("donations.myDonations", () => {
  it("throws UNAUTHORIZED when called without authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.donations.myDonations()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("throws INTERNAL_SERVER_ERROR when DB is unavailable for authenticated user", async () => {
    // DB is mocked as null — procedure should surface INTERNAL_SERVER_ERROR
    const caller = appRouter.createCaller(makeAuthCtx());
    await expect(caller.donations.myDonations()).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
  });

  it("is only accessible to authenticated users (protectedProcedure)", async () => {
    // Public caller must be rejected
    const publicCaller = appRouter.createCaller(makePublicCtx());
    await expect(publicCaller.donations.myDonations()).rejects.toThrow();

    // Authenticated caller must not throw UNAUTHORIZED (may throw INTERNAL_SERVER_ERROR due to null DB)
    const authCaller = appRouter.createCaller(makeAuthCtx());
    try {
      await authCaller.donations.myDonations();
    } catch (err: unknown) {
      const trpcErr = err as { code?: string };
      expect(trpcErr.code).not.toBe("UNAUTHORIZED");
    }
  });

  it("returns an array when DB returns rows (mocked DB with data)", async () => {
    // Override the DB mock to return a fake donations array for this test
    const { getDb } = await import("./db");
    const mockDonations = [
      {
        id: 1,
        stripeSessionId: "cs_test_abc",
        stripePaymentIntentId: "pi_test_abc",
        amountCents: 5000,
        currency: "usd",
        donorName: "Jane Donor",
        donorEmail: "donor@example.com",
        message: "Keep up the great work!",
        isRecurring: false,
        status: "completed",
        userId: 42,
        createdAt: new Date("2026-01-15T10:00:00Z"),
        updatedAt: new Date("2026-01-15T10:00:00Z"),
      },
    ];

    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue(mockDonations),
            }),
          }),
        }),
      }),
    };
    vi.mocked(getDb).mockResolvedValueOnce(mockDb as ReturnType<typeof mockDb.select>);

    const caller = appRouter.createCaller(makeAuthCtx());
    const result = await caller.donations.myDonations();

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);
    expect(result[0].amountCents).toBe(5000);
    expect(result[0].donorName).toBe("Jane Donor");
  });
});

describe("donations.fundraisingStats", () => {
  it("returns the expected shape with fallback defaults when DB is unavailable", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const stats = await caller.donations.fundraisingStats();

    // Shape assertions
    expect(stats).toHaveProperty("campaignTitle");
    expect(stats).toHaveProperty("campaignDescription");
    expect(stats).toHaveProperty("goalCents");
    expect(stats).toHaveProperty("raisedCents");
    expect(stats).toHaveProperty("donorCount");
    expect(stats).toHaveProperty("percentComplete");
    expect(stats).toHaveProperty("daysLeft");
    expect(stats).toHaveProperty("deadline");
  });

  it("returns zero raisedCents and donorCount when DB is unavailable", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const stats = await caller.donations.fundraisingStats();

    // DB is mocked as null, so aggregates should fall back to 0
    expect(stats.raisedCents).toBe(0);
    expect(stats.donorCount).toBe(0);
  });

  it("returns percentComplete between 0 and 100", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const stats = await caller.donations.fundraisingStats();

    expect(stats.percentComplete).toBeGreaterThanOrEqual(0);
    expect(stats.percentComplete).toBeLessThanOrEqual(100);
  });

  it("returns a positive goalCents value", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const stats = await caller.donations.fundraisingStats();

    expect(stats.goalCents).toBeGreaterThan(0);
  });

  it("returns daysLeft as a non-negative number or null", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const stats = await caller.donations.fundraisingStats();

    if (stats.daysLeft !== null) {
      expect(stats.daysLeft).toBeGreaterThanOrEqual(0);
    }
  });

  it("is accessible without authentication (public procedure)", async () => {
    // Should not throw UNAUTHORIZED
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.donations.fundraisingStats()).resolves.toBeDefined();
  });
});
