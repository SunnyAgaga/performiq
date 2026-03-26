import { pgTable, serial, text, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const criteriaTable = pgTable("criteria", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  weight: numeric("weight", { precision: 5, scale: 2 }).notNull().default("1"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCriterionSchema = createInsertSchema(criteriaTable).omit({ id: true, createdAt: true });
export type InsertCriterion = z.infer<typeof insertCriterionSchema>;
export type Criterion = typeof criteriaTable.$inferSelect;
