import { InventoryAlert, Product } from '../models/index.js';
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
    // Only filter if value is explicitly 'true' or 'false', not empty string
    if (isRead && isRead !== '') filter.isRead = isRead === 'true';
    if (isResolved && isResolved !== '') filter.isResolved = isResolved === 'true';

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
    let alertsResolved = 0;

    const products = await Product.find({}).select(
      'name totalStock minStockLevel maxStockLevel safetyStock leadTimeDays expiryThresholdDays expiryDate variants'
    );

    const now = new Date();

    for (const p of products) {
      const total = p.totalStock || 0;
      const minLevel = Number(p.minStockLevel || 0);
      const maxLevel = Number(p.maxStockLevel || 0);
      const expiryThreshold = Number(p.expiryThresholdDays || 0);

      // Out of stock
      if (total === 0) {
        const safetyStock = Number(p.safetyStock || 0);
        const leadTime = Number(p.leadTimeDays || 0);
        const reorderQty = Math.max(minLevel, safetyStock + (leadTime * 2), 10);
        
        await InventoryAlert.findOneAndUpdate(
          { productId: p._id, type: 'out_of_stock', isResolved: false },
          {
            productId: p._id,
            type: 'out_of_stock',
            severity: 'critical',
            currentStock: 0,
            thresholdValue: 0,
            message: `Sản phẩm ${p.name} đã hết hàng`,
            suggestedAction: 'reorder',
            suggestedReorderQty: reorderQty
          },
          { upsert: true, new: true }
        );
        alertsCreated++;
      } else {
        // Resolve out_of_stock alert if stock > 0
        const resolved = await InventoryAlert.updateMany(
          { productId: p._id, type: 'out_of_stock', isResolved: false },
          { isResolved: true, resolvedAt: new Date(), resolvedNote: 'Tồn kho đã được bổ sung' }
        );
        alertsResolved += resolved.modifiedCount;
      }

      // Low stock (use minStockLevel when set, else heuristic 10)
      const lowThreshold = minLevel > 0 ? minLevel : 10;
      if (total > 0 && total <= lowThreshold) {
        const safetyStock = Number(p.safetyStock || 0);
        const leadTime = Number(p.leadTimeDays || 0);
        const targetStock = Math.max(minLevel, lowThreshold) + safetyStock + (leadTime * 2);
        const reorderQty = Math.max(targetStock - total, 10);
        
        await InventoryAlert.findOneAndUpdate(
          { productId: p._id, type: 'low_stock', isResolved: false },
          {
            productId: p._id,
            type: 'low_stock',
            severity: total <= Math.max(1, Math.floor(lowThreshold / 2)) ? 'critical' : 'high',
            currentStock: total,
            thresholdValue: lowThreshold,
            message: `Sản phẩm ${p.name} sắp hết hàng (${total}/${lowThreshold})`,
            suggestedAction: 'reorder',
            suggestedReorderQty: reorderQty
          },
          { upsert: true, new: true }
        );
        alertsCreated++;
      } else if (total > lowThreshold) {
        // Resolve low_stock alert if stock > threshold
        const resolved = await InventoryAlert.updateMany(
          { productId: p._id, type: 'low_stock', isResolved: false },
          { isResolved: true, resolvedAt: new Date(), resolvedNote: 'Tồn kho đã đủ' }
        );
        alertsResolved += resolved.modifiedCount;
      }

      // Overstock
      if (maxLevel > 0 && total > maxLevel) {
        await InventoryAlert.findOneAndUpdate(
          { productId: p._id, type: 'overstock', isResolved: false },
          {
            productId: p._id,
            type: 'overstock',
            severity: 'medium',
            currentStock: total,
            thresholdValue: maxLevel,
            message: `Sản phẩm ${p.name} vượt tồn tối đa (${total}/${maxLevel})`,
            suggestedAction: 'discount'
          },
          { upsert: true, new: true }
        );
        alertsCreated++;
      } else if (maxLevel > 0 && total <= maxLevel) {
        // Resolve overstock alert if stock <= max
        const resolved = await InventoryAlert.updateMany(
          { productId: p._id, type: 'overstock', isResolved: false },
          { isResolved: true, resolvedAt: new Date(), resolvedNote: 'Tồn kho đã về mức bình thường' }
        );
        alertsResolved += resolved.modifiedCount;
      }

      // Expiry based on product.expiryDate if available
      if (p.expiryDate) {
        const days = Math.ceil((new Date(p.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (days < 0) {
          await InventoryAlert.findOneAndUpdate(
            { productId: p._id, type: 'expired', isResolved: false },
            {
              productId: p._id,
              type: 'expired',
              severity: 'critical',
              currentStock: total,
              thresholdValue: 0,
              message: `Sản phẩm ${p.name} đã hết hạn`,
              expiryDate: p.expiryDate,
              suggestedAction: 'dispose'
            },
            { upsert: true, new: true }
          );
          alertsCreated++;
        } else if (expiryThreshold > 0 && days <= expiryThreshold) {
          await InventoryAlert.findOneAndUpdate(
            { productId: p._id, type: 'expiring_soon', isResolved: false },
            {
              productId: p._id,
              type: 'expiring_soon',
              severity: days <= 7 ? 'critical' : 'high',
              currentStock: total,
              thresholdValue: expiryThreshold,
              message: `Sản phẩm ${p.name} sắp hết hạn (${days} ngày)`,
              expiryDate: p.expiryDate,
              suggestedAction: 'discount'
            },
            { upsert: true, new: true }
          );
          alertsCreated++;
        }
      }
    }

    res.json({ message: 'Kiểm tra cảnh báo hoàn thành', alertsCreated, alertsResolved });
  } catch (error) {
    console.error('Check and create alerts error:', error);
    res.status(500).json({ message: 'Lỗi khi kiểm tra cảnh báo' });
  }
}
