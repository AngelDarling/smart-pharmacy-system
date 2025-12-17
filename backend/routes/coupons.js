import { Router } from 'express';
import { authRequired, requireRole } from '../middlewares/auth.js';
import { list, create, update, remove, validate, getDirectApply } from '../controllers/couponController.js';

const router = Router();

// View coupons - all staff can view
router.get('/', authRequired, requireRole('admin', 'manager', 'pharmacist', 'staff'), list);

// Create/Update/Delete - admin and manager only
router.post('/', authRequired, requireRole('admin', 'manager'), create);
router.patch('/:id', authRequired, requireRole('admin', 'manager'), update);
router.delete('/:id', authRequired, requireRole('admin', 'manager'), remove);

// public validate
router.post('/validate', validate);
// public get direct apply coupon for product
router.get('/direct-apply/:productSlug', getDirectApply);

export default router;


