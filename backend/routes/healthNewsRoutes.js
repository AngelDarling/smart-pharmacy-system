import express from 'express';
import healthNewsController from '../controllers/healthNewsController.js';
import { authRequired, requirePermission, optionalAuth } from '../middlewares/auth.js';
import upload from '../middleware/uploadHealthNewsMiddleware.js';

const router = express.Router();

// Admin routes
router.get('/analytics', 
  authRequired, 
  requirePermission('manage_content'),
  healthNewsController.getAnalytics
);

router.post('/', 
  authRequired, 
  requirePermission('manage_content'),
  healthNewsController.create
);

router.put('/:id', 
  authRequired, 
  requirePermission('manage_content'),
  healthNewsController.update
);

router.put('/:id/publish', 
  authRequired, 
  requirePermission('manage_content'),
  healthNewsController.publish
);

router.delete('/:id', 
  authRequired, 
  requirePermission('manage_content'),
  healthNewsController.delete
);

// Image upload endpoint
router.post('/upload-image', 
  authRequired, 
  requirePermission('manage_content'),
  upload.single('image'),
  healthNewsController.uploadImage
);

// Public routes
router.get('/', optionalAuth, healthNewsController.getAll);
router.get('/featured', healthNewsController.getFeatured);
router.get('/trending', healthNewsController.getTrending);
router.get('/:slug', healthNewsController.getBySlug);
router.post('/:id/view', healthNewsController.incrementView);
router.post('/:id/like', healthNewsController.incrementLike);

export default router;
