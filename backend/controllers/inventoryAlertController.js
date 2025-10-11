import InventoryAlert from '../models/InventoryAlert.js';
import Product from '../models/Product.js';
import { z } from 'zod';

/**
 * Inventory Alert Controller
 * Quản lý cảnh báo tồn kho
 */

/**
 * Lấy danh sách cảnh báo với phân trang và lọc
 */
export async function getAlerts(req, res) {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      severity,
      isRead,
      isResolved,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    
    if (type) filter.type = type;
    if (severity) filter.severity = severity;
    if (isRead !== undefined) filter.isRead = isRead === 'true';
    if (isResolved !== undefined) filter.isResolved = isResolved === 'true';

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const alerts = await InventoryAlert.find(filter)
      .populate('productId', 'name sku')
      .populate('resolvedBy', 'name')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await InventoryAlert.countDocuments(filter);

    res.json({
      alerts,
      pagination: {
        current: parseInt(page),
        pageSize: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách cảnh báo' });
  }
}

/**
 * Đánh dấu cảnh báo đã đọc
 */
export async function markAlertAsRead(req, res) {
  try {
    const { id } = req.params;

    const alert = await InventoryAlert.findById(id);
    if (!alert) {
      return res.status(404).json({ message: 'Không tìm thấy cảnh báo' });
    }

    alert.isRead = true;
    await alert.save();

    res.json({
      message: 'Đánh dấu cảnh báo đã đọc thành công',
      alert
    });
  } catch (error) {
    console.error('Mark alert as read error:', error);
    res.status(500).json({ message: 'Lỗi khi đánh dấu cảnh báo' });
  }
}

/**
 * Giải quyết cảnh báo
 */
export async function resolveAlert(req, res) {
  try {
    const { id } = req.params;
    const { resolvedNote, suggestedAction } = req.body;
    const userId = req.user.id;

    const alert = await InventoryAlert.findById(id);
    if (!alert) {
      return res.status(404).json({ message: 'Không tìm thấy cảnh báo' });
    }

    if (alert.isResolved) {
      return res.status(400).json({ message: 'Cảnh báo đã được giải quyết' });
    }

    alert.isResolved = true;
    alert.resolvedBy = userId;
    alert.resolvedAt = new Date();
    alert.resolvedNote = resolvedNote;
    alert.suggestedAction = suggestedAction || alert.suggestedAction;

    await alert.save();

    res.json({
      message: 'Giải quyết cảnh báo thành công',
      alert
    });
  } catch (error) {
    console.error('Resolve alert error:', error);
    res.status(500).json({ message: 'Lỗi khi giải quyết cảnh báo' });
  }
}

/**
 * Lấy thống kê cảnh báo
 */
export async function getAlertStats(req, res) {
  try {
    const stats = await InventoryAlert.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          unread: { $sum: { $cond: ['$isRead', 0, 1] } },
          unresolved: { $sum: { $cond: ['$isResolved', 0, 1] } }
        }
      }
    ]);

    const severityStats = await InventoryAlert.aggregate([
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 },
          unread: { $sum: { $cond: ['$isRead', 0, 1] } },
          unresolved: { $sum: { $cond: ['$isResolved', 0, 1] } }
        }
      }
    ]);

    const totalAlerts = await InventoryAlert.countDocuments();
    const unreadAlerts = await InventoryAlert.countDocuments({ isRead: false });
    const unresolvedAlerts = await InventoryAlert.countDocuments({ isResolved: false });

    res.json({
      typeStats: stats,
      severityStats,
      summary: {
        total: totalAlerts,
        unread: unreadAlerts,
        unresolved: unresolvedAlerts
      }
    });
  } catch (error) {
    console.error('Get alert stats error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy thống kê cảnh báo' });
  }
}

/**
 * Tạo cảnh báo thủ công
 */
