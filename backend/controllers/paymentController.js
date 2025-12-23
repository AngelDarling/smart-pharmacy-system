import { Payment, Order, Product, InventoryTransaction } from '../models/index.js';
import { createPaymentRequest, verifySignature, checkTransactionStatus } from '../utils/momo.js';
import vnpay from '../utils/vnpay.js';
import { reduceStockFIFO } from './productBatchController.js';

/**
 * Create MoMo payment
 * POST /api/payment/momo/create
 */
export async function createMoMoPayment(req, res) {
  try {
    const { orderId, amount, orderInfo } = req.body;

    // Validate input
    if (!orderId || !amount) {
      return res.status(400).json({ message: 'Missing required fields: orderId, amount' });
    }

    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if payment already exists and is successful
    const existingPayment = await Payment.findSuccessfulPayment(orderId);
    if (existingPayment) {
      return res.status(400).json({ message: 'Order already paid' });
    }

    // Create payment record
    const payment = await Payment.create({
      orderId,
      paymentMethod: 'momo',
      amount,
      status: 'pending',
      requestId: `${orderId}_${Date.now()}`
    });

    // Create MoMo payment request
    const momoResponse = await createPaymentRequest({
      orderId: order._id.toString(),
      amount,
      orderInfo: orderInfo || `Thanh toán đơn hàng ${order.code}`
    });

    // Check if MoMo request was successful
    if (momoResponse.resultCode !== 0) {
      payment.status = 'failed';
      payment.errorCode = momoResponse.resultCode?.toString();
      payment.errorMessage = momoResponse.message;
      await payment.save();

      return res.status(400).json({
        message: 'Failed to create MoMo payment',
        error: momoResponse.message
      });
    }

    // Update payment with MoMo response
    payment.requestId = momoResponse.requestId;
    payment.status = 'processing';
    payment.metadata = {
      payUrl: momoResponse.payUrl,
      qrCodeUrl: momoResponse.qrCodeUrl,
      deeplink: momoResponse.deeplink
    };
    await payment.save();

    res.json({
      success: true,
      payUrl: momoResponse.payUrl,
      qrCodeUrl: momoResponse.qrCodeUrl,
      deeplink: momoResponse.deeplink,
      requestId: momoResponse.requestId
    });
  } catch (error) {
    console.error('Create MoMo Payment Error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
}

/**
 * Handle MoMo IPN (Instant Payment Notification)
 * POST /api/payment/momo/ipn
 */
export async function momoIPN(req, res) {
  try {
    console.log('=== MoMo IPN Received ===');
    console.log('Body:', JSON.stringify(req.body, null, 2));

    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature
    } = req.body;

    // Verify signature
    const isValidSignature = verifySignature(req.body);
    if (!isValidSignature) {
      console.error('Invalid signature from MoMo IPN');
      return res.status(400).json({ message: 'Invalid signature' });
    }

    // Find payment record
    const payment = await Payment.findOne({ requestId });
    if (!payment) {
      console.error('Payment not found for requestId:', requestId);
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if already processed (idempotency)
    if (payment.ipnReceived && payment.status !== 'processing') {
      console.log('IPN already processed for requestId:', requestId);
      return res.json({ message: 'IPN already processed' });
    }

    // Find order
    const order = await Order.findById(payment.orderId);
    if (!order) {
      console.error('Order not found:', payment.orderId);
      return res.status(404).json({ message: 'Order not found' });
    }

    // Process based on result code
    if (resultCode === 0) {
      // Payment successful
      console.log('✅ Payment successful for order:', order.code);

      await payment.markAsSuccess(req.body);

      // Update order status (Prepare before saving)
      if (order.status === 'pending') {
        // 1. Reduce inventory first!
        try {
          await reduceStockFIFO(order);
        } catch (invError) {
          console.error('Inventory reduction failed during MoMo IPN:', invError);
          // Optional: handle failure (e.g., mark payment as failed even if money received?)
          // For now, log it and proceed as we already have the money
        }

        // 2. Change status after successful inventory reduction (or at least attempt)
        order.status = 'processing';
        order.paymentStatus = 'paid';
        await order.save();

        // Add loyalty points if user exists
        if (order.userId) {
          try {
            const Customer = (await import('../models/Customer.js')).default;
            const { PointHistory } = await import('../models/Customer.js');
            
            const points = Math.floor(order.totals.items / 1000);
            if (points > 0) {
              await Customer.findByIdAndUpdate(order.userId, { $inc: { loyaltyPoints: points } });
              await PointHistory.create({
                userId: order.userId,
                orderId: order._id,
                orderCode: order.code,
                points,
                description: `Tích điểm từ đơn hàng ${order.code} (MoMo)`,
                createdAt: new Date()
              });
            }
          } catch (pointErr) {
            console.error('Error adding loyalty points:', pointErr);
          }
        }
      }
    } else {
      // Payment failed
      console.log('❌ Payment failed for order:', order.code, 'Result code:', resultCode);

      await payment.markAsFailed(req.body);

      // Update order status to cancelled
      if (order.status === 'pending') {
        order.status = 'cancelled';
        order.paymentStatus = 'failed';
        await order.save();
      }
    }

    // Respond to MoMo
    res.json({
      message: 'IPN processed successfully',
      resultCode: 0
    });
  } catch (error) {
    console.error('MoMo IPN Error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
}

/**
 * Handle MoMo callback (user redirect)
 * GET /api/payment/momo/callback
 */
export async function momoCallback(req, res) {
  try {
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature
    } = req.query;

    console.log('=== MoMo Callback Received ===');
    console.log('Query params:', req.query);

    // Verify signature
    const isValidSignature = verifySignature(req.query);
    if (!isValidSignature) {
      console.error('Invalid signature from MoMo callback');
      return res.redirect(`${process.env.MOMO_REDIRECT_URL}?status=error&message=Invalid signature`);
    }

    // Find payment
    const payment = await Payment.findOne({ requestId });
    if (!payment) {
      return res.redirect(`${process.env.MOMO_REDIRECT_URL}?status=error&message=Payment not found`);
    }

    // Redirect based on result
    if (resultCode === '0' || resultCode === 0) {
      // Success
      return res.redirect(`${process.env.MOMO_REDIRECT_URL}?orderId=${orderId}&status=success&transId=${transId}`);
    } else {
      // Failed
      return res.redirect(`${process.env.MOMO_REDIRECT_URL}?orderId=${orderId}&status=failed&message=${encodeURIComponent(message)}`);
    }
  } catch (error) {
    console.error('MoMo Callback Error:', error);
    return res.redirect(`${process.env.MOMO_REDIRECT_URL}?status=error&message=Internal server error`);
  }
}

/**
 * Check payment status
 * GET /api/payment/momo/status/:orderId
 */
export async function checkPaymentStatus(req, res) {
  try {
    const { orderId } = req.params;

    const payment = await Payment.findByOrder(orderId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // If payment is still processing, check with MoMo
    if (payment.status === 'processing' && payment.requestId) {
      try {
        const momoStatus = await checkTransactionStatus(orderId, payment.requestId);
        
        if (momoStatus.resultCode === 0) {
          payment.status = 'success';
          payment.transId = momoStatus.transId;
          await payment.save();

          // Update order status if needed
          const order = await Order.findById(orderId);
          if (order && order.status === 'pending') {
            // 1. Reduce inventory
            try {
              await reduceStockFIFO(order);
            } catch (invError) {
              console.error('Inventory reduction failed during MoMo status check:', invError);
            }

            // 2. Update status
            order.status = 'processing';
            order.paymentStatus = 'paid';
            await order.save();
          }
        } else {
          // Payment failed or cancelled
          payment.status = 'failed';
          payment.errorCode = momoStatus.resultCode?.toString();
          payment.errorMessage = momoStatus.message;
          await payment.save();

          // Update order status to cancelled
          const order = await Order.findById(orderId);
          if (order && order.status === 'pending') {
            order.status = 'cancelled';
            order.paymentStatus = 'failed';
            await order.save();
          }
        }
      } catch (error) {
        console.error('Error checking MoMo status:', error);
      }
    }

    res.json({
      status: payment.status,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      transId: payment.transId,
      message: payment.message,
      createdAt: payment.createdAt
    });
  } catch (error) {
    console.error('Check Payment Status Error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
}

/**
 * Create VNPay payment
 * POST /api/payment/vnpay/create
 */
export async function createVNPayPayment(req, res) {
  try {
    const { orderId, amount, orderInfo } = req.body;

    // Validate input
    if (!orderId || !amount) {
      return res.status(400).json({ message: 'Missing required fields: orderId, amount' });
    }

    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if payment already exists and is successful
    const existingPayment = await Payment.findSuccessfulPayment(orderId);
    if (existingPayment) {
      return res.status(400).json({ message: 'Order already paid' });
    }

    // Get client IP address
    const ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

    // Generate unique transaction reference (orderId_timestamp)
    const vnp_TxnRef = `${orderId}_${Date.now()}`;

    // Create payment record
    const payment = await Payment.create({
      orderId,
      paymentMethod: 'vnpay',
      amount,
      status: 'pending',
      requestId: vnp_TxnRef // Store vnp_TxnRef for later reference
    });

    // Prepare payment parameters
    const paymentParams = {
      vnp_Amount: amount,
      vnp_IpAddr: ipAddr,
      vnp_TxnRef: vnp_TxnRef,
      vnp_OrderInfo: orderInfo || `Thanh toan don hang ${order.code}`,
      vnp_OrderType: 'other',
      vnp_ReturnUrl: process.env.VNPAY_RETURN_URL || 'http://localhost:5173/order-success',
      vnp_Locale: 'vn',
    };

    console.log('📝 Building VNPay payment URL with params:', {
      ...paymentParams,
      vnp_Amount: `${paymentParams.vnp_Amount} VND`
    });

    // Build VNPay payment URL
    const paymentUrl = vnpay.buildPaymentUrl(paymentParams);

    // Update payment status to processing
    payment.status = 'processing';
    payment.metadata = {
      payUrl: paymentUrl,
      vnp_TxnRef: vnp_TxnRef
    };
    await payment.save();

    console.log('✅ VNPay payment URL created:', {
      orderId: order.code,
      vnp_TxnRef,
      amount,
      payUrlLength: paymentUrl.length
    });

    res.json({
      success: true,
      payUrl: paymentUrl,
      vnp_TxnRef: vnp_TxnRef
    });
  } catch (error) {
    console.error('Create VNPay Payment Error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
}

/**
 * Handle VNPay return URL (user redirect)
 * GET /api/payment/vnpay/return
 */
export async function vnpayReturn(req, res) {
  try {
    console.log('=== VNPay Return Received ===');
    console.log('Query params:', req.query);

    let verify;
    try {
      // Verify return URL signature
      verify = vnpay.verifyReturnUrl(req.query);
    } catch (e) {
      console.error('VNPay signature verification error:', e);
      return res.redirect(`${process.env.VNPAY_RETURN_URL}?status=error&message=Invalid signature`);
    }

    if (verify.isVerified) {
      // Extract orderId from vnp_TxnRef (format: orderId_timestamp)
      const vnp_TxnRef = verify.vnp_TxnRef || '';
      const orderId = vnp_TxnRef.split('_')[0]; // Get orderId part

      // Check response code (00 = success)
      if (verify.vnp_ResponseCode === '00') {
        console.log('✅ VNPay payment successful (user redirect)');
        return res.redirect(`${process.env.VNPAY_RETURN_URL}?orderId=${orderId}&status=success&vnp_TransactionNo=${verify.vnp_TransactionNo || ''}&vnp_ResponseCode=${verify.vnp_ResponseCode}`);
      } else {
        console.log('❌ VNPay payment failed (user redirect):', verify.vnp_ResponseCode);
        return res.redirect(`${process.env.VNPAY_RETURN_URL}?orderId=${orderId}&status=failed&message=${encodeURIComponent(verify.vnp_Message || 'Payment failed')}&vnp_ResponseCode=${verify.vnp_ResponseCode}`);
      }
    }

    // Signature verification failed
    return res.redirect(`${process.env.VNPAY_RETURN_URL}?status=error&message=Signature verification failed`);
  } catch (error) {
    console.error('VNPay Return Error:', error);
    return res.redirect(`${process.env.VNPAY_RETURN_URL}?status=error&message=Internal server error`);
  }
}

/**
 * Handle VNPay IPN (Instant Payment Notification)
 * GET /api/payment/vnpay/ipn
 * IMPORTANT: VNPay sends IPN via GET method, not POST
 */
export async function vnpayIPN(req, res) {
  try {
    console.log('=== VNPay IPN Received ===');
    console.log('Query params:', JSON.stringify(req.query, null, 2));

    let verify;
    try {
      // Verify IPN signature
      verify = vnpay.verifyIpnCall(req.query);
    } catch (e) {
      console.error('VNPay IPN signature verification error:', e);
      return res.json({ RspCode: '97', Message: 'Checksum failed' });
    }

    if (!verify.isVerified) {
      console.error('Invalid signature from VNPay IPN');
      return res.json({ RspCode: '97', Message: 'Checksum failed' });
    }

    // Extract transaction reference
    const vnp_TxnRef = verify.vnp_TxnRef;
    const vnp_Amount = verify.vnp_Amount;
    const vnp_ResponseCode = verify.vnp_ResponseCode;

    // Find payment record by requestId (which stores vnp_TxnRef)
    const payment = await Payment.findOne({ requestId: vnp_TxnRef });
    if (!payment) {
      console.error('Payment not found for vnp_TxnRef:', vnp_TxnRef);
      return res.json({ RspCode: '01', Message: 'Order not found' });
    }

    // Check if already processed (idempotency)
    if (payment.ipnReceived && payment.status !== 'processing') {
      console.log('IPN already processed for vnp_TxnRef:', vnp_TxnRef);
      return res.json({ RspCode: '00', Message: 'Success' });
    }

    // Find order
    const order = await Order.findById(payment.orderId);
    if (!order) {
      console.error('Order not found:', payment.orderId);
      return res.json({ RspCode: '01', Message: 'Order not found' });
    }

    // Verify amount matches
    if (payment.amount !== vnp_Amount) {
      console.error('Amount mismatch:', { expected: payment.amount, received: vnp_Amount });
      return res.json({ RspCode: '04', Message: 'Invalid amount' });
    }

    // Process based on response code
    if (vnp_ResponseCode === '00') {
      // Payment successful
      console.log('✅ VNPay payment successful for order:', order.code);

      // Update payment record
      payment.status = 'success';
      payment.transId = verify.vnp_TransactionNo;
      payment.resultCode = 0;
      payment.message = 'Payment successful';
      payment.responseTime = new Date();
      payment.ipnReceived = true;
      payment.ipnReceivedAt = new Date();
      await payment.save();

      // Update order status
      if (order.status === 'pending') {
        // 1. Reduce inventory first!
        try {
          await reduceStockFIFO(order);
        } catch (invError) {
          console.error('Inventory reduction failed during VNPay IPN:', invError);
        }

        // 2. Update status
        order.status = 'processing';
        order.paymentStatus = 'paid';
        await order.save();

        // Add loyalty points if user exists
        if (order.userId) {
          try {
            const Customer = (await import('../models/Customer.js')).default;
            const { PointHistory } = await import('../models/Customer.js');
            
            const points = Math.floor(order.totals.items / 1000);
            if (points > 0) {
              await Customer.findByIdAndUpdate(order.userId, { $inc: { loyaltyPoints: points } });
              await PointHistory.create({
                userId: order.userId,
                orderId: order._id,
                orderCode: order.code,
                points,
                description: `Tích điểm từ đơn hàng ${order.code} (VNPay)`,
                createdAt: new Date()
              });
            }
          } catch (pointErr) {
            console.error('Error adding loyalty points:', pointErr);
          }
        }
      }

      return res.json({ RspCode: '00', Message: 'Success' });
    } else {
      // Payment failed
      console.log('❌ VNPay payment failed for order:', order.code, 'Response code:', vnp_ResponseCode);

      // Update payment record
      payment.status = 'failed';
      payment.resultCode = parseInt(vnp_ResponseCode) || -1;
      payment.message = verify.vnp_Message || 'Payment failed';
      payment.errorCode = vnp_ResponseCode;
      payment.errorMessage = verify.vnp_Message;
      payment.responseTime = new Date();
      payment.ipnReceived = true;
      payment.ipnReceivedAt = new Date();
      await payment.save();

      // Update order status to cancelled
      if (order.status === 'pending') {
        order.status = 'cancelled';
        order.paymentStatus = 'failed';
        await order.save();
      }

      return res.json({ RspCode: '00', Message: 'Success' });
    }
  } catch (error) {
    console.error('VNPay IPN Error:', error);
    return res.json({ RspCode: '99', Message: 'Unknown error' });
  }
}

/**
 * Check VNPay payment status
 * GET /api/payment/vnpay/status/:orderId
 */
export async function checkVNPayStatus(req, res) {
  try {
    const { orderId } = req.params;

    const payment = await Payment.findByOrder(orderId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({
      status: payment.status,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      transId: payment.transId,
      message: payment.message,
      createdAt: payment.createdAt
    });
  } catch (error) {
    console.error('Check VNPay Payment Status Error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
}

/**
 * Verify VNPay return and update order status
 * POST /api/payment/vnpay/verify-return
 * This is needed because IPN cannot reach localhost in development
 */
export async function vnpayVerifyReturn(req, res) {
  try {
    const { orderId, vnp_ResponseCode, vnp_TransactionNo, vnp_TxnRef } = req.body;

    console.log('=== VNPay Verify Return ===');
    console.log('Request:', { orderId, vnp_ResponseCode, vnp_TransactionNo });

    if (!orderId || !vnp_ResponseCode) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find payment by orderId
    const payment = await Payment.findByOrder(orderId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if already processed
    if (payment.status === 'success') {
      console.log('Payment already processed');
      return res.json({ message: 'Payment already processed', status: 'success' });
    }

    // Find order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only process if response code is success
    if (vnp_ResponseCode === '00') {
      console.log('✅ Processing successful VNPay payment for order:', order.code);

      // Update payment record
      payment.status = 'success';
      payment.transId = vnp_TransactionNo;
      payment.resultCode = 0;
      payment.message = 'Payment successful';
      payment.responseTime = new Date();
      await payment.save();

      // Update order status
      if (order.status === 'pending') {
        // 1. Reduce inventory first!
        try {
          await reduceStockFIFO(order);
        } catch (invError) {
          console.error('Inventory reduction failed during VNPay verify return:', invError);
        }

        // 2. Update status
        order.status = 'processing';
        order.paymentStatus = 'paid';
        await order.save();

        // Add loyalty points
        if (order.userId) {
          try {
            const Customer = (await import('../models/Customer.js')).default;
            const { PointHistory } = await import('../models/Customer.js');
            
            const points = Math.floor(order.totals.items / 1000);
            if (points > 0) {
              await Customer.findByIdAndUpdate(order.userId, { $inc: { loyaltyPoints: points } });
              await PointHistory.create({
                userId: order.userId,
                orderId: order._id,
                orderCode: order.code,
                points,
                description: `Tích điểm từ đơn hàng ${order.code} (VNPay)`,
                createdAt: new Date()
              });
            }
          } catch (pointErr) {
            console.error('Error adding loyalty points:', pointErr);
          }
        }
      }

      return res.json({ 
        message: 'Payment verified and order updated successfully',
        status: 'success',
        orderStatus: order.status,
        paymentStatus: order.paymentStatus
      });
    } else {
      // Payment failed
      payment.status = 'failed';
      payment.errorCode = vnp_ResponseCode;
      payment.errorMessage = 'Payment failed';
      await payment.save();

      if (order.status === 'pending') {
        order.status = 'cancelled';
        order.paymentStatus = 'failed';
        await order.save();
      }

      return res.json({ 
        message: 'Payment verification failed',
        status: 'failed'
      });
    }
  } catch (error) {
    console.error('VNPay Verify Return Error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
}

export default {
  createMoMoPayment,
  momoIPN,
  momoCallback,
  checkPaymentStatus,
  createVNPayPayment,
  vnpayReturn,
  vnpayIPN,
  checkVNPayStatus,
  vnpayVerifyReturn
};
