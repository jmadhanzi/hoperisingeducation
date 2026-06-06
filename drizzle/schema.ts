import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Donations table — stores essential Stripe identifiers and donor metadata.
 * Amounts are stored in cents to avoid floating-point issues.
 */
export const donations = mysqlTable("donations", {
  id: int("id").autoincrement().primaryKey(),
  /** Stripe PaymentIntent ID — primary reference for this transaction */
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }).unique(),
  /** Stripe Checkout Session ID — used to look up session before intent is confirmed */
  stripeSessionId: varchar("stripeSessionId", { length: 255 }).unique(),
  /** Amount in cents (e.g. 5000 = $50.00) */
  amountCents: int("amountCents").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("usd"),
  /** Donor display name — may differ from authenticated user name */
  donorName: varchar("donorName", { length: 255 }),
  donorEmail: varchar("donorEmail", { length: 320 }),
  /** Optional message from the donor */
  message: text("message"),
  /** Whether this is a recurring monthly donation */
  isRecurring: boolean("isRecurring").notNull().default(false),
  /** pending | completed | failed | refunded */
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).notNull().default("pending"),
  /** Optional link to authenticated user */
  userId: int("userId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Donation = typeof donations.$inferSelect;
export type InsertDonation = typeof donations.$inferInsert;
