import cron from 'node-cron';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';

/**
 * Auto-cancel unpaid orders after 30 minutes
 * Runs every 5 minutes
 */
export function startOrderCleanupJob() {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('🧹 Running order cleanup job...');

      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

      // Find pending orders with pending payment that are older than 30 minutes
      const expiredOrders = await Order.find({
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: { $in: ['momo', 'vnpay'] },
        createdAt: { $lt: thirtyMinutesAgo }
      });

      if (expiredOrders.length === 0) {
        console.log('✅ No expired orders to clean up');
        return;
      }

      console.log(`Found ${expiredOrders.length} expired orders to cancel`);

      for (const order of expiredOrders) {
        try {
          // Update order status to cancelled
          order.status = 'cancelled';
          order.paymentStatus = 'failed';
          order.cancelledAt = new Date();
          order.cancelReason = 'Auto-cancelled: Payment timeout (30 minutes)';
          await order.save();

          // Update payment status if exists
          await Payment.updateOne(
            { orderId: order._id },
            { 
              status: 'cancelled',
              message: 'Auto-cancelled: Payment timeout'
            }
          );

          console.log(`✅ Cancelled order: ${order.code}`);
        } catch (err) {
          console.error(`Error cancelling order ${order.code}:`, err);
        }
      }

      console.log(`🎉 Cleanup complete: ${expiredOrders.length} orders cancelled`);
    } catch (error) {
      console.error('Error in order cleanup job:', error);
    }
  });

  console.log('✅ Order cleanup cron job started (runs every 5 minutes)');
}

/**
 * Manually run cleanup (for testing)
 */
export async function runOrderCleanupNow() {
  try {
    console.log('🧹 Running manual order cleanup...');

    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const expiredOrders = await Order.find({
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: { $in: ['momo', 'vnpay'] },
      createdAt: { $lt: thirtyMinutesAgo }
    });

    if (expiredOrders.length === 0) {
      return { success: true, message: 'No expired orders to clean up', count: 0 };
    }

    let cancelledCount = 0;

    for (const order of expiredOrders) {
      try {
        order.status = 'cancelled';
        order.paymentStatus = 'failed';
        order.cancelledAt = new Date();
        order.cancelReason = 'Auto-cancelled: Payment timeout (30 minutes)';
        await order.save();

        await Payment.updateOne(
          { orderId: order._id },
          { 
            status: 'cancelled',
            message: 'Auto-cancelled: Payment timeout'
          }
        );

        cancelledCount++;
      } catch (err) {
        console.error(`Error cancelling order ${order.code}:`, err);
      }
    }

    return { 
      success: true, 
      message: `Cancelled ${cancelledCount} expired orders`, 
      count: cancelledCount 
    };
  } catch (error) {
    console.error('Error in manual cleanup:', error);
    return { success: false, message: error.message };
  }
}
