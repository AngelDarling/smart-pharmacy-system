import { Router } from 'express';
import { optionalAuth } from '../middlewares/auth.js';
import {
  createMoMoPayment,
  momoIPN,
  momoCallback,
  checkPaymentStatus
} from '../controllers/paymentController.js';

const router = Router();

// MoMo payment routes
router.post('/momo/create', optionalAuth, createMoMoPayment);
router.post('/momo/ipn', momoIPN); // No auth - MoMo server callback
router.get('/momo/callback', momoCallback); // No auth - User redirect from MoMo
router.get('/momo/status/:orderId', optionalAuth, checkPaymentStatus);

export default router;
