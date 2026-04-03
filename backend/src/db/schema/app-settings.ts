import { pgTable, integer, text, timestamp } from "drizzle-orm/pg-core";

export const appSettingsTable = pgTable("app_settings", {
  id: integer("id").primaryKey().default(1),
  companyName: text("company_name").notNull().default("PerformIQ"),
  logoLetter: text("logo_letter").notNull().default("P"),
  primaryHsl: text("primary_hsl").notNull().default("221 83% 53%"),
  themeName: text("theme_name").notNull().default("blue"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type AppSettings = typeof appSettingsTable.$inferSelect;
