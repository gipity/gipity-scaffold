import express from 'express';
import path from 'path';

export function setupAdminRoutes(app: express.Express) {
  // Admin static assets (if any) - leave accessible for now
  app.use('/server/admin/assets', express.static(path.join(process.cwd(), 'admin-assets')));
}
