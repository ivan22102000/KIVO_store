import { Express, Request, Response } from "express";
import { z } from "zod";
import { IStorage } from "./storage.js";
import { 
  insertProductSchema, 
  updateProductSchema,
  insertPromotionSchema,
  updatePromotionSchema,
  type ApiResponse 
} from "@shared/schema.js";

export function setupRoutes(app: Express, storage: IStorage) {
  
  // In-memory sample data for demo purposes
  const sampleProducts = [
    {
      id: '1',
      name: 'iPhone 15 Pro Max KIVO Edition',
      description: 'La revolución tecnológica que cambiará tu vida. Diseño titanio, cámara profesional, rendimiento extremo.',
      price: '1299.99',
      image_url: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
      category: 'electronics',
      in_stock: true,
      stock_quantity: 15,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '2',
      name: 'MacBook Pro M3 KIVO Special',
      description: 'Potencia sin límites para profesionales exigentes. Chip M3, pantalla Liquid Retina XDR, hasta 22h de autonomía.',
      price: '2499.99',
      image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
      category: 'electronics',
      in_stock: true,
      stock_quantity: 8,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '3',
      name: 'AirPods Pro 2 KIVO Crystal',
      description: 'Audio espacial personalizado, cancelación activa de ruido mejorada, comodidad todo el día.',
      price: '249.99',
      image_url: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
      category: 'electronics',
      in_stock: true,
      stock_quantity: 25,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '4',
      name: 'Sofá Modular KIVO Luxury',
      description: 'Comodidad premium para tu hogar. Diseño modular, telas premium, resistente y elegante.',
      price: '1899.99',
      image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
      category: 'home',
      in_stock: true,
      stock_quantity: 5,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '5',
      name: 'Reloj Inteligente KIVO Sport',
      description: 'Seguimiento avanzado de salud, GPS integrado, resistencia al agua, batería de 7 días.',
      price: '399.99',
      image_url: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
      category: 'accessories',
      in_stock: true,
      stock_quantity: 20,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '6',
      name: 'Cafetera Espresso KIVO Pro',
      description: 'Café de calidad barista en casa. Presión 19 bar, molinillo integrado, espuma de leche perfecta.',
      price: '799.99',
      image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
      category: 'home',
      in_stock: true,
      stock_quantity: 12,
      created_at: new Date(),
      updated_at: new Date()
    }
  ];
  
  const samplePromotions = [
    {
      id: '1',
      title: 'MEGA OFERTA KIVO - iPhone 15 Pro ¡Solo hoy!',
      product_id: '1',
      discount_percent: 25,
      starts_at: new Date(),
      ends_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      created_by: 'system',
      created_at: new Date(),
      product: sampleProducts[0],
      creator: { id: 'system', full_name: 'Sistema KIVO', email: 'admin@kivo.com', is_admin: true }
    },
    {
      id: '2',
      title: 'BLACK KIVO - MacBook Pro con descuento especial',
      product_id: '2',
      discount_percent: 15,
      starts_at: new Date(),
      ends_at: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
      created_by: 'system',
      created_at: new Date(),
      product: sampleProducts[1],
      creator: { id: 'system', full_name: 'Sistema KIVO', email: 'admin@kivo.com', is_admin: true }
    }
  ];
  
  console.log('Using in-memory sample data for KIVO demo');
  
  // API Routes
  
  // Products API
  app.get('/api/products', async (req: Request, res: Response) => {
    try {
      const { search, category, limit, offset } = req.query;
      
      const params = {
        search: search as string || undefined,
        category: category as string || undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      };
      
      // Use sample data if database is not available
      let products = [];
      try {
        products = await storage.getProducts(params);
      } catch (error) {
        console.log('Using sample data:', error.message);
        products = sampleProducts.filter(product => {
          if (params.search) {
            const searchTerm = params.search.toLowerCase();
            return product.name.toLowerCase().includes(searchTerm) ||
                   product.description.toLowerCase().includes(searchTerm);
          }
          if (params.category) {
            return product.category === params.category;
          }
          return true;
        }).slice(params.offset || 0, (params.offset || 0) + (params.limit || products.length));
      }
      
      const response: ApiResponse = {
        success: true,
        data: products,
        message: `Found ${products.length} products`
      };
      
      res.json(response);
    } catch (error) {
      console.error('Error fetching products:', error);
      
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch products'
      };
      
      res.status(500).json(response);
    }
  });
  
  app.get('/api/products/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        const response: ApiResponse = {
          success: false,
          error: 'Product ID is required'
        };
        return res.status(400).json(response);
      }
      
      let product = null;
      try {
        product = await storage.getProductById(id);
      } catch (error) {
        console.log('Using sample data for product:', error.message);
        product = sampleProducts.find(p => p.id === id);
      }
      
      if (!product) {
        const response: ApiResponse = {
          success: false,
          error: 'Product not found'
        };
        return res.status(404).json(response);
      }
      
      const response: ApiResponse = {
        success: true,
        data: product
      };
      
      res.json(response);
    } catch (error) {
      console.error('Error fetching product:', error);
      
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch product'
      };
      
      res.status(500).json(response);
    }
  });
  
  app.post('/api/products', async (req: Request, res: Response) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      
      const response: ApiResponse = {
        success: true,
        data: product,
        message: 'Product created successfully'
      };
      
      res.status(201).json(response);
    } catch (error) {
      console.error('Error creating product:', error);
      
      if (error instanceof z.ZodError) {
        const response: ApiResponse = {
          success: false,
          error: 'Validation failed',
          data: error.errors
        };
        return res.status(400).json(response);
      }
      
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create product'
      };
      
      res.status(500).json(response);
    }
  });
  
  app.put('/api/products/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validatedData = updateProductSchema.parse(req.body);
      
      const product = await storage.updateProduct(id, validatedData);
      
      if (!product) {
        const response: ApiResponse = {
          success: false,
          error: 'Product not found'
        };
        return res.status(404).json(response);
      }
      
      const response: ApiResponse = {
        success: true,
        data: product,
        message: 'Product updated successfully'
      };
      
      res.json(response);
    } catch (error) {
      console.error('Error updating product:', error);
      
      if (error instanceof z.ZodError) {
        const response: ApiResponse = {
          success: false,
          error: 'Validation failed',
          data: error.errors
        };
        return res.status(400).json(response);
      }
      
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update product'
      };
      
      res.status(500).json(response);
    }
  });
  
  app.delete('/api/products/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteProduct(id);
      
      if (!deleted) {
        const response: ApiResponse = {
          success: false,
          error: 'Product not found'
        };
        return res.status(404).json(response);
      }
      
      const response: ApiResponse = {
        success: true,
        message: 'Product deleted successfully'
      };
      
      res.json(response);
    } catch (error) {
      console.error('Error deleting product:', error);
      
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete product'
      };
      
      res.status(500).json(response);
    }
  });
  
  // Promotions API
  app.get('/api/promotions', async (req: Request, res: Response) => {
    try {
      const { product_id, active, limit, offset } = req.query;
      
      const params = {
        productId: product_id as string || undefined,
        active: active === 'true' || undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      };
      
      let promotions = [];
      try {
        promotions = await storage.getPromotions(params);
      } catch (error) {
        console.log('Using sample promotions:', error.message);
        promotions = samplePromotions.filter(promo => {
          if (params.productId) {
            return promo.product_id === params.productId;
          }
          if (params.active) {
            const now = new Date();
            return new Date(promo.starts_at) <= now && new Date(promo.ends_at) >= now;
          }
          return true;
        }).slice(params.offset || 0, (params.offset || 0) + (params.limit || promotions.length));
      }
      
      const response: ApiResponse = {
        success: true,
        data: promotions,
        message: `Found ${promotions.length} promotions`
      };
      
      res.json(response);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch promotions'
      };
      
      res.status(500).json(response);
    }
  });
  
  app.get('/api/promotions/active', async (req: Request, res: Response) => {
    try {
      let promotions = [];
      try {
        promotions = await storage.getActivePromotions();
      } catch (error) {
        console.log('Using sample active promotions:', error.message);
        const now = new Date();
        promotions = samplePromotions.filter(promo => 
          new Date(promo.starts_at) <= now && new Date(promo.ends_at) >= now
        );
      }
      
      const response: ApiResponse = {
        success: true,
        data: promotions,
        message: `Found ${promotions.length} active promotions`
      };
      
      res.json(response);
    } catch (error) {
      console.error('Error fetching active promotions:', error);
      
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch active promotions'
      };
      
      res.status(500).json(response);
    }
  });
  
  app.get('/api/promotions/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const promotion = await storage.getPromotionById(id);
      
      if (!promotion) {
        const response: ApiResponse = {
          success: false,
          error: 'Promotion not found'
        };
        return res.status(404).json(response);
      }
      
      const response: ApiResponse = {
        success: true,
        data: promotion
      };
      
      res.json(response);
    } catch (error) {
      console.error('Error fetching promotion:', error);
      
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch promotion'
      };
      
      res.status(500).json(response);
    }
  });
  
  app.post('/api/promotions', async (req: Request, res: Response) => {
    try {
      // TODO: Get created_by from authenticated user session
      // For now, we'll use a placeholder - this should be replaced with actual auth
      const created_by = req.body.created_by || "placeholder-admin-id";
      
      const validatedData = insertPromotionSchema.parse(req.body);
      const promotion = await storage.createPromotion({
        ...validatedData,
        created_by
      });
      
      const response: ApiResponse = {
        success: true,
        data: promotion,
        message: 'Promotion created successfully'
      };
      
      res.status(201).json(response);
    } catch (error) {
      console.error('Error creating promotion:', error);
      
      if (error instanceof z.ZodError) {
        const response: ApiResponse = {
          success: false,
          error: 'Validation failed',
          data: error.errors
        };
        return res.status(400).json(response);
      }
      
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create promotion'
      };
      
      res.status(500).json(response);
    }
  });
  
  app.put('/api/promotions/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validatedData = updatePromotionSchema.parse(req.body);
      
      const promotion = await storage.updatePromotion(id, validatedData);
      
      if (!promotion) {
        const response: ApiResponse = {
          success: false,
          error: 'Promotion not found'
        };
        return res.status(404).json(response);
      }
      
      const response: ApiResponse = {
        success: true,
        data: promotion,
        message: 'Promotion updated successfully'
      };
      
      res.json(response);
    } catch (error) {
      console.error('Error updating promotion:', error);
      
      if (error instanceof z.ZodError) {
        const response: ApiResponse = {
          success: false,
          error: 'Validation failed',
          data: error.errors
        };
        return res.status(400).json(response);
      }
      
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update promotion'
      };
      
      res.status(500).json(response);
    }
  });
  
  app.delete('/api/promotions/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deletePromotion(id);
      
      if (!deleted) {
        const response: ApiResponse = {
          success: false,
          error: 'Promotion not found'
        };
        return res.status(404).json(response);
      }
      
      const response: ApiResponse = {
        success: true,
        message: 'Promotion deleted successfully'
      };
      
      res.json(response);
    } catch (error) {
      console.error('Error deleting promotion:', error);
      
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete promotion'
      };
      
      res.status(500).json(response);
    }
  });
  
  // Profiles API
  app.get('/api/profiles', async (req: Request, res: Response) => {
    try {
      const profiles = await storage.getProfiles();
      
      const response: ApiResponse = {
        success: true,
        data: profiles,
        message: `Found ${profiles.length} profiles`
      };
      
      res.json(response);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch profiles'
      };
      
      res.status(500).json(response);
    }
  });
  
  app.get('/api/profiles/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const profile = await storage.getProfileById(id);
      
      if (!profile) {
        const response: ApiResponse = {
          success: false,
          error: 'Profile not found'
        };
        return res.status(404).json(response);
      }
      
      const response: ApiResponse = {
        success: true,
        data: profile
      };
      
      res.json(response);
    } catch (error) {
      console.error('Error fetching profile:', error);
      
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch profile'
      };
      
      res.status(500).json(response);
    }
  });
  
  // Newsletter subscription endpoint
  app.post('/api/newsletter/subscribe', async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email || !email.includes('@')) {
        const response: ApiResponse = {
          success: false,
          error: 'Valid email address is required'
        };
        return res.status(400).json(response);
      }
      
      // TODO: Implement actual newsletter subscription logic
      // For now, we'll just return success
      const response: ApiResponse = {
        success: true,
        message: 'Successfully subscribed to newsletter',
        data: { email }
      };
      
      res.json(response);
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to subscribe to newsletter'
      };
      
      res.status(500).json(response);
    }
  });
  
  // Cart simulation endpoints (for future implementation)
  app.post('/api/cart/add', async (req: Request, res: Response) => {
    try {
      const { productId, quantity = 1 } = req.body;
      
      if (!productId) {
        const response: ApiResponse = {
          success: false,
          error: 'Product ID is required'
        };
        return res.status(400).json(response);
      }
      
      // Verify product exists
      const product = await storage.getProductById(productId);
      if (!product) {
        const response: ApiResponse = {
          success: false,
          error: 'Product not found'
        };
        return res.status(404).json(response);
      }
      
      // Check stock
      if (product.stock < quantity) {
        const response: ApiResponse = {
          success: false,
          error: 'Insufficient stock available'
        };
        return res.status(400).json(response);
      }
      
      // TODO: Implement actual cart logic with sessions/database
      const response: ApiResponse = {
        success: true,
        message: 'Product added to cart successfully',
        data: { productId, quantity, productName: product.name }
      };
      
      res.json(response);
    } catch (error) {
      console.error('Error adding to cart:', error);
      
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add product to cart'
      };
      
      res.status(500).json(response);
    }
  });
  
  // Error handling middleware
  app.use((error: Error, req: Request, res: Response, next: any) => {
    console.error('Unhandled error:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Internal server error'
    };
    
    res.status(500).json(response);
  });
  
  // 404 handler for API routes
  app.use('/api/*', (req: Request, res: Response) => {
    const response: ApiResponse = {
      success: false,
      error: 'API endpoint not found'
    };
    
    res.status(404).json(response);
  });
}
