// Promotion model - handles promotion data with server-side time validation
const { supabaseAdmin } = require('../lib/supabase.cjs');

class PromotionModel {
  // Get all promotions with active status calculated server-side
  static async getAllPromotions() {
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
      console.error('Error fetching promotions:', error);
      throw error;
    }
  }

  // Get active promotions only
  static async getActivePromotions() {
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
      console.error('Error fetching active promotions:', error);
      throw error;
    }
  }

  // Create new promotion (admin only)
  static async createPromotion(promotionData, createdBy) {
    try {
      // Validate dates server-side
      const startsAt = new Date(promotionData.starts_at);
      const endsAt = new Date(promotionData.ends_at);
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
          title: promotionData.title,
          product_id: promotionData.product_id,
          discount_percent: parseInt(promotionData.discount_percent),
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

  // Update promotion (admin only)
  static async updatePromotion(id, promotionData) {
    try {
      // Validate dates if provided
      if (promotionData.starts_at && promotionData.ends_at) {
        const startsAt = new Date(promotionData.starts_at);
        const endsAt = new Date(promotionData.ends_at);

        if (startsAt >= endsAt) {
          throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
        }
      }

      const updateData = { ...promotionData };
      if (updateData.discount_percent) {
        updateData.discount_percent = parseInt(updateData.discount_percent);
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

  // Delete promotion (admin only)
  static async deletePromotion(id) {
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

  // Get promotions by product
  static async getPromotionsByProduct(productId) {
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
      console.error('Error fetching product promotions:', error);
      throw error;
    }
  }
}

module.exports = PromotionModel;
