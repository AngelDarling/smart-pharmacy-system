import express from 'express';
import healthNewsCategoryController from '../controllers/healthNewsCategoryController.js';
import { authRequired, requirePermission } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', healthNewsCategoryController.getAll);
router.get('/:id', healthNewsCategoryController.getById);

// Admin routes
router.post('/', 
  authRequired, 
  requirePermission('manage_content'),
  healthNewsCategoryController.create
);

router.put('/:id', 
  authRequired, 
  requirePermission('manage_content'),
  healthNewsCategoryController.update
);

router.delete('/:id', 
  authRequired, 
  requirePermission('manage_content'),
  healthNewsCategoryController.delete
);

export default router;
