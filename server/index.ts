import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupAdminRoutes } from "./admin";
import fs from "fs";
import path from "path";

const app = express();

// Trust proxy headers (required for correct protocol detection behind proxies like Cloudflare/Replit)
app.set('trust proxy', true);

// Block replit.app domain entirely - can be useful to prevent bot traffic
app.use((req, res, next) => {
  const host = req.get('Host') || '';
  if (host.includes('replit.app')) {
    // Check if production domain access is enabled via secret
    const isProdAccessEnabled = process.env.REPLIT_PROD_DOMAIN_ACCESS === 'true';
    if (!isProdAccessEnabled) {
      return res.status(403).send('Domain access blocked');
    }
  }
  next();
});

// Add CORS headers only for API routes to avoid breaking static assets
app.use('/api', (req, res, next) => {
  // Allow requests from your web domain and mobile apps
  const origin = req.get('Origin');
  const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    // Capacitor mobile app origins
    'capacitor://localhost',
    'http://localhost',
    'https://localhost',
    'ionic://localhost'
  ];
  
  // Add custom domain if configured
  if (process.env.CUSTOM_DOMAIN) {
    allowedOrigins.push(`https://${process.env.CUSTOM_DOMAIN}`);
  }
  
  // Always allow Replit domains for development and deployment
  const isReplitDomain = origin && (
    origin.includes('.replit.dev') || 
    origin.includes('.replit.app')
  );
  
  // Check if origin is allowed, mobile app (no origin), or Replit domain
  if (!origin || allowedOrigins.includes(origin) || isReplitDomain) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, User-Agent');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// PWA template replacement middleware
app.get(['/manifest.json', '/sw.js'], (req, res, next) => {
  const filePath = path.join('public', req.path);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Replace tokens with server environment variables
    content = content
      .replace(/\{\{APP_NAME\}\}/g, process.env.APP_NAME || 'Gipity')
      .replace(/\{\{APP_DESCRIPTION\}\}/g, process.env.APP_DESCRIPTION || 'App Description')
      .replace(/\{\{CACHE_NAME\}\}/g, process.env.CACHE_NAME || 'app-cache');
    
    // iOS PWA Camera Fix: Dynamic display mode based on device detection
    if (req.path === '/manifest.json') {
      const userAgent = req.get('User-Agent') || '';
      const isIOS = /iPad|iPhone|iPod/i.test(userAgent);
      
      // iOS PWAs need "browser" mode to enable camera access via getUserMedia()
      // All other platforms use "standalone" for native-like experience
      const displayMode = isIOS ? 'browser' : 'standalone';
      content = content.replace(/\{\{DISPLAY_MODE\}\}/g, displayMode);
      
      // Debug logging for troubleshooting manifest delivery
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Manifest] Serving display mode "${displayMode}" for User-Agent: ${userAgent.substring(0, 50)}...`);
      }
    }
    
    // Cache-busting headers for iOS PWA manifest caching
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Content-Type', req.path.endsWith('.json') ? 'application/json' : 'application/javascript');
    res.send(content);
  } else {
    next();
  }
});

// Serve static files from public directory for all environments
app.use(express.static('public'));

// Increase payload limits for image uploads (50MB limit)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

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

(async () => {
  const server = await registerRoutes(app);
  
  // Setup admin routes with authentication protection
  setupAdminRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
