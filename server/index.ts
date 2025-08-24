import express, { type Express } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { storage } from "./storage.js";
import { setupRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Trust proxy for proper IP detection
app.set('trust proxy', 1);

// CORS headers for API requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Setup API routes
setupRoutes(app, storage);

// Static file serving and Vite setup
if (process.env.NODE_ENV === "production") {
  serveStatic(app);
} else {
  const { createServer } = await import("http");
  const server = createServer(app);
  await setupVite(app, server);
  
  server.listen(PORT, "0.0.0.0", () => {
    log(`Server running on port ${PORT}`, "server");
    log(`Environment: ${process.env.NODE_ENV || 'development'}`, "server");
    log(`Database URL configured: ${!!process.env.DATABASE_URL}`, "server");
  });
}

// Production server start
if (process.env.NODE_ENV === "production") {
  app.listen(PORT, "0.0.0.0", () => {
    log(`Production server running on port ${PORT}`, "server");
    log(`Database URL configured: ${!!process.env.DATABASE_URL}`, "server");
  });
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

export default app;
