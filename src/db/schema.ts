import {
  boolean,
  date,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Mirrors supabase/schema.sql. Kept deliberately narrow — only the tables
 * the app touches. Run `npx drizzle-kit push` after changing it.
 *
 * `confirmed` and `confirmed_at` exist in the table but are unused: signup
 * is single opt-in. They are left in place so double opt-in can be turned on
 * later without a migration.
 */
export const subscribers = pgTable("subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  source: text("source"),
  confirmed: boolean("confirmed").notNull().default(false),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Subscriber = typeof subscribers.$inferSelect;

/* ------------------------------------------------------------------ */
/* Editor entries                                                      */
/* ------------------------------------------------------------------ */

export const signals = pgTable("signals", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  excerpt: text("excerpt"),
  heroImage: text("hero_image"),
  blocks: jsonb("blocks").notNull().default([]),
  dateLabel: text("date_label"),
  publishedOn: date("published_on"),
  classified: boolean("classified").notNull().default(false),
  status: text("status").notNull().default("draft"),
  broadcastId: text("broadcast_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull(),
  slug: text("slug"),
  codename: text("codename"),
  subtitle: text("subtitle"),
  summary: text("summary"),
  heroImage: text("hero_image"),
  blocks: jsonb("blocks").notNull().default([]),
  stage: text("stage").notNull().default("in_development"),
  classified: boolean("classified").notNull().default(true),
  status: text("status").notNull().default("draft"),
  sortOrder: integer("sort_order").notNull().default(0),
  broadcastId: text("broadcast_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SignalRow = typeof signals.$inferSelect;
export type ProjectRow = typeof projects.$inferSelect;
