import cron from 'node-cron';
import ProductBatch from '../models/ProductBatch.js';
import Product from '../models/Product.js';

/**
 * Auto-expire product batches and disable products when all batches are expired
 * Runs daily at midnight (00:00)
 */
export function startExpiryCheckerJob() {
  // Run daily at 00:00 (midnight)
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('🕐 Running expiry checker job...');

      const now = new Date();

      // 1. Find all batches that are expired but not marked as such
      const expiredBatches = await ProductBatch.find({
        expiryDate: { $lt: now },
        status: { $ne: 'expired' },
        remainingQuantity: { $gt: 0 } // Only batches with stock
      });

      if (expiredBatches.length === 0) {
        console.log('✅ No expired batches to update');
      } else {
        console.log(`Found ${expiredBatches.length} expired batches to mark`);

        // Update all expired batches
        for (const batch of expiredBatches) {
          batch.status = 'expired';
          await batch.save();
          console.log(`✅ Marked batch ${batch.batchNumber} as expired (Product: ${batch.productId})`);
        }

        console.log(`🎉 Marked ${expiredBatches.length} batches as expired`);
      }

      // 2. Check products that have all batches expired/depleted and disable them
      const activeProducts = await Product.find({ isActive: true });
      let disabledCount = 0;

      for (const product of activeProducts) {
        // Get all batches for this product
        const productBatches = await ProductBatch.find({ productId: product._id });

        if (productBatches.length === 0) continue;

        // Check if ALL batches are either expired or depleted
        const allBatchesUnavailable = productBatches.every(
          batch => batch.status === 'expired' || batch.status === 'depleted'
        );

        if (allBatchesUnavailable) {
          product.isActive = false;
          await product.save();
          disabledCount++;
          console.log(`🚫 Disabled product: ${product.name} (${product.sku}) - all batches expired/depleted`);
        }
      }

      if (disabledCount > 0) {
        console.log(`🎉 Auto-disabled ${disabledCount} products (all batches expired/depleted)`);
      } else {
        console.log('✅ No products to disable');
      }

      console.log('✅ Expiry checker job completed');
    } catch (error) {
      console.error('Error in expiry checker job:', error);
    }
  });

  console.log('✅ Expiry checker cron job started (runs daily at 00:00)');
}

/**
 * Manually run expiry check (for testing)
 */
export async function runExpiryCheckNow() {
  try {
    console.log('🕐 Running manual expiry check...');

    const now = new Date();
    let expiredCount = 0;
    let disabledCount = 0;

    // Mark expired batches
    const expiredBatches = await ProductBatch.find({
      expiryDate: { $lt: now },
      status: { $ne: 'expired' },
      remainingQuantity: { $gt: 0 }
    });

    for (const batch of expiredBatches) {
      batch.status = 'expired';
      await batch.save();
      expiredCount++;
    }

    // Disable products with all batches expired/depleted
    const activeProducts = await Product.find({ isActive: true });

    for (const product of activeProducts) {
      const productBatches = await ProductBatch.find({ productId: product._id });

      if (productBatches.length === 0) continue;

      const allBatchesUnavailable = productBatches.every(
        batch => batch.status === 'expired' || batch.status === 'depleted'
      );

      if (allBatchesUnavailable) {
        product.isActive = false;
        await product.save();
        disabledCount++;
      }
    }

    return {
      success: true,
      message: `Expiry check complete: ${expiredCount} batches marked expired, ${disabledCount} products disabled`,
      expiredBatches: expiredCount,
      disabledProducts: disabledCount
    };
  } catch (error) {
    console.error('Error in manual expiry check:', error);
    return { success: false, message: error.message };
  }
}
