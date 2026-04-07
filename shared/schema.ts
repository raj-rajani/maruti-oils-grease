import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").default(0),
});

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  categoryId: integer("category_id").notNull(),
  price: text("price"), // stored as string for display flexibility (e.g., "₹450/L")
  unit: text("unit").default("L"), // L, KG, Can, Barrel, etc.
  packSize: text("pack_size"), // e.g., "1L", "3.5L", "210L Barrel"
  brand: text("brand"), // e.g., Castrol, Shell, IOCL, Mobil
  grade: text("grade"), // e.g., 5W30, 20W40, 80W90
  stockQty: integer("stock_qty").default(0),
  inStock: integer("in_stock", { mode: "boolean" }).default(true),
  imageUrl: text("image_url"),
  featured: integer("featured", { mode: "boolean" }).default(false),
});

export const siteSettings = sqliteTable("site_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type SiteSetting = typeof siteSettings.$inferSelect;
