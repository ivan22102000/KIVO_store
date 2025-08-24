// Admin controller - handles administrative functionality with proper JWT validation
const ProductModel = require('../models/products.cjs');
const PromotionModel = require('../models/promotions.cjs');
const { supabaseAdmin } = require('../lib/supabase.cjs');

class AdminController {
  // Display admin dashboard
  static async dashboard(req, res) {
    try {
      const [products, promotions, lowStockProducts] = await Promise.all([
        ProductModel.getAllProducts(),
        PromotionModel.getAllPromotions(),
        ProductModel.getLowStockProducts()
      ]);

      // Calculate metrics
      const totalProducts = products.length;
      const totalPromotions = promotions.length;
      const activePromotions = promotions.filter(p => {
        const now = new Date();
        return new Date(p.starts_at) <= now && new Date(p.ends_at) >= now;
      });

      // Mock metrics for demonstration (in real app, get from orders table)
      const metrics = {
        totalSales: 47290,
        totalOrders: 1847,
        activeUsers: 3249,
        conversionRate: 4.2,
        totalProducts,
        totalPromotions: activePromotions.length,
        lowStockCount: lowStockProducts.length
      };

      res.render('admin', {
        title: 'Dashboard Admin - KIVO "justo lo que necesitas"',
        products: products.slice(0, 10), // Limit for display
        promotions: promotions.slice(0, 5),
        lowStockProducts,
        metrics,
        user: req.profile,
        isAuthenticated: true
      });
    } catch (error) {
      console.error('Error loading admin dashboard:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Error al cargar el dashboard administrativo',
        user: req.profile,
        isAuthenticated: !!req.user
      });
    }
  }

  // API: Create new promotion (admin only)
  static async createPromotion(req, res) {
    try {
      const { title, product_id, discount_percent, starts_at, ends_at } = req.body;

      // Validation
      if (!title || !product_id || !discount_percent || !starts_at || !ends_at) {
        return res.status(400).json({
          success: false,
          error: 'Datos incompletos',
          message: 'Todos los campos son requeridos'
        });
      }

      if (discount_percent < 1 || discount_percent > 100) {
        return res.status(400).json({
          success: false,
          error: 'Descuento inválido',
          message: 'El descuento debe estar entre 1% y 100%'
        });
      }

      // Verify product exists
      const product = await ProductModel.getProductById(product_id);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Producto no encontrado',
          message: 'El producto seleccionado no existe'
        });
      }

      const promotion = await PromotionModel.createPromotion({
        title,
        product_id,
        discount_percent,
        starts_at,
        ends_at
      }, req.profile.id);

      res.status(201).json({
        success: true,
        message: 'Promoción creada exitosamente',
        data: promotion
      });
    } catch (error) {
      console.error('Error creating promotion:', error);
      res.status(500).json({
        success: false,
        error: 'Error al crear promoción',
        message: error.message
      });
    }
  }

  // API: Update promotion (admin only)
  static async updatePromotion(req, res) {
    try {
      const promotionId = req.params.id;
      const updateData = req.body;

      // Validate discount if provided
      if (updateData.discount_percent && (updateData.discount_percent < 1 || updateData.discount_percent > 100)) {
        return res.status(400).json({
          success: false,
          error: 'Descuento inválido',
          message: 'El descuento debe estar entre 1% y 100%'
        });
      }

      const promotion = await PromotionModel.updatePromotion(promotionId, updateData);

      res.json({
        success: true,
        message: 'Promoción actualizada exitosamente',
        data: promotion
      });
    } catch (error) {
      console.error('Error updating promotion:', error);
      res.status(500).json({
        success: false,
        error: 'Error al actualizar promoción',
        message: error.message
      });
    }
  }

  // API: Delete promotion (admin only)
  static async deletePromotion(req, res) {
    try {
      const promotionId = req.params.id;
      
      await PromotionModel.deletePromotion(promotionId);

      res.json({
        success: true,
        message: 'Promoción eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error deleting promotion:', error);
      res.status(500).json({
        success: false,
        error: 'Error al eliminar promoción',
        message: error.message
      });
    }
  }

  // API: Create product (admin only)
  static async createProduct(req, res) {
    try {
      const { name, description, price, stock, category, image_url } = req.body;

      // Validation
      if (!name || !description || !price || !stock) {
        return res.status(400).json({
          success: false,
          error: 'Datos incompletos',
          message: 'Nombre, descripción, precio y stock son requeridos'
        });
      }

      if (price <= 0 || stock < 0) {
        return res.status(400).json({
          success: false,
          error: 'Valores inválidos',
          message: 'El precio debe ser mayor a 0 y el stock no puede ser negativo'
        });
      }

      const product = await ProductModel.createProduct({
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        category: category || 'general',
        image_url: image_url || null
      });

      res.status(201).json({
        success: true,
        message: 'Producto creado exitosamente',
        data: product
      });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({
        success: false,
        error: 'Error al crear producto',
        message: error.message
      });
    }
  }

  // API: Update product (admin only)
  static async updateProduct(req, res) {
    try {
      const productId = req.params.id;
      const updateData = req.body;

      // Validate price and stock if provided
      if (updateData.price && updateData.price <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Precio inválido',
          message: 'El precio debe ser mayor a 0'
        });
      }

      if (updateData.stock && updateData.stock < 0) {
        return res.status(400).json({
          success: false,
          error: 'Stock inválido',
          message: 'El stock no puede ser negativo'
        });
      }

      // Convert numeric values
      if (updateData.price) updateData.price = parseFloat(updateData.price);
      if (updateData.stock) updateData.stock = parseInt(updateData.stock);

      const product = await ProductModel.updateProduct(productId, updateData);

      res.json({
        success: true,
        message: 'Producto actualizado exitosamente',
        data: product
      });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({
        success: false,
        error: 'Error al actualizar producto',
        message: error.message
      });
    }
  }

  // API: Delete product (admin only)
  static async deleteProduct(req, res) {
    try {
      const productId = req.params.id;
      
      await ProductModel.deleteProduct(productId);

      res.json({
        success: true,
        message: 'Producto eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({
        success: false,
        error: 'Error al eliminar producto',
        message: error.message
      });
    }
  }

  // API: Get admin metrics
  static async getMetrics(req, res) {
    try {
      const [products, promotions, lowStockProducts] = await Promise.all([
        ProductModel.getAllProducts(),
        PromotionModel.getAllPromotions(),
        ProductModel.getLowStockProducts()
      ]);

      const activePromotions = promotions.filter(p => {
        const now = new Date();
        return new Date(p.starts_at) <= now && new Date(p.ends_at) >= now;
      });

      const metrics = {
        totalProducts: products.length,
        totalPromotions: promotions.length,
        activePromotions: activePromotions.length,
        lowStockProducts: lowStockProducts.length,
        totalStock: products.reduce((sum, p) => sum + p.stock, 0),
        averagePrice: products.length > 0 ? 
          products.reduce((sum, p) => sum + parseFloat(p.price), 0) / products.length : 0
      };

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      console.error('Error getting metrics:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener métricas',
        message: error.message
      });
    }
  }
}

module.exports = AdminController;
