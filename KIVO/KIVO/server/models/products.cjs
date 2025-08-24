// Product model - handles product data operations
const { supabaseAdmin } = require('../lib/supabase.cjs');

class ProductModel {
  // Get all products with optional filtering
  static async getAllProducts(filters = {}) {
    try {
      let query = supabaseAdmin.from('products').select('*');
      
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // Get single product by ID
  static async getProductById(id) {
    try {
      const { data, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  // Create new product (admin only)
  static async createProduct(productData) {
    try {
      const { data, error } = await supabaseAdmin
        .from('products')
        .insert([{
          ...productData,
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

  // Update product (admin only)
  static async updateProduct(id, productData) {
    try {
      const { data, error } = await supabaseAdmin
        .from('products')
        .update({
          ...productData,
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

  // Delete product (admin only)
  static async deleteProduct(id) {
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

  // Get products with low stock
  static async getLowStockProducts(threshold = 10) {
    try {
      const { data, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .lt('stock', threshold)
        .order('stock', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      throw error;
    }
  }
}

module.exports = ProductModel;
