import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import InventoryTransaction from '../models/InventoryTransaction.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

/**
 * Manual script to update payment status when IPN is not received
 * Use this when testing locally without ngrok
 */

async function manualUpdatePayment() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get order ID from command line argument
    const orderId = process.argv[2];
    const transId = process.argv[3] || 'MANUAL_UPDATE';

    if (!orderId) {
      console.error('Usage: node manual-update-payment.js <orderId> [transId]');
      console.error('Example: node manual-update-payment.js 691f5dc7de9bebaff482c3bc 4612941789');
      process.exit(1);
    }

    console.log(`\nProcessing payment for order: ${orderId}`);
    console.log(`Transaction ID: ${transId}\n`);

    // Find payment
    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      console.error('❌ Payment not found');
      process.exit(1);
    }

    console.log('Payment found:', {
      status: payment.status,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod
    });

    // Find order
    const order = await Order.findById(orderId);
    if (!order) {
      console.error('❌ Order not found');
      process.exit(1);
    }

    console.log('Order found:', {
      code: order.code,
      status: order.status,
      paymentStatus: order.paymentStatus
    });

    // Update payment to success
    payment.status = 'success';
    payment.transId = transId;
    payment.resultCode = 0;
    payment.message = 'Successful (Manual Update)';
    payment.ipnReceived = true;
    payment.ipnReceivedAt = new Date();
    await payment.save();

    console.log('\n✅ Payment updated to success');

    // Update order status
    if (order.status === 'pending') {
      order.status = 'processing';
      order.paymentStatus = 'paid';
      await order.save();

      console.log('✅ Order status updated to processing');

      // Reduce inventory
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
            reason: `Order ${order.code} - MoMo payment (Manual Update)`,
            orderId: order._id,
            performedBy: order.userId || null
          });

          console.log(`✅ Reduced inventory for product: ${item.nameSnapshot} (${item.quantity} units)`);
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
              description: `Tích điểm từ đơn hàng ${order.code} (MoMo - Manual)`,
              createdAt: new Date()
            });
            console.log(`✅ Added ${points} loyalty points`);
          }
        } catch (pointErr) {
          console.error('Error adding loyalty points:', pointErr);
        }
      }
    } else {
      console.log('⚠️  Order already processed');
    }

    console.log('\n🎉 Payment processing complete!');
    console.log('\nUpdated status:');
    console.log('- Payment status:', payment.status);
    console.log('- Order status:', order.status);
    console.log('- Payment status:', order.paymentStatus);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

manualUpdatePayment();
