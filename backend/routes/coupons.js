import { Router } from 'express';
import { authRequired, requireRole } from '../middlewares/auth.js';
import { list, create, update, remove, validate, getDirectApply } from '../controllers/couponController.js';

const router = Router();

router.get('/', authRequired, requireRole('admin'), list);
router.post('/', authRequired, requireRole('admin'), create);
router.patch('/:id', authRequired, requireRole('admin'), update);
router.delete('/:id', authRequired, requireRole('admin'), remove);

// public validate
router.post('/validate', validate);
// public get direct apply coupon for product
router.get('/direct-apply/:productSlug', getDirectApply);

export default router;


