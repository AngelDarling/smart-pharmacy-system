import { ProductBatch, Product, InventoryTransaction } from '../models/index.js';

/**
 * Product Batch Controller
 * Quản lý các lô hàng của sản phẩm
 */

/**
 * Lấy danh sách các lô của một sản phẩm
 */
export async function getProductBatches(req, res) {
  try {
    const { productId } = req.params;
    const { status, sortBy = 'importDate', sortOrder = 'desc' } = req.query;

    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    // Build filter
    const filter = { productId };
    if (status) {
      filter.status = status;
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Query batches
    const batches = await ProductBatch.find(filter)
      .populate('supplierId', 'name code')
      .populate('goodsReceiptId', 'code')
      .populate('createdBy', 'name')
      .sort(sort);

    res.json({
      batches,
      total: batches.length,
      product: {
        _id: product._id,
        name: product.name,
        sku: product.sku,
        totalStock: product.totalStock
      }
    });
  } catch (error) {
    console.error('Get product batches error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách lô hàng' });
  }
}

/**
 * Lấy chi tiết một lô hàng
 */
export async function getBatchDetails(req, res) {
  try {
    const { id } = req.params;

    const batch = await ProductBatch.findById(id)
      .populate('productId', 'name sku barcode unit')
      .populate('supplierId', 'name code companyName phone address')
      .populate('goodsReceiptId', 'code receivedDate note')
      .populate('createdBy', 'name');

    if (!batch) {
      return res.status(404).json({ message: 'Không tìm thấy lô hàng' });
    }

    res.json(batch);
  } catch (error) {
    console.error('Get batch details error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy chi tiết lô hàng' });
  }
}

/**
 * Cập nhật số lượng còn lại của lô (khi xuất hàng)
 * Sử dụng FIFO - First In First Out
 */
export async function updateBatchQuantity(req, res) {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({ message: 'Số lượng không hợp lệ' });
    }

    const batch = await ProductBatch.findById(id);
    if (!batch) {
      return res.status(404).json({ message: 'Không tìm thấy lô hàng' });
    }

    if (quantity > batch.remainingQuantity) {
      return res.status(400).json({ 
        message: 'Số lượng xuất vượt quá số lượng còn lại trong lô',
        remainingQuantity: batch.remainingQuantity
      });
    }

    batch.remainingQuantity -= quantity;
    await batch.save(); // Status sẽ tự động cập nhật qua pre-save hook

    res.json({
      message: 'Cập nhật số lượng lô hàng thành công',
      batch
    });
  } catch (error) {
    console.error('Update batch quantity error:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật số lượng lô hàng' });
  }
}

/**
 * Helper function: Phân bổ tồn kho từ các lô theo FEFO (First Expiry First Out)
 * Trả về danh sách các lô cần trừ và số lượng tương ứng
 * Ưu tiên sử dụng lô gần hết hạn nhất, BỎ QUA lô đã hết hạn
 */
export async function allocateStockFromBatches(productId, quantityNeeded) {
  try {
    const now = new Date();

    // Lấy các lô còn hàng, CHƯA HẾT HẠN, sắp xếp theo ngày hết hạn (FEFO - gần hết hạn nhất trước)
    const batches = await ProductBatch.find({
      productId,
      status: 'active',
      remainingQuantity: { $gt: 0 },
      // Chỉ lấy batch chưa hết hạn HOẶC không có expiryDate
      $or: [
        { expiryDate: { $exists: false } },
        { expiryDate: null },
        { expiryDate: { $gte: now } }
      ]
    }).sort({ 
      // Ưu tiên batch có expiryDate gần nhất (FEFO)
      // Batch không có expiryDate sẽ đi sau
      expiryDate: 1,
      importDate: 1 // Nếu cùng expiryDate, ưu tiên lô cũ hơn
    });

    const allocations = [];
    let remaining = quantityNeeded;

    for (const batch of batches) {
      if (remaining <= 0) break;

      const allocateQty = Math.min(batch.remainingQuantity, remaining);
      
      allocations.push({
        batchId: batch._id,
        batchNumber: batch.batchNumber,
        quantity: allocateQty,
        unitCost: batch.unitCost,
        expiryDate: batch.expiryDate // Thêm thông tin expiry để tracking
      });

      remaining -= allocateQty;
    }

    if (remaining > 0) {
      throw new Error(`Không đủ hàng CÒN HẠN trong kho. Thiếu ${remaining} sản phẩm.`);
    }

    return allocations;
  } catch (error) {
    throw error;
  }
}

/**
 * Helper function: Trừ tồn kho đồng bộ cho toàn bộ đơn hàng (FIFO/FEFO)
 * Thực hiện: 1. Phân bổ lô -> 2. Trừ qty batch -> 3. Trừ qty product -> 4. Tạo các giao dịch kho
 */
export async function reduceStockFIFO(order, performedBy = null) {
  try {
    for (const item of order.items) {
      // 1. Phân bổ từ các lô (FEFO - First Expiry First Out)
      const allocations = await allocateStockFromBatches(item.productId, item.quantity);
      
      // 2. Trừ số lượng ở từng lô
      for (const allocation of allocations) {
        const batch = await ProductBatch.findById(allocation.batchId);
        if (batch) {
          batch.remainingQuantity -= allocation.quantity;
          await batch.save();
        }
        
        // 3. Tạo giao dịch kho chi tiết cho từng lô
        await InventoryTransaction.create({
          productId: item.productId,
          type: "sale",
          quantity: -allocation.quantity,
          batchNumber: allocation.batchNumber,
          unitCost: allocation.unitCost,
          reason: `Đơn hàng ${order.code} - Xuất kho từ lô ${allocation.batchNumber}`,
          orderId: order._id,
          performedBy: performedBy || order.userId || null
        });
      }
      
      // 4. Cập nhật tổng tồn kho ở Product
      const product = await Product.findById(item.productId);
      if (product) {
        product.totalStock -= item.quantity;
        // Nếu có variants, cập nhật stockOnHand của variant đầu tiên (đơn giản hóa)
        if (product.variants && product.variants.length > 0) {
          const mainVariant = product.variants.find(v => v.isActive) || product.variants[0];
          mainVariant.stockOnHand -= item.quantity;
        }
        await product.save();
      }
    }
  } catch (error) {
    console.error('Error reducing stock FIFO:', error);
    throw error;
  }
}

/**
 * Lấy thống kê các lô hàng
 */
export async function getBatchStats(req, res) {
  try {
    const stats = await ProductBatch.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalRemaining: { $sum: '$remainingQuantity' }
        }
      }
    ]);

    // Lô sắp hết hạn (< 30 ngày)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringSoon = await ProductBatch.countDocuments({
      status: 'active',
      expiryDate: {
        $gte: new Date(),
        $lte: thirtyDaysFromNow
      }
    });

    res.json({
      statusStats: stats,
      expiringSoon
    });
  } catch (error) {
    console.error('Get batch stats error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy thống kê lô hàng' });
  }
}