export async function createAlert(req, res) {
  try {
    const alertSchema = z.object({
      productId: z.string().min(1, 'Sản phẩm không được để trống'),
      variantId: z.string().optional(),
      type: z.enum(['low_stock', 'out_of_stock', 'expiring_soon', 'expired', 'overstock', 'slow_moving']),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      message: z.string().min(1, 'Nội dung cảnh báo không được để trống').max(500),
      suggestedAction: z.enum(['reorder', 'discount', 'return_to_supplier', 'dispose', 'transfer', 'none']).optional()
    });

    const parsed = alertSchema.parse(req.body);

    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findById(parsed.productId);
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    const alert = new InventoryAlert({
      ...parsed,
      currentStock: parsed.variantId ? 
        product.variants.id(parsed.variantId)?.stockOnHand || 0 : 
        product.totalStock,
      thresholdValue: 0
    });

    await alert.save();

    res.status(201).json({
      message: 'Tạo cảnh báo thành công',
      alert
    });
  } catch (error) {
    console.error('Create alert error:', error);
    if (error.name === 'ZodError') {
      res.status(400).json({ message: error.errors[0].message });
    } else {
      res.status(500).json({ message: 'Lỗi khi tạo cảnh báo' });
    }
  }
}

/**
 * Kiểm tra và tạo cảnh báo tự động
 */
export async function checkAndCreateAlerts(req, res) {
  try {
    let alertsCreated = 0;

    // Kiểm tra sản phẩm hết hàng
    const outOfStockProducts = await Product.find({
      $or: [
        { totalStock: 0 },
        { 'variants.stockOnHand': 0 }
      ]
    });

    for (const product of outOfStockProducts) {
      if (product.totalStock === 0) {
        await InventoryAlert.findOneAndUpdate(
          { productId: product._id, type: 'out_of_stock', isResolved: false },
          {
            productId: product._id,
            type: 'out_of_stock',
            severity: 'critical',
            currentStock: 0,
            thresholdValue: 0,
            message: `Sản phẩm ${product.name} đã hết hàng`,
            suggestedAction: 'reorder'
          },
          { upsert: true, new: true }
        );
        alertsCreated++;
      }

      // Kiểm tra variants hết hàng
      for (const variant of product.variants) {
        if (variant.stockOnHand === 0) {
          await InventoryAlert.findOneAndUpdate(
            { productId: product._id, variantId: variant._id, type: 'out_of_stock', isResolved: false },
            {
              productId: product._id,
              variantId: variant._id,
              type: 'out_of_stock',
              severity: 'critical',
              currentStock: 0,
              thresholdValue: 0,
              message: `Sản phẩm ${product.name} - ${variant.name} đã hết hàng`,
              suggestedAction: 'reorder'
            },
            { upsert: true, new: true }
          );
          alertsCreated++;
        }
      }
    }

    // Kiểm tra sản phẩm sắp hết hàng
    const lowStockProducts = await Product.find({
      $or: [
        { totalStock: { $lte: 10, $gt: 0 } },
        { 'variants.stockOnHand': { $lte: 10, $gt: 0 } }
      ]
    });

    for (const product of lowStockProducts) {
      if (product.totalStock <= 10 && product.totalStock > 0) {
        await InventoryAlert.findOneAndUpdate(
          { productId: product._id, type: 'low_stock', isResolved: false },
          {
            productId: product._id,
            type: 'low_stock',
            severity: 'high',
            currentStock: product.totalStock,
            thresholdValue: 10,
            message: `Sản phẩm ${product.name} sắp hết hàng (${product.totalStock})`,
            suggestedAction: 'reorder'
          },
          { upsert: true, new: true }
        );
        alertsCreated++;
      }

      // Kiểm tra variants sắp hết hàng
      for (const variant of product.variants) {
        if (variant.stockOnHand <= variant.minStockLevel && variant.stockOnHand > 0) {
          await InventoryAlert.findOneAndUpdate(
            { productId: product._id, variantId: variant._id, type: 'low_stock', isResolved: false },
            {
              productId: product._id,
              variantId: variant._id,
              type: 'low_stock',
              severity: 'high',
              currentStock: variant.stockOnHand,
              thresholdValue: variant.minStockLevel,
              message: `Sản phẩm ${product.name} - ${variant.name} sắp hết hàng (${variant.stockOnHand}/${variant.minStockLevel})`,
              suggestedAction: 'reorder'
            },
            { upsert: true, new: true }
          );
          alertsCreated++;
        }
      }
    }

    res.json({
      message: `Kiểm tra cảnh báo hoàn thành`,
      alertsCreated
    });
  } catch (error) {
    console.error('Check and create alerts error:', error);
    res.status(500).json({ message: 'Lỗi khi kiểm tra cảnh báo' });
  }
}
