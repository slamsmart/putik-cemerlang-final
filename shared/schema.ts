import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const sliders = pgTable("sliders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull().default(""),
  ctaText: text("cta_text").notNull().default(""),
  ctaLink: text("cta_link").notNull().default("/"),
  imageUrl: text("image_url").notNull().default(""),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const stats = pgTable("stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  value: text("value").notNull(),
  label: text("label").notNull(),
  icon: text("icon").notNull(),
  highlight: boolean("highlight").notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  linkUrl: text("link_url").notNull().default("#"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSliderSchema = createInsertSchema(sliders).omit({
  id: true,
});

export const updateSliderSchema = insertSliderSchema.partial();

export const insertStatSchema = createInsertSchema(stats).omit({
  id: true,
});
export const updateStatSchema = insertStatSchema.partial();

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSlider = z.infer<typeof insertSliderSchema>;
export type UpdateSlider = z.infer<typeof updateSliderSchema>;
export type Slider = typeof sliders.$inferSelect;

export type InsertStat = z.infer<typeof insertStatSchema>;
export type UpdateStat = z.infer<typeof updateStatSchema>;
export type Stat = typeof stats.$inferSelect;
