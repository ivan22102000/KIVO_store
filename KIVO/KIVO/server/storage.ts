// Storage implementation using Supabase as database
// This replaces the in-memory storage with Supabase database operations
import { type Profile, type InsertProfile, type Product, type InsertProduct, type Promotion, type InsertPromotion } from "@shared/schema";
const { supabaseAdmin } = require('./lib/supabase.cjs');

export interface IStorage {
  // User/Profile operations
  getProfile(id: string): Promise<Profile | undefined>;
  getProfileByAuthUid(authUid: string): Promise<Profile | undefined>;
  getProfileByEmail(email: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(id: string, updates: Partial<Profile>): Promise<Profile>;

  // Product operations
  getAllProducts(filters?: { category?: string; search?: string; limit?: number; offset?: number }): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product>;
  deleteProduct(id: string): Promise<boolean>;
  getLowStockProducts(threshold?: number): Promise<Product[]>;

  // Promotion operations
  getAllPromotions(): Promise<Promotion[]>;
  getActivePromotions(): Promise<Promotion[]>;
  getPromotion(id: string): Promise<Promotion | undefined>;
  getPromotionsByProduct(productId: string): Promise<Promotion[]>;
  createPromotion(promotion: InsertPromotion, createdBy: string): Promise<Promotion>;
  updatePromotion(id: string, updates: Partial<Promotion>): Promise<Promotion>;
  deletePromotion(id: string): Promise<boolean>;
}

export class SupabaseStorage implements IStorage {
  constructor() {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not initialized. Please check SUPABASE_SERVICE_ROLE_KEY environment variable.');
    }
  }

  // Profile operations
  async getProfile(id: string): Promise<Profile | undefined> {
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return undefined; // Not found
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error getting profile:', error);
      throw error;
    }
  }

  async getProfileByAuthUid(authUid: string): Promise<Profile | undefined> {
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('auth_uid', authUid)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return undefined; // Not found
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error getting profile by auth uid:', error);
      throw error;
    }
  }

  async getProfileByEmail(email: string): Promise<Profile | undefined> {
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return undefined; // Not found
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error getting profile by email:', error);
      throw error;
    }
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .insert([profile])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  }

  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile> {
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  // Product operations
  async getAllProducts(filters: { category?: string; search?: string; limit?: number; offset?: number } = {}): Promise<Product[]> {
    try {
      let query = supabaseAdmin.from('products').select('*');
      
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
      }
      
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  }

  async getProduct(id: string): Promise<Product | undefined> {
    try {
      const { data, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return undefined; // Not found
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error getting product:', error);
      throw error;
    }
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    try {
      const { data, error } = await supabaseAdmin
        .from('products')
        .insert([{
          ...product,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    try {
      const { data, error } = await supabaseAdmin
        .from('products')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  async getLowStockProducts(threshold: number = 10): Promise<Product[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .lt('stock', threshold)
        .order('stock', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting low stock products:', error);
      throw error;
    }
  }

  // Promotion operations
  async getAllPromotions(): Promise<Promotion[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('promotions')
        .select(`
          *,
          products (
            id,
            name,
            price,
            image_url
          ),
          profiles!created_by (
            id,
            email
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting promotions:', error);
      throw error;
    }
  }

  async getActivePromotions(): Promise<Promotion[]> {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabaseAdmin
        .from('promotions')
        .select(`
          *,
          products (
            id,
            name,
            price,
            image_url
          )
        `)
        .lte('starts_at', now)
        .gte('ends_at', now)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting active promotions:', error);
      throw error;
    }
  }

  async getPromotion(id: string): Promise<Promotion | undefined> {
    try {
      const { data, error } = await supabaseAdmin
        .from('promotions')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return undefined; // Not found
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error getting promotion:', error);
      throw error;
    }
  }

  async getPromotionsByProduct(productId: string): Promise<Promotion[]> {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabaseAdmin
        .from('promotions')
        .select('*')
        .eq('product_id', productId)
        .lte('starts_at', now)
        .gte('ends_at', now)
        .order('discount_percent', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting product promotions:', error);
      throw error;
    }
  }

  async createPromotion(promotion: InsertPromotion, createdBy: string): Promise<Promotion> {
    try {
      // Validate dates server-side
      const startsAt = new Date(promotion.starts_at);
      const endsAt = new Date(promotion.ends_at);
      const now = new Date();

      if (startsAt >= endsAt) {
        throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
      }

      if (endsAt <= now) {
        throw new Error('La fecha de fin debe ser futura');
      }

      const { data, error } = await supabaseAdmin
        .from('promotions')
        .insert([{
          title: promotion.title,
          product_id: promotion.product_id,
          discount_percent: parseInt(promotion.discount_percent.toString()),
          starts_at: startsAt.toISOString(),
          ends_at: endsAt.toISOString(),
          created_by: createdBy,
          created_at: now.toISOString()
        }])
        .select(`
          *,
          products (
            id,
            name,
            price
          )
        `)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating promotion:', error);
      throw error;
    }
  }

  async updatePromotion(id: string, updates: Partial<Promotion>): Promise<Promotion> {
    try {
      // Validate dates if provided
      if (updates.starts_at && updates.ends_at) {
        const startsAt = new Date(updates.starts_at);
        const endsAt = new Date(updates.ends_at);

        if (startsAt >= endsAt) {
          throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
        }
      }

      const updateData: any = { ...updates };
      if (updateData.discount_percent) {
        updateData.discount_percent = parseInt(updateData.discount_percent.toString());
      }

      const { data, error } = await supabaseAdmin
        .from('promotions')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          products (
            id,
            name,
            price
          )
        `)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating promotion:', error);
      throw error;
    }
  }

  async deletePromotion(id: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('promotions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting promotion:', error);
      throw error;
    }
  }
}

// Export storage instance
export const storage = new SupabaseStorage();
