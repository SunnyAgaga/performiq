import { pgTable, serial, integer, text, date, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const goalStatusEnum = pgEnum("goal_status", [
  "not_started",
  "in_progress",
  "completed",
  "cancelled",
]);

export const goalsTable = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  cycleId: integer("cycle_id"),
  title: text("title").notNull(),
  description: text("description"),
  status: goalStatusEnum("status").notNull().default("not_started"),
  dueDate: date("due_date"),
  progress: integer("progress").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertGoalSchema = createInsertSchema(goalsTable).omit({ id: true, createdAt: true });
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goalsTable.$inferSelect;
