import { pgTable, serial, text, numeric, timestamp } from "drizzle-orm/pg-core";

export const criteriaTable = pgTable("criteria", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  weight: numeric("weight", { precision: 5, scale: 2 }).notNull().default("1"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Criterion = typeof criteriaTable.$inferSelect;
