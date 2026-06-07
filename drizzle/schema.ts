import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
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
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }).unique(),
  stripeSessionId: varchar("stripeSessionId", { length: 255 }).unique(),
  amountCents: int("amountCents").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("usd"),
  donorName: varchar("donorName", { length: 255 }),
  donorEmail: varchar("donorEmail", { length: 320 }),
  message: text("message"),
  isRecurring: boolean("isRecurring").notNull().default(false),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).notNull().default("pending"),
  userId: int("userId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Donation = typeof donations.$inferSelect;
export type InsertDonation = typeof donations.$inferInsert;

/**
 * Fundraising goals — configures the progress bar on the Donate page.
 * Only one goal should have isActive = true at a time.
 */
export const fundraisingGoals = mysqlTable("fundraisingGoals", {
  id: int("id").autoincrement().primaryKey(),
  /** Human-readable campaign title shown on the progress bar */
  title: varchar("title", { length: 255 }).notNull(),
  /** Campaign description shown beneath the title */
  description: text("description"),
  /** Fundraising target in cents (e.g. 1000000 = $10,000) */
  goalCents: int("goalCents").notNull(),
  /** Optional campaign deadline */
  deadline: timestamp("deadline"),
  /** Whether this campaign is currently shown on the Donate page */
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FundraisingGoal = typeof fundraisingGoals.$inferSelect;
export type InsertFundraisingGoal = typeof fundraisingGoals.$inferInsert;

/**
 * Blog / Impact Stories posts.
 * Content is stored as plain HTML (or markdown rendered to HTML).
 * Slugs must be unique and URL-safe.
 */
export const blogPosts = mysqlTable("blogPosts", {
  id: int("id").autoincrement().primaryKey(),
  /** URL-safe slug, e.g. "books-for-all-2024" */
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  /** Short summary shown on listing cards */
  excerpt: text("excerpt"),
  /** Full post body — stored as HTML */
  content: text("content").notNull(),
  /** S3 or external URL for the cover image */
  coverImageUrl: text("coverImageUrl"),
  /** Category tag, e.g. "Impact Story", "News", "Program Update" */
  category: varchar("category", { length: 100 }).notNull().default("Impact Story"),
  /** Display name of the author */
  author: varchar("author", { length: 255 }).notNull().default("Hope Rising Education"),
  /** Whether the post is publicly visible */
  published: boolean("published").notNull().default(false),
  /** Set when the post is first published */
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

/**
 * Media library — photos and videos uploaded by admins.
 * File bytes live in S3; this table stores metadata and the storage key.
 */
export const mediaFiles = mysqlTable("mediaFiles", {
  id: int("id").autoincrement().primaryKey(),
  /** S3 storage key returned by storagePut */
  key: varchar("key", { length: 512 }).notNull().unique(),
  /** Public URL path, e.g. /manus-storage/... */
  url: text("url").notNull(),
  /** Original filename from the upload */
  filename: varchar("filename", { length: 255 }).notNull(),
  /** MIME type, e.g. image/jpeg, video/mp4 */
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  /** File size in bytes */
  size: int("size").notNull().default(0),
  /** Optional alt text / caption */
  altText: text("altText"),
  /** Folder/category tag for organisation */
  folder: varchar("folder", { length: 100 }).notNull().default("general"),
  /** ID of the admin who uploaded the file */
  uploadedBy: int("uploadedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MediaFile = typeof mediaFiles.$inferSelect;
export type InsertMediaFile = typeof mediaFiles.$inferInsert;

/**
 * Site content key-value store — editable text blocks for public pages.
 * Each row is a named content slot (e.g. "hero.title", "mission.body").
 */
export const siteContent = mysqlTable("siteContent", {
  id: int("id").autoincrement().primaryKey(),
  /** Unique dot-notation key, e.g. "hero.title" */
  key: varchar("key", { length: 255 }).notNull().unique(),
  /** Human-readable label shown in the admin editor */
  label: varchar("label", { length: 255 }).notNull(),
  /** Content type: text (single line), textarea (multi-line), html (rich) */
  type: mysqlEnum("type", ["text", "textarea", "html"]).notNull().default("text"),
  /** The actual content value */
  value: text("value").notNull(),
  /** Optional section grouping for the admin UI */
  section: varchar("section", { length: 100 }).notNull().default("general"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteContent = typeof siteContent.$inferSelect;
export type InsertSiteContent = typeof siteContent.$inferInsert;
