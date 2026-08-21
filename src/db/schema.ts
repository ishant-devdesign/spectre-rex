import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Mirrors supabase/schema.sql. Kept deliberately narrow — only the table
 * the app writes to today. Run `npx drizzle-kit push` after changing it.
 */
export const contactMessages = pgTable(
  "contact_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    channel: text("channel").notNull().default("general"),
    name: text("name"),
    email: text("email").notNull(),
    subject: text("subject"),
    message: text("message").notNull(),
    sourcePath: text("source_path"),
    userAgent: text("user_agent"),
    handled: boolean("handled").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("contact_messages_created_idx").on(table.createdAt)],
);

export type ContactMessage = typeof contactMessages.$inferSelect;
export type NewContactMessage = typeof contactMessages.$inferInsert;

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
  blocks: jsonb("blocks").notNull().default([]),
  dateLabel: text("date_label"),
  dateRedacted: boolean("date_redacted").notNull().default(false),
  redactionBlocks: smallint("redaction_blocks").notNull().default(0),
  publishedOn: date("published_on"),
  classified: boolean("classified").notNull().default(false),
  status: text("status").notNull().default("draft"),
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
  imagePath: text("image_path"),
  blocks: jsonb("blocks").notNull().default([]),
  redactionBlocks: smallint("redaction_blocks").notNull().default(0),
  stage: text("stage").notNull().default("in_development"),
  classified: boolean("classified").notNull().default(true),
  status: text("status").notNull().default("draft"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SignalRow = typeof signals.$inferSelect;
export type ProjectRow = typeof projects.$inferSelect;
