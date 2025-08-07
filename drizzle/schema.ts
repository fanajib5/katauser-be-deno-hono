import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  json,
  real,
  primaryKey,
} from "drizzle-orm/pg-core";

// 🔹 Table: organizations
export const organizations = pgTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  plan: text("plan").notNull().default("free"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

// 🔹 Table: users
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  email: text("email").notNull().unique(),
  name: text("name"),
  role: text("role").notNull().default("member"),
  passwordHash: text("password_hash"),
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

// 🔹 Table: projects
export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").unique(),
  subdomain: text("subdomain").unique(),
  customDomain: text("custom_domain").unique(),
  domainVerified: boolean("domain_verified").notNull().default(false),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

// 🔹 Table: feedback
export const feedback = pgTable("feedback", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  type: text("type").notNull().default("suggestion"),
  content: text("content").notNull(),
  name: text("name"),
  email: text("email"),
  source: text("source").notNull(), // embed | public_page
  sourceUrl: text("source_url"),
  status: text("status").notNull().default("baru"),
  metadata: json("metadata").$type<Record<string, any>>(),
  receivedAt: timestamp("received_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

// 🔹 Table: tags
export const tags = pgTable("tags", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color").default("#6b7280"),
  order: text("order").default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 🔹 Junction: feedback_tags
export const feedbackTags = pgTable(
  "feedback_tags",
  {
    feedbackId: text("feedback_id")
      .notNull()
      .references(() => feedback.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.feedbackId, t.tagId] }),
  }),
);

// 🔹 Table: feedback_analysis
export const feedbackAnalysis = pgTable("feedback_analysis", {
  id: text("id").primaryKey(),
  feedbackId: text("feedback_id")
    .notNull()
    .unique()
    .references(() => feedback.id, { onDelete: "cascade" }),
  sentimentScore: real("sentiment_score"),
  sentimentLabel: text("sentiment_label"),
  topics: json("topics").$type<string[]>(),
  language: text("language"),
  summary: text("summary"),
  analyzedAt: timestamp("analyzed_at").notNull().defaultNow(),
});
