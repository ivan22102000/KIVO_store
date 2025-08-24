import type { Express, Request, Response } from "express";
import express from "express";
import { createServer, type Server } from "http";
import path from "path";

// Import controllers and middleware will be done dynamically

// Extend Request interface to include custom properties
interface CustomRequest extends Request {
  user?: any;
  profile?: any;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Import controllers and middleware dynamically (CommonJS modules)
  const ShopController = (await import('./controllers/shopController.cjs' as any)).default || await import('./controllers/shopController.cjs' as any);
  const AdminController = (await import('./controllers/adminController.cjs' as any)).default || await import('./controllers/adminController.cjs' as any);
  const authMiddleware = await import('./middleware/auth.cjs' as any);
  const { requireAuth, requireAdmin, optionalAuth } = authMiddleware.default || authMiddleware;

  // Set view engine and views directory
  app.set('view engine', 'ejs');
  app.set('views', path.join(process.cwd(), 'server', 'views'));
  
  // Serve static files
  app.use(express.static(path.join(process.cwd(), 'server', 'public')));
  
  // Environment variables for client-side
  app.use((req, res, next) => {
    res.locals.ENV = {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
    };
    next();
  });

  // Public routes with optional auth (for navigation)
  app.get('/', optionalAuth, ShopController.index);
  app.get('/products', optionalAuth, ShopController.products);
  app.get('/product/:id', optionalAuth, ShopController.product);
  app.get('/auth', (req, res) => {
    // Redirect to home if already authenticated
    if ((req as CustomRequest).user) {
      return res.redirect('/');
    }
    ShopController.auth(req, res);
  });

  // Public API routes
  app.get('/api/products', ShopController.getProductsAPI);
  app.get('/api/product/:id', ShopController.getProductAPI);

  // Protected user routes
  app.get('/profile', requireAuth, (req, res) => {
    res.render('profile', {
      title: 'Mi Perfil - KIVO "justo lo que necesitas"',
      user: (req as CustomRequest).profile,
      isAuthenticated: true,
      page: 'profile'
    });
  });

  // API route to get user profile
  app.get('/api/profile', requireAuth, (req, res) => {
    res.json({
      success: true,
      data: (req as CustomRequest).profile
    });
  });

  // Admin routes (protected)
  app.get('/admin', requireAdmin, AdminController.dashboard);

  // Admin API routes (all require admin permissions)
  app.post('/api/admin/promotion', requireAdmin, AdminController.createPromotion);
  app.put('/api/admin/promotion/:id', requireAdmin, AdminController.updatePromotion);
  app.delete('/api/admin/promotion/:id', requireAdmin, AdminController.deletePromotion);

  app.post('/api/admin/product', requireAdmin, AdminController.createProduct);
  app.put('/api/admin/product/:id', requireAdmin, AdminController.updateProduct);
  app.delete('/api/admin/product/:id', requireAdmin, AdminController.deleteProduct);

  app.get('/api/admin/metrics', requireAdmin, AdminController.getMetrics);

  // 404 handler for undefined routes
  app.use((req, res) => {
    res.status(404).render('error', {
      title: 'Página no encontrada - KIVO "justo lo que necesitas"',
      message: 'La página que buscas no existe',
      user: (req as CustomRequest).profile || null,
      isAuthenticated: !!(req as CustomRequest).user,
      page: '404'
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
