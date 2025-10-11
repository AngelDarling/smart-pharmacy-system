import InventoryTransaction from '../models/InventoryTransaction.js';
import InventoryAlert from '../models/InventoryAlert.js';
import Product from '../models/Product.js';
import { z } from 'zod';

/**
 * Inventory Transaction Controller
 * Quản lý các giao dịch nhập/xuất/điều chỉnh kho
 */

// Validation schemas
const transactionSchema = z.object({
  productId: z.string().min(1, 'Sản phẩm không được để trống'),
  variantId: z.string().optional(),
  type: z.enum(['import', 'export', 'adjust', 'transfer', 'return'], {
    errorMap: () => ({ message: 'Loại giao dịch không hợp lệ' })
  }),
  quantity: z.number().min(1, 'Số lượng phải lớn hơn 0'),
  unitCost: z.number().min(0, 'Đơn giá không được âm').optional(),
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  supplierId: z.string().optional(),
  goodsReceiptId: z.string().optional(),
  orderId: z.string().optional(),
  reason: z.string().max(500, 'Lý do không được quá 500 ký tự').optional(),
  note: z.string().max(1000, 'Ghi chú không được quá 1000 ký tự').optional(),
  warehouse: z.string().max(100, 'Tên kho không được quá 100 ký tự').optional(),
  location: z.string().max(200, 'Vị trí không được quá 200 ký tự').optional()
});

/**
 * Tạo giao dịch tồn kho mới
 */
export async function createTransaction(req, res) {
  try {
    const parsed = transactionSchema.parse(req.body);
    const userId = req.user.id;

    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findById(parsed.productId);
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    // Kiểm tra variant nếu có
    if (parsed.variantId) {
      const variant = product.variants.id(parsed.variantId);
      if (!variant) {
        return res.status(404).json({ message: 'Không tìm thấy biến thể sản phẩm' });
      }
    }

    // Tạo giao dịch
    const transaction = new InventoryTransaction({
      ...parsed,
      performedBy: userId,
      expiryDate: parsed.expiryDate ? new Date(parsed.expiryDate) : undefined
    });

    await transaction.save();

    // Cập nhật tồn kho sản phẩm
    await updateProductStock(parsed.productId, parsed.variantId, parsed.type, parsed.quantity);

    // Tạo cảnh báo nếu cần
    await checkAndCreateAlerts(parsed.productId, parsed.variantId);

    res.status(201).json({
      message: 'Tạo giao dịch thành công',
      transaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
    } else if (error.name === 'ZodError') {
      res.status(400).json({ message: error.errors[0].message });
    } else {
      res.status(500).json({ message: 'Lỗi khi tạo giao dịch' });
    }
  }
}

/**
 * Lấy danh sách giao dịch với phân trang và lọc
 */
export async function getTransactions(req, res) {
  try {
    const {
      page = 1,
      limit = 20,
      productId,
      type,
      supplierId,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    
    if (productId) filter.productId = productId;
    if (type) filter.type = type;
    if (supplierId) filter.supplierId = supplierId;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const transactions = await InventoryTransaction.find(filter)
      .populate('productId', 'name sku')
      .populate('supplierId', 'name code')
      .populate('performedBy', 'name')
      .populate('goodsReceiptId', 'code')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await InventoryTransaction.countDocuments(filter);

    res.json({
      transactions,
      pagination: {
        current: parseInt(page),
        pageSize: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách giao dịch' });
  }
}

/**
 * Lấy lịch sử giao dịch của một sản phẩm
 */
export async function getProductTransactions(req, res) {
  try {
    const { productId } = req.params;
    const { variantId, limit = 50 } = req.query;

    const filter = { productId };
    if (variantId) filter.variantId = variantId;

    const transactions = await InventoryTransaction.find(filter)
      .populate('supplierId', 'name code')
      .populate('performedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(transactions);
  } catch (error) {
    console.error('Get product transactions error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy lịch sử giao dịch' });
  }
}

/**
 * Lấy thống kê tồn kho
 */
export async function getInventoryStats(req, res) {
  try {
    const stats = await InventoryTransaction.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalCost: { $sum: '$totalCost' }
        }
      }
    ]);

    const lowStockProducts = await Product.find({
      $or: [
        { totalStock: { $lte: 10 } },
        { 'variants.stockOnHand': { $lte: 10 } }
      ]
    }).countDocuments();

    const outOfStockProducts = await Product.find({
      $or: [
        { totalStock: 0 },
        { 'variants.stockOnHand': 0 }
      ]
    }).countDocuments();

    res.json({
      transactionStats: stats,
      lowStockProducts,
      outOfStockProducts,
      totalProducts: await Product.countDocuments()
    });
  } catch (error) {
    console.error('Get inventory stats error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy thống kê tồn kho' });
  }
}

/**
 * Cập nhật tồn kho sản phẩm
 */
async function updateProductStock(productId, variantId, type, quantity) {
  const product = await Product.findById(productId);
  if (!product) return;

  if (variantId) {
    // Cập nhật variant
    const variant = product.variants.id(variantId);
    if (variant) {
      if (type === 'import') {
        variant.stockOnHand += quantity;
      } else if (type === 'export') {
        variant.stockOnHand = Math.max(0, variant.stockOnHand - quantity);
      } else if (type === 'adjust') {
        variant.stockOnHand = quantity;
      }
      await product.save();
    }
  } else {
    // Cập nhật tổng tồn kho
    if (type === 'import') {
      product.totalStock += quantity;
    } else if (type === 'export') {
      product.totalStock = Math.max(0, product.totalStock - quantity);
    } else if (type === 'adjust') {
      product.totalStock = quantity;
    }
    await product.save();
  }
}

/**
 * Kiểm tra và tạo cảnh báo tồn kho
 */
async function checkAndCreateAlerts(productId, variantId) {
  const product = await Product.findById(productId);
  if (!product) return;

  if (variantId) {
    const variant = product.variants.id(variantId);
    if (!variant) return;

    // Kiểm tra tồn kho thấp
    if (variant.stockOnHand <= variant.minStockLevel) {
      await InventoryAlert.findOneAndUpdate(
        { productId, variantId, type: 'low_stock', isResolved: false },
        {
          productId,
          variantId,
          type: 'low_stock',
          severity: variant.stockOnHand === 0 ? 'critical' : 'high',
          currentStock: variant.stockOnHand,
          thresholdValue: variant.minStockLevel,
          message: `Sản phẩm ${product.name} - ${variant.name} sắp hết hàng (${variant.stockOnHand}/${variant.minStockLevel})`,
          suggestedAction: 'reorder'
        },
        { upsert: true, new: true }
      );
    }
  } else {
    // Kiểm tra tổng tồn kho
    if (product.totalStock <= 10) {
      await InventoryAlert.findOneAndUpdate(
        { productId, type: 'low_stock', isResolved: false },
        {
          productId,
          type: 'low_stock',
          severity: product.totalStock === 0 ? 'critical' : 'high',
          currentStock: product.totalStock,
          thresholdValue: 10,
          message: `Sản phẩm ${product.name} sắp hết hàng (${product.totalStock})`,
          suggestedAction: 'reorder'
        },
        { upsert: true, new: true }
      );
    }
  }
}
