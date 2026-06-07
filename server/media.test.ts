/**
 * Tests for media and siteContent tRPC procedures.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";

// ── Mock DB ───────────────────────────────────────────────────────────────────
vi.mock("../server/db", () => ({
  getDb: vi.fn(),
}));

vi.mock("../server/storage", () => ({
  storagePut: vi.fn().mockResolvedValue({
    key: "media/general/test-1234567890.jpg",
    url: "/manus-storage/media/general/test-1234567890.jpg",
  }),
}));

import { getDb } from "../server/db";
import { appRouter } from "../server/routers";

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeAdminCtx() {
  return {
    user: { id: 1, name: "Admin", email: "admin@test.com", role: "admin" as const, openId: "admin-open-id", loginMethod: "oauth", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { headers: {} } as any,
    res: {} as any,
  };
}

function makeUserCtx() {
  return {
    user: { id: 2, name: "User", email: "user@test.com", role: "user" as const, openId: "user-open-id", loginMethod: "oauth", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { headers: {} } as any,
    res: {} as any,
  };
}

function makePublicCtx() {
  return {
    user: null,
    req: { headers: {} } as any,
    res: {} as any,
  };
}

// ── siteContent tests ─────────────────────────────────────────────────────────
describe("siteContent.getAll", () => {
  it("returns default content map when DB is unavailable", async () => {
    vi.mocked(getDb).mockResolvedValue(null as any);
    const caller = appRouter.createCaller(makePublicCtx() as any);
    const result = await caller.siteContent.getAll();
    expect(result).toBeTypeOf("object");
    expect(result["hero.title1"]).toBeDefined();
    expect(result["hero.subtitle"]).toBeDefined();
  });

  it("returns merged DB values when DB is available", async () => {
    const mockRows = [
      { id: 1, key: "hero.title1", value: "Custom Title", label: "Hero Title", type: "text", section: "Hero", updatedAt: new Date() },
    ];
    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockResolvedValue(mockRows),
    };
    vi.mocked(getDb).mockResolvedValue(mockDb as any);

    const caller = appRouter.createCaller(makePublicCtx() as any);
    const result = await caller.siteContent.getAll();
    expect(result["hero.title1"]).toBe("Custom Title");
  });
});

describe("siteContent.getAllFull", () => {
  it("throws FORBIDDEN for non-admin users", async () => {
    const caller = appRouter.createCaller(makeUserCtx() as any);
    await expect(caller.siteContent.getAllFull()).rejects.toThrow(TRPCError);
  });

  it("returns full rows for admin users", async () => {
    const mockRows = [
      { id: 1, key: "hero.title1", value: "Title", label: "Hero Title", type: "text", section: "Hero", updatedAt: new Date() },
    ];
    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue(mockRows),
    };
    vi.mocked(getDb).mockResolvedValue(mockDb as any);

    const caller = appRouter.createCaller(makeAdminCtx() as any);
    const result = await caller.siteContent.getAllFull();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("siteContent.upsert", () => {
  it("throws FORBIDDEN for non-admin users", async () => {
    const caller = appRouter.createCaller(makeUserCtx() as any);
    await expect(
      caller.siteContent.upsert({ key: "hero.title1", value: "New Title" })
    ).rejects.toThrow(TRPCError);
  });

  it("throws INTERNAL_SERVER_ERROR when DB is unavailable", async () => {
    vi.mocked(getDb).mockResolvedValue(null as any);
    const caller = appRouter.createCaller(makeAdminCtx() as any);
    await expect(
      caller.siteContent.upsert({ key: "hero.title1", value: "New Title" })
    ).rejects.toThrow(TRPCError);
  });
});

describe("siteContent.upsertMany", () => {
  it("throws FORBIDDEN for non-admin users", async () => {
    const caller = appRouter.createCaller(makeUserCtx() as any);
    await expect(
      caller.siteContent.upsertMany([{ key: "hero.title1", value: "New" }])
    ).rejects.toThrow(TRPCError);
  });
});

// ── media tests ───────────────────────────────────────────────────────────────
describe("media.list", () => {
  it("throws FORBIDDEN for non-admin users", async () => {
    const caller = appRouter.createCaller(makeUserCtx() as any);
    await expect(caller.media.list({})).rejects.toThrow(TRPCError);
  });

  it("returns empty list when DB is unavailable", async () => {
    vi.mocked(getDb).mockResolvedValue(null as any);
    const caller = appRouter.createCaller(makeAdminCtx() as any);
    const result = await caller.media.list({});
    expect(result.files).toEqual([]);
    expect(result.total).toBe(0);
  });
});

describe("media.delete", () => {
  it("throws FORBIDDEN for non-admin users", async () => {
    const caller = appRouter.createCaller(makeUserCtx() as any);
    await expect(caller.media.delete({ id: 1 })).rejects.toThrow(TRPCError);
  });

  it("throws INTERNAL_SERVER_ERROR when DB is unavailable", async () => {
    vi.mocked(getDb).mockResolvedValue(null as any);
    const caller = appRouter.createCaller(makeAdminCtx() as any);
    await expect(caller.media.delete({ id: 1 })).rejects.toThrow(TRPCError);
  });
});

describe("media.upload", () => {
  it("throws FORBIDDEN for non-admin users", async () => {
    const caller = appRouter.createCaller(makeUserCtx() as any);
    await expect(
      caller.media.upload({
        filename: "test.jpg",
        mimeType: "image/jpeg",
        base64: Buffer.from("test").toString("base64"),
        folder: "general",
      })
    ).rejects.toThrow(TRPCError);
  });

  it("throws INTERNAL_SERVER_ERROR when DB is unavailable", async () => {
    vi.mocked(getDb).mockResolvedValue(null as any);
    const caller = appRouter.createCaller(makeAdminCtx() as any);
    await expect(
      caller.media.upload({
        filename: "test.jpg",
        mimeType: "image/jpeg",
        base64: Buffer.from("test").toString("base64"),
        folder: "general",
      })
    ).rejects.toThrow(TRPCError);
  });
});
