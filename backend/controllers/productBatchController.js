import ProductBatch from '../models/ProductBatch.js';
import Product from '../models/Product.js';

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
 * Helper function: Phân bổ tồn kho từ các lô theo FIFO
 * Trả về danh sách các lô cần trừ và số lượng tương ứng
 */
export async function allocateStockFromBatches(productId, quantityNeeded) {
  try {
    // Lấy các lô còn hàng, sắp xếp theo ngày nhập (FIFO)
    const batches = await ProductBatch.find({
      productId,
      status: 'active',
      remainingQuantity: { $gt: 0 }
    }).sort({ importDate: 1 }); // Lô cũ nhất trước

    const allocations = [];
    let remaining = quantityNeeded;

    for (const batch of batches) {
      if (remaining <= 0) break;

      const allocateQty = Math.min(batch.remainingQuantity, remaining);
      
      allocations.push({
        batchId: batch._id,
        batchNumber: batch.batchNumber,
        quantity: allocateQty,
        unitCost: batch.unitCost
      });

      remaining -= allocateQty;
    }

    if (remaining > 0) {
      throw new Error(`Không đủ hàng trong kho. Thiếu ${remaining} sản phẩm.`);
    }

    return allocations;
  } catch (error) {
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
