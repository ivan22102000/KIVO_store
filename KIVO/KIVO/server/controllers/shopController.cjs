// Shop controller - handles public store functionality
const ProductModel = require('../models/products.cjs');
const PromotionModel = require('../models/promotions.cjs');

class ShopController {
  // Display homepage with featured products and active promotions
  static async index(req, res) {
    try {
      const [products, promotions] = await Promise.all([
        ProductModel.getAllProducts(),
        PromotionModel.getActivePromotions()
      ]);

      // Limit to 6 featured products for homepage
      const featuredProducts = products.slice(0, 6);

      res.render('index', {
        title: 'KIVO "justo lo que necesitas" - Tienda Minimalista',
        products: featuredProducts,
        promotions,
        user: req.profile,
        isAuthenticated: !!req.user
      });
    } catch (error) {
      console.error('Error loading homepage:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Error al cargar la página principal',
        user: req.profile,
        isAuthenticated: !!req.user
      });
    }
  }

  // Display all products with filtering
  static async products(req, res) {
    try {
      const filters = {
        category: req.query.category,
        search: req.query.search
      };

      const products = await ProductModel.getAllProducts(filters);

      res.render('products', {
        title: 'Productos - KIVO "justo lo que necesitas"',
        products,
        filters,
        user: req.profile,
        isAuthenticated: !!req.user
      });
    } catch (error) {
      console.error('Error loading products:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Error al cargar los productos',
        user: req.profile,
        isAuthenticated: !!req.user
      });
    }
  }

  // Display single product with promotions
  static async product(req, res) {
    try {
      const productId = req.params.id;
      
      const [product, promotions] = await Promise.all([
        ProductModel.getProductById(productId),
        PromotionModel.getPromotionsByProduct(productId)
      ]);

      if (!product) {
        return res.status(404).render('error', {
          title: 'Producto no encontrado',
          message: 'El producto solicitado no existe',
          user: req.profile,
          isAuthenticated: !!req.user
        });
      }

      res.render('product', {
        title: `${product.name} - KIVO "justo lo que necesitas"`,
        product,
        promotions,
        user: req.profile,
        isAuthenticated: !!req.user
      });
    } catch (error) {
      console.error('Error loading product:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Error al cargar el producto',
        user: req.profile,
        isAuthenticated: !!req.user
      });
    }
  }

  // API endpoint to get products (public)
  static async getProductsAPI(req, res) {
    try {
      const filters = {
        category: req.query.category,
        search: req.query.search,
        limit: parseInt(req.query.limit) || undefined,
        offset: parseInt(req.query.offset) || 0
      };

      const products = await ProductModel.getAllProducts(filters);
      
      res.json({
        success: true,
        data: products,
        count: products.length
      });
    } catch (error) {
      console.error('Error fetching products API:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener productos',
        message: error.message
      });
    }
  }

  // API endpoint to get single product (public)
  static async getProductAPI(req, res) {
    try {
      const productId = req.params.id;
      const product = await ProductModel.getProductById(productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Producto no encontrado',
          message: 'El producto solicitado no existe'
        });
      }

      // Get active promotions for this product
      const promotions = await PromotionModel.getPromotionsByProduct(productId);

      res.json({
        success: true,
        data: {
          ...product,
          promotions
        }
      });
    } catch (error) {
      console.error('Error fetching product API:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener producto',
        message: error.message
      });
    }
  }

  // Display authentication page
  static auth(req, res) {
    res.render('auth', {
      title: 'Iniciar Sesión - KIVO "justo lo que necesitas"',
      user: null,
      isAuthenticated: false
    });
  }
}

module.exports = ShopController;
