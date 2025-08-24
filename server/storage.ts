import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and, gte, lte, desc, asc, ilike, or } from "drizzle-orm";
import { 
  products, 
  promotions, 
  profiles,
  type Product, 
  type InsertProduct, 
  type UpdateProduct,
  type Promotion,
  type InsertPromotion,
  type UpdatePromotion,
  type Profile,
  type InsertProfile,
  type ProductWithPromotions,
  type PromotionWithProduct
} from "@shared/schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Clean the connection string in case it has the env var name prefix
const cleanConnectionString = connectionString.replace(/^DATABASE_URL=/, '');
const client = postgres(cleanConnectionString);
const db = drizzle(client);

export interface IStorage {
  // Products
  getProducts(params?: {
    search?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<Product[]>;
  
  getProductById(id: string): Promise<Product | null>;
  getProductWithPromotions(id: string): Promise<ProductWithPromotions | null>;
  createProduct(data: InsertProduct): Promise<Product>;
  updateProduct(id: string, data: UpdateProduct): Promise<Product | null>;
  deleteProduct(id: string): Promise<boolean>;
  
  // Promotions
  getPromotions(params?: {
    productId?: string;
    active?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<PromotionWithProduct[]>;
  
  getPromotionById(id: string): Promise<PromotionWithProduct | null>;
  getActivePromotions(): Promise<PromotionWithProduct[]>;
  createPromotion(data: InsertPromotion & { created_by: string }): Promise<Promotion>;
  updatePromotion(id: string, data: UpdatePromotion): Promise<Promotion | null>;
  deletePromotion(id: string): Promise<boolean>;
  
  // Profiles
  getProfiles(): Promise<Profile[]>;
  getProfileById(id: string): Promise<Profile | null>;
  getProfileByAuthId(authId: string): Promise<Profile | null>;
  createProfile(data: InsertProfile): Promise<Profile>;
  updateProfile(id: string, data: Partial<InsertProfile>): Promise<Profile | null>;
}

class DatabaseStorage implements IStorage {
  // Products
  async getProducts(params?: {
    search?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<Product[]> {
    let query = db.select().from(products);
    
    const conditions = [];
    
    if (params?.search) {
      conditions.push(
        or(
          ilike(products.name, `%${params.search}%`),
          ilike(products.description, `%${params.search}%`)
        )
      );
    }
    
    if (params?.category) {
      conditions.push(eq(products.category, params.category));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    query = query.orderBy(desc(products.created_at));
    
    if (params?.limit) {
      query = query.limit(params.limit);
    }
    
    if (params?.offset) {
      query = query.offset(params.offset);
    }
    
    return await query;
  }
  
  async getProductById(id: string): Promise<Product | null> {
    const result = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    
    return result[0] || null;
  }
  
  async getProductWithPromotions(id: string): Promise<ProductWithPromotions | null> {
    const product = await this.getProductById(id);
    if (!product) return null;
    
    const productPromotions = await db
      .select()
      .from(promotions)
      .where(
        and(
          eq(promotions.product_id, id),
          lte(promotions.starts_at, new Date()),
          gte(promotions.ends_at, new Date())
        )
      )
      .orderBy(desc(promotions.discount_percent));
    
    return {
      ...product,
      promotions: productPromotions
    };
  }
  
  async createProduct(data: InsertProduct): Promise<Product> {
    const result = await db
      .insert(products)
      .values(data)
      .returning();
    
    return result[0];
  }
  
  async updateProduct(id: string, data: UpdateProduct): Promise<Product | null> {
    const result = await db
      .update(products)
      .set(data)
      .where(eq(products.id, id))
      .returning();
    
    return result[0] || null;
  }
  
  async deleteProduct(id: string): Promise<boolean> {
    const result = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning();
    
    return result.length > 0;
  }
  
  // Promotions
  async getPromotions(params?: {
    productId?: string;
    active?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<PromotionWithProduct[]> {
    let query = db
      .select({
        id: promotions.id,
        title: promotions.title,
        product_id: promotions.product_id,
        discount_percent: promotions.discount_percent,
        starts_at: promotions.starts_at,
        ends_at: promotions.ends_at,
        created_by: promotions.created_by,
        created_at: promotions.created_at,
        products: products,
        profiles: profiles
      })
      .from(promotions)
      .leftJoin(products, eq(promotions.product_id, products.id))
      .leftJoin(profiles, eq(promotions.created_by, profiles.id));
    
    const conditions = [];
    
    if (params?.productId) {
      conditions.push(eq(promotions.product_id, params.productId));
    }
    
    if (params?.active) {
      const now = new Date();
      conditions.push(
        and(
          lte(promotions.starts_at, now),
          gte(promotions.ends_at, now)
        )
      );
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    query = query.orderBy(desc(promotions.created_at));
    
    if (params?.limit) {
      query = query.limit(params.limit);
    }
    
    if (params?.offset) {
      query = query.offset(params.offset);
    }
    
    return await query;
  }
  
  async getPromotionById(id: string): Promise<PromotionWithProduct | null> {
    const result = await db
      .select({
        id: promotions.id,
        title: promotions.title,
        product_id: promotions.product_id,
        discount_percent: promotions.discount_percent,
        starts_at: promotions.starts_at,
        ends_at: promotions.ends_at,
        created_by: promotions.created_by,
        created_at: promotions.created_at,
        products: products,
        profiles: profiles
      })
      .from(promotions)
      .leftJoin(products, eq(promotions.product_id, products.id))
      .leftJoin(profiles, eq(promotions.created_by, profiles.id))
      .where(eq(promotions.id, id))
      .limit(1);
    
    return result[0] || null;
  }
  
  async getActivePromotions(): Promise<PromotionWithProduct[]> {
    const now = new Date();
    return await db
      .select({
        id: promotions.id,
        title: promotions.title,
        product_id: promotions.product_id,
        discount_percent: promotions.discount_percent,
        starts_at: promotions.starts_at,
        ends_at: promotions.ends_at,
        created_by: promotions.created_by,
        created_at: promotions.created_at,
        products: products,
        profiles: profiles
      })
      .from(promotions)
      .leftJoin(products, eq(promotions.product_id, products.id))
      .leftJoin(profiles, eq(promotions.created_by, profiles.id))
      .where(
        and(
          lte(promotions.starts_at, now),
          gte(promotions.ends_at, now)
        )
      )
      .orderBy(desc(promotions.discount_percent));
  }
  
  async createPromotion(data: InsertPromotion & { created_by: string }): Promise<Promotion> {
    const result = await db
      .insert(promotions)
      .values(data)
      .returning();
    
    return result[0];
  }
  
  async updatePromotion(id: string, data: UpdatePromotion): Promise<Promotion | null> {
    const result = await db
      .update(promotions)
      .set(data)
      .where(eq(promotions.id, id))
      .returning();
    
    return result[0] || null;
  }
  
  async deletePromotion(id: string): Promise<boolean> {
    const result = await db
      .delete(promotions)
      .where(eq(promotions.id, id))
      .returning();
    
    return result.length > 0;
  }
  
  // Profiles
  async getProfiles(): Promise<Profile[]> {
    return await db
      .select()
      .from(profiles)
      .orderBy(desc(profiles.created_at));
  }
  
  async getProfileById(id: string): Promise<Profile | null> {
    const result = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, id))
      .limit(1);
    
    return result[0] || null;
  }
  
  async getProfileByAuthId(authId: string): Promise<Profile | null> {
    const result = await db
      .select()
      .from(profiles)
      .where(eq(profiles.auth_uid, authId))
      .limit(1);
    
    return result[0] || null;
  }
  
  async createProfile(data: InsertProfile): Promise<Profile> {
    const result = await db
      .insert(profiles)
      .values(data)
      .returning();
    
    return result[0];
  }
  
  async updateProfile(id: string, data: Partial<InsertProfile>): Promise<Profile | null> {
    const result = await db
      .update(profiles)
      .set(data)
      .where(eq(profiles.id, id))
      .returning();
    
    return result[0] || null;
  }
}

export const storage = new DatabaseStorage();
