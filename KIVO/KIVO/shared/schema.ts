import { sql } from "drizzle-orm";
import { pgTable, text, varchar, uuid, boolean, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication (linked to Supabase auth)
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  auth_uid: uuid("auth_uid").notNull().unique(), // Links to Supabase auth.users.id
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  is_admin: boolean("is_admin").default(false),
  created_at: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
});

// Products table
export const products = pgTable("products", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(0),
  category: varchar("category", { length: 100 }).default("general"),
  image_url: text("image_url"),
  created_at: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
  updated_at: timestamp("updated_at", { withTimezone: true }).default(sql`now()`),
});

// Promotions table with server-side time validation
export const promotions = pgTable("promotions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  product_id: uuid("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  discount_percent: integer("discount_percent").notNull(), // 1-100
  starts_at: timestamp("starts_at", { withTimezone: true }).notNull(),
  ends_at: timestamp("ends_at", { withTimezone: true }).notNull(),
  created_by: uuid("created_by").references(() => profiles.id).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
  // Note: active field is calculated server-side, not stored
});

// Insert schemas for validation
export const insertProfileSchema = createInsertSchema(profiles).pick({
  auth_uid: true,
  email: true,
  phone: true,
  is_admin: true,
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  description: true,
  price: true,
  stock: true,
  category: true,
  image_url: true,
}).extend({
  price: z.number().positive("Price must be positive"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
});

export const insertPromotionSchema = createInsertSchema(promotions).pick({
  title: true,
  product_id: true,
  discount_percent: true,
  starts_at: true,
  ends_at: true,
}).extend({
  discount_percent: z.number().int().min(1, "Discount must be at least 1%").max(100, "Discount cannot exceed 100%"),
  starts_at: z.string().or(z.date()),
  ends_at: z.string().or(z.date()),
});

// Update schemas
export const updateProductSchema = insertProductSchema.partial();
export const updatePromotionSchema = insertPromotionSchema.partial().omit({ product_id: true });

// Type exports
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;

export type Promotion = typeof promotions.$inferSelect;
export type InsertPromotion = z.infer<typeof insertPromotionSchema>;
export type UpdatePromotion = z.infer<typeof updatePromotionSchema>;

// Extended types with relations
export type ProductWithPromotions = Product & {
  promotions?: Promotion[];
};

export type PromotionWithProduct = Promotion & {
  products?: Product;
  profiles?: Profile;
};

// API response types
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// User type compatible with existing code
export const users = profiles; // Alias for compatibility
export type User = Profile;
export type InsertUser = InsertProfile;
export const insertUserSchema = insertProfileSchema;
