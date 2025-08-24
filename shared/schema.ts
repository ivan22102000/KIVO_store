import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Profiles table
export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").references(() => users.id),
  full_name: text("full_name"),
  email: text("email"),
  is_admin: boolean("is_admin").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Products table
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  image_url: text("image_url"),
  category: text("category"),
  in_stock: boolean("in_stock").default(true),
  stock_quantity: integer("stock_quantity").default(0),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Promotions table
export const promotions = pgTable("promotions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  product_id: varchar("product_id").references(() => products.id),
  discount_percent: integer("discount_percent").notNull(),
  starts_at: timestamp("starts_at").notNull(),
  ends_at: timestamp("ends_at").notNull(),
  created_by: varchar("created_by").references(() => profiles.id),
  created_at: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.user_id],
  }),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users, {
    fields: [profiles.user_id],
    references: [users.id],
  }),
  promotions: many(promotions),
}));

export const productsRelations = relations(products, ({ many }) => ({
  promotions: many(promotions),
}));

export const promotionsRelations = relations(promotions, ({ one }) => ({
  product: one(products, {
    fields: [promotions.product_id],
    references: [products.id],
  }),
  creator: one(profiles, {
    fields: [promotions.created_by],
    references: [profiles.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const updateProductSchema = insertProductSchema.partial();

export const insertPromotionSchema = createInsertSchema(promotions).omit({
  id: true,
  created_at: true,
});

export const updatePromotionSchema = insertPromotionSchema.partial();

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertPromotion = z.infer<typeof insertPromotionSchema>;
export type UpdatePromotion = z.infer<typeof updatePromotionSchema>;
export type Promotion = typeof promotions.$inferSelect;

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

// Composite types
export type ProductWithPromotions = Product & {
  promotions: Promotion[];
};

export type PromotionWithProduct = Promotion & {
  product: Product;
  creator: Profile;
};

// API Response type
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};
