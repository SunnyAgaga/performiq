import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";

export const hrQueriesTable = pgTable("hr_queries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull().default("general"),
  priority: text("priority").notNull().default("normal"),
  status: text("status").notNull().default("open"),
  assignedTo: integer("assigned_to"),
  response: text("response"),
  respondedBy: integer("responded_by"),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type HrQuery = typeof hrQueriesTable.$inferSelect;
