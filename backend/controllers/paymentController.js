import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import { createPaymentRequest, verifySignature, checkTransactionStatus } from '../utils/momo.js';
import Product from '../models/Product.js';
import InventoryTransaction from '../models/InventoryTransaction.js';

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

      // Update order status
      if (order.status === 'pending') {
        order.status = 'processing';
        order.paymentStatus = 'paid';
        await order.save();

        // Reduce inventory (same logic as order status update)
        for (const item of order.items) {
          const product = await Product.findById(item.productId);
          if (product) {
            if (product.variants && product.variants.length > 0) {
              const activeVariant = product.variants.find(v => v.isActive);
              if (activeVariant && activeVariant.stockOnHand >= item.quantity) {
                activeVariant.stockOnHand -= item.quantity;
                product.totalStock = product.variants.reduce((total, v) => {
                  return total + (v.isActive ? v.stockOnHand : 0);
                }, 0);
              }
            } else {
              if (product.totalStock >= item.quantity) {
                product.totalStock -= item.quantity;
              }
            }
            await product.save();

            // Create inventory transaction
            await InventoryTransaction.create({
              productId: item.productId,
              type: 'sale',
              quantity: -item.quantity,
              reason: `Order ${order.code} - MoMo payment confirmed`,
              orderId: order._id,
              performedBy: order.userId || null
            });
          }
        }

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

export default {
  createMoMoPayment,
  momoIPN,
  momoCallback,
  checkPaymentStatus
};
