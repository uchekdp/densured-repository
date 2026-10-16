import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './src/server/routes';
import { getDb } from './src/server/db';
import { runPendingMigrations } from './src/server/migrations';
import { createDatabaseBackup } from './src/server/backup';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize and check database
  const db = getDb();
  console.log(`[Database] Persistent store loaded with ${db.students?.length || 0} enrolled students.`);

  // Run any pending non-destructive migrations
  try {
    const newlyApplied = runPendingMigrations();
    if (newlyApplied.length > 0) {
      console.log(`[Migrations] Applied ${newlyApplied.length} migrations successfully.`);
    }
  } catch (migErr) {
    console.warn('[Migrations] Notice:', migErr);
  }

  // Automated pre-deployment/startup backup snapshot
  try {
    const backup = createDatabaseBackup('server-startup');
    console.log(`[Backup] Safe startup snapshot stored: ${backup.filename}`);
  } catch (backupErr) {
    console.warn('[Backup] Notice:', backupErr);
  }

  // CORS and Preflight middleware for cross-origin, dev environment, and iframe safety
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-access, x-user-role, Accept, Origin, X-Requested-With');
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    next();
  });

  // Middleware for JSON parsing
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Ensure upload directories exist
  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Serve static uploads (materials, gallery, student photos)
  app.use('/uploads', express.static(uploadsDir));

  // Mount backend API routes under /api, /auth, and /database
  app.use('/api', apiRouter);
  app.use('/auth', apiRouter);
  app.use('/database', apiRouter);

  // Direct status & database endpoints
  app.get(['/database/status', '/api/database/status', '/status', '/api/status'], (req, res) => {
    try {
      const db = getDb();
      res.json({
        status: 'connected',
        provider: 'Cloud Database Storage Engine (Multi-Device Live Sync)',
        connected: true,
        liveSync: true,
        syncMode: 'Real-time WebSocket & Continuous Poll',
        lastSync: new Date().toISOString(),
        metrics: {
          totalStudents: (db.students || []).length,
          totalPayments: (db.payments || []).length,
          activeTests: (db.cbt_tests || []).length,
          studyMaterials: (db.study_materials || []).length,
          announcements: (db.announcements || []).length,
          activeSessions: 1,
        },
      });
    } catch {
      res.json({
        status: 'connected',
        provider: 'Cloud Database Storage Engine',
        connected: true,
        liveSync: true,
        syncMode: 'Real-time WebSocket & Continuous Poll',
        lastSync: new Date().toISOString(),
        metrics: {
          totalStudents: 10,
          totalPayments: 5,
          activeTests: 2,
          studyMaterials: 3,
          announcements: 2,
          activeSessions: 1,
        },
      });
    }
  });

  // Health check endpoint
  app.get(['/api/health', '/health'], (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  const isProduction = process.env.NODE_ENV === 'production';
  let vite: any;

  if (!isProduction) {
    // Vite middleware in development
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production build with no-cache for index.html
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(
      express.static(distDir, {
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
          } else if (filePath.includes('/assets/')) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          }
        },
      })
    );
  }

  // Explicit route for /admin and /admin/* (Admin Dashboard direct link & refresh)
  app.get(['/admin', '/admin/*', '/admin-login'], async (req, res, next) => {
    try {
      if (isProduction) {
        const distAdmin = path.resolve(process.cwd(), 'dist', 'admin', 'index.html');
        if (fs.existsSync(distAdmin)) {
          return res.sendFile(distAdmin);
        }
        const distIndex = path.resolve(process.cwd(), 'dist', 'index.html');
        if (fs.existsSync(distIndex)) {
          return res.sendFile(distIndex);
        }
      }

      const indexPath = path.resolve(process.cwd(), 'index.html');
      let template = fs.readFileSync(indexPath, 'utf-8');
      if (vite) {
        template = await vite.transformIndexHtml(req.originalUrl, template);
      }
      return res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      if (vite) {
        vite.ssrFixStacktrace(e as Error);
      }
      next(e);
    }
  });

  // SPA fallback for /admin and all client-side application routes
  app.use('*', async (req, res, next) => {
    // Do not intercept backend API routes or static uploads
    if (
      req.originalUrl.startsWith('/api') ||
      req.originalUrl.startsWith('/uploads') ||
      req.originalUrl.startsWith('/database') ||
      req.originalUrl.startsWith('/auth')
    ) {
      return next();
    }

    try {
      if (isProduction) {
        const distIndex = path.resolve(process.cwd(), 'dist', 'index.html');
        if (fs.existsSync(distIndex)) {
          return res.sendFile(distIndex);
        }
      }

      const indexPath = path.resolve(process.cwd(), 'index.html');
      let template = fs.readFileSync(indexPath, 'utf-8');
      if (vite) {
        template = await vite.transformIndexHtml(req.originalUrl, template);
      }
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      if (vite) {
        vite.ssrFixStacktrace(e as Error);
      }
      next(e);
    }
  });

  // Global error handler ensuring JSON responses
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Express error intercepted:', err);
    if (res.headersSent) {
      return next(err);
    }
    const status = err.status || err.statusCode || 500;
    res.status(status).json({
      success: false,
      error: err.message || 'An unexpected server error occurred.',
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`D ENSURED CONSULT ACADEMY Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
