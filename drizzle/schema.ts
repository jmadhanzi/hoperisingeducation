import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing the managed authentication flow.
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
 * Donations table retained for historical Stripe records. New public donation
 * calls are routed to Raisely and are not handled by this application.
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
 * Fundraising goals retained for historical impact reporting and campaign copy.
 */
export const fundraisingGoals = mysqlTable("fundraisingGoals", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  goalCents: int("goalCents").notNull(),
  deadline: timestamp("deadline"),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FundraisingGoal = typeof fundraisingGoals.$inferSelect;
export type InsertFundraisingGoal = typeof fundraisingGoals.$inferInsert;

/**
 * Small, structured page content blocks. The UI treats all values as plain
 * text; no raw HTML is stored or rendered on public pages.
 */
export const siteContent = mysqlTable(
  "siteContent",
  {
    id: int("id").autoincrement().primaryKey(),
    page: varchar("page", { length: 80 }).notNull(),
    contentKey: varchar("contentKey", { length: 120 }).notNull(),
    label: varchar("label", { length: 255 }).notNull(),
    value: text("value").notNull(),
    isPublished: boolean("isPublished").notNull().default(true),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    pageContentKeyUnique: uniqueIndex("siteContent_page_contentKey_unique").on(
      table.page,
      table.contentKey,
    ),
  }),
);

export type SiteContent = typeof siteContent.$inferSelect;
export type InsertSiteContent = typeof siteContent.$inferInsert;

/**
 * Administrator-curated marketing videos. URLs may originate from managed
 * object storage or a vetted external video host.
 */
export const marketingVideos = mysqlTable("marketingVideos", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  videoUrl: varchar("videoUrl", { length: 1024 }).notNull(),
  thumbnailUrl: varchar("thumbnailUrl", { length: 1024 }),
  isFeatured: boolean("isFeatured").notNull().default(false),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MarketingVideo = typeof marketingVideos.$inferSelect;
export type InsertMarketingVideo = typeof marketingVideos.$inferInsert;

/**
 * Time-bounded public announcements. Each announcement is plain text so it
 * can be rendered safely and consistently across the website.
 */
export const announcements = mysqlTable("announcements", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
  ctaLabel: varchar("ctaLabel", { length: 80 }),
  ctaUrl: varchar("ctaUrl", { length: 1024 }),
  isActive: boolean("isActive").notNull().default(true),
  startsAt: timestamp("startsAt"),
  endsAt: timestamp("endsAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = typeof announcements.$inferInsert;

/**
 * Persisted contact and volunteer submissions. Records stay server-side and
 * are only exposed through administrator procedures or a generated CSV export.
 */
export const registrations = mysqlTable("registrations", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["contact", "volunteer"]).notNull(),
  status: mysqlEnum("status", ["new", "in_progress", "archived"]).notNull().default("new"),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  subject: varchar("subject", { length: 255 }),
  interest: varchar("interest", { length: 100 }),
  location: varchar("location", { length: 255 }),
  skills: varchar("skills", { length: 500 }),
  hoursPerWeek: varchar("hoursPerWeek", { length: 50 }),
  message: text("message"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Registration = typeof registrations.$inferSelect;
export type InsertRegistration = typeof registrations.$inferInsert;

/**
 * Server-managed public configuration. Settings are keyed so only selected,
 * explicitly public values are returned to public website visitors.
 */
export const siteSettings = mysqlTable("siteSettings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 120 }).notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = typeof siteSettings.$inferInsert;
