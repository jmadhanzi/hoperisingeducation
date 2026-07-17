/**
 * Registrants router
 *
 * Public procedures:
 *   registrants.submit — submit a registration (from Get Involved / Contact form)
 *
 * Admin-only procedures (role === "admin"):
 *   registrants.list   — paginated list with search + date filter
 *   registrants.exportCsv — returns CSV string of all matching registrants
 */
import { eq, desc, and, like, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { registrants } from "../../drizzle/schema";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";

// ── Helpers ────────────────────────────────────────────────────────────────────

function adminGuard(role: string | undefined) {
  if (role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
}

function escapeCsvField(value: string | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCsv(rows: typeof registrants.$inferSelect[]): string {
  const header = ["ID", "Name", "Email", "Phone", "Interest", "Message", "Source", "Date"];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.id,
        escapeCsvField(r.name),
        escapeCsvField(r.email),
        escapeCsvField(r.phone),
        escapeCsvField(r.interest),
        escapeCsvField(r.message),
        escapeCsvField(r.source),
        r.createdAt.toISOString(),
      ].join(",")
    );
  }
  return lines.join("\n");
}

// ── Input schemas ──────────────────────────────────────────────────────────────

const filterSchema = z.object({
  search: z.string().max(100).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  source: z.string().max(100).optional(),
  limit: z.number().int().min(1).max(200).default(50),
  offset: z.number().int().min(0).default(0),
});

// ── Router ─────────────────────────────────────────────────────────────────────

export const registrantsRouter = router({
  // ── Public: submit registration ───────────────────────────────────────────
  submit: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        email: z.string().email().max(320),
        phone: z.string().max(50).optional(),
        interest: z.string().max(100).optional(),
        message: z.string().max(2000).optional(),
        source: z.string().max(100).default("get-involved"),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db.insert(registrants).values({
        name: input.name,
        email: input.email,
        phone: input.phone ?? null,
        interest: input.interest ?? null,
        message: input.message ?? null,
        source: input.source,
      });

      return { success: true };
    }),

  // ── Admin: list registrants ───────────────────────────────────────────────
  list: protectedProcedure
    .input(filterSchema)
    .query(async ({ input, ctx }) => {
      adminGuard(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const conditions = [];
      if (input.search) {
        conditions.push(
          sql`(${like(registrants.name, `%${input.search}%`)} OR ${like(registrants.email, `%${input.search}%`)})`
        );
      }
      if (input.dateFrom) conditions.push(gte(registrants.createdAt, new Date(input.dateFrom)));
      if (input.dateTo) conditions.push(lte(registrants.createdAt, new Date(input.dateTo)));
      if (input.source) conditions.push(eq(registrants.source, input.source));

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const rows = await db
        .select()
        .from(registrants)
        .where(whereClause)
        .orderBy(desc(registrants.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      const [{ total }] = await db
        .select({ total: sql<number>`count(*)` })
        .from(registrants)
        .where(whereClause);

      return { registrants: rows, total: Number(total) };
    }),

  // ── Admin: export CSV ─────────────────────────────────────────────────────
  exportCsv: protectedProcedure
    .input(
      z.object({
        search: z.string().max(100).optional(),
        dateFrom: z.string().datetime().optional(),
        dateTo: z.string().datetime().optional(),
        source: z.string().max(100).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      adminGuard(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const conditions = [];
      if (input.search) {
        conditions.push(
          sql`(${like(registrants.name, `%${input.search}%`)} OR ${like(registrants.email, `%${input.search}%`)})`
        );
      }
      if (input.dateFrom) conditions.push(gte(registrants.createdAt, new Date(input.dateFrom)));
      if (input.dateTo) conditions.push(lte(registrants.createdAt, new Date(input.dateTo)));
      if (input.source) conditions.push(eq(registrants.source, input.source));

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const rows = await db
        .select()
        .from(registrants)
        .where(whereClause)
        .orderBy(desc(registrants.createdAt));

      return { csv: buildCsv(rows), count: rows.length };
    }),
});
