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
  status: text("status").notNull().default("draft"),
  featured: boolean("featured").notNull().default(false),
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
  status: text("status").notNull().default("draft"),
  featured: boolean("featured").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  broadcastId: text("broadcast_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const templates = pgTable("templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  kind: text("kind").notNull(), // 'signal' | 'project' | 'email'
  title: text("title"),
  subtitle: text("subtitle"),
  summary: text("summary"),
  heroImage: text("hero_image"),
  blocks: jsonb("blocks").notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SignalRow = typeof signals.$inferSelect;
export type ProjectRow = typeof projects.$inferSelect;
export type TemplateRow = typeof templates.$inferSelect;
