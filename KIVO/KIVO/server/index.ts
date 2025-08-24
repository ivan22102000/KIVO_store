import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Trust proxy for proper HTTPS detection in production
app.set('trust proxy', 1);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // CSP for Supabase and external resources
  res.setHeader('Content-Security-Policy', `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://replit.com;
    style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com;
    img-src 'self' data: https: blob:;
    connect-src 'self' https://*.supabase.co wss://*.supabase.co;
    frame-src 'none';
  `.replace(/\s+/g, ' ').trim());
  
  next();
});

// Environment validation
function validateEnvironment() {
  const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    log(`❌ Missing required environment variables: ${missing.join(', ')}`);
    log('Please check your .env file and ensure all required variables are set.');
    process.exit(1);
  }
  
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    log('⚠️  Warning: SUPABASE_SERVICE_ROLE_KEY not set. Admin functionality will be limited.');
  }
  
  log('✅ Environment variables validated');
}

(async () => {
  // Validate environment first
  validateEnvironment();
  
  // Register all routes
  const server = await registerRoutes(app);

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    log(`❌ Error ${status}: ${message}`);
    
    if (status >= 500) {
      console.error('Stack trace:', err.stack);
    }

    // Send appropriate response based on content type
    if (_req.path.startsWith('/api') || _req.headers.accept?.includes('application/json')) {
      res.status(status).json({ 
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      });
    } else {
      res.status(status).render('error', {
        title: `Error ${status} - KIVO "justo lo que necesitas"`,
        message: status === 404 ? 'Página no encontrada' : 'Error del servidor',
        user: null,
        isAuthenticated: false,
        page: 'error'
      });
    }
  });

  // Setup Vite in development or serve static files in production
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Start server
  const port = parseInt(process.env.PORT || '5000', 10);
  
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`🚀 KIVO "justo lo que necesitas" running on port ${port}`);
    log(`📱 Environment: ${app.get("env")}`);
    log(`🔗 Visit: http://localhost:${port}`);
    
    if (app.get("env") === "development") {
      log(`🛠️  Admin demo: admin@kivo.com / password123`);
      log(`👤 User demo: user@kivo.com / password123`);
    }
  });
})().catch((error) => {
  log(`❌ Failed to start server: ${error.message}`);
  console.error(error);
  process.exit(1);
});
