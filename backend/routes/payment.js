import { Router } from 'express';
import { optionalAuth } from '../middlewares/auth.js';
import {
  createMoMoPayment,
  momoIPN,
  momoCallback,
  checkPaymentStatus,
  createVNPayPayment,
  vnpayReturn,
  vnpayIPN,
  checkVNPayStatus,
  vnpayVerifyReturn
} from '../controllers/paymentController.js';

const router = Router();

// MoMo payment routes
router.post('/momo/create', optionalAuth, createMoMoPayment);
router.post('/momo/ipn', momoIPN); // No auth - MoMo server callback
router.get('/momo/callback', momoCallback); // No auth - User redirect from MoMo
router.get('/momo/status/:orderId', optionalAuth, checkPaymentStatus);

// VNPay payment routes
router.post('/vnpay/create', optionalAuth, createVNPayPayment);
router.get('/vnpay/ipn', vnpayIPN); // IMPORTANT: GET method (not POST) - VNPay server callback
router.get('/vnpay/return', vnpayReturn); // No auth - User redirect from VNPay
router.get('/vnpay/status/:orderId', optionalAuth, checkVNPayStatus);
router.post('/vnpay/verify-return', vnpayVerifyReturn); // Manual verification from frontend

export default router;
