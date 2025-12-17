import express from 'express';
import healthNewsController from '../controllers/healthNewsController.js';
import { authRequired, requirePermission, optionalAuth } from '../middlewares/auth.js';
import upload from '../middleware/uploadHealthNewsMiddleware.js';

const router = express.Router();

// Admin routes - specific paths first
router.get('/analytics', 
  authRequired, 
  requirePermission('manage_content'),
  healthNewsController.getAnalytics
);

router.post('/upload-image', 
  authRequired, 
  requirePermission('manage_content'),
  upload.single('image'),
  healthNewsController.uploadImage
);

router.post('/', 
  authRequired, 
  requirePermission('manage_content'),
  healthNewsController.create
);

router.put('/:id/publish', 
  authRequired, 
  requirePermission('manage_content'),
  healthNewsController.publish
);

router.put('/:id', 
  authRequired, 
  requirePermission('manage_content'),
  healthNewsController.update
);

router.delete('/:id', 
  authRequired, 
  requirePermission('manage_content'),
  healthNewsController.delete
);

// Public routes - specific paths first
router.get('/', optionalAuth, healthNewsController.getAll);
router.get('/featured', healthNewsController.getFeatured);
router.get('/trending', healthNewsController.getTrending);
router.post('/:id/view', healthNewsController.incrementView);
router.post('/:id/like', healthNewsController.incrementLike);

// Admin route to get by ID - must be authenticated
router.get('/admin/:id', 
  authRequired, 
  requirePermission('manage_content'),
  healthNewsController.getById
);

// Dynamic route - always use getBySlug for public access
// (Admin should use /admin/:id route above)
router.get('/:slug', healthNewsController.getBySlug);

export default router;
