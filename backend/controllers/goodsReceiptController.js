import GoodsReceipt from '../models/GoodsReceipt.js';
import InventoryTransaction from '../models/InventoryTransaction.js';
import Product from '../models/Product.js';
import Supplier from '../models/Supplier.js';
import { z } from 'zod';

/**
 * Goods Receipt Controller
 * Quản lý phiếu nhập hàng từ nhà cung cấp
 */

// Validation schemas
const goodsReceiptSchema = z.object({
  code: z.string().min(1, 'Mã phiếu không được để trống').max(50, 'Mã phiếu không được quá 50 ký tự'),
  supplierId: z.string().min(1, 'Nhà cung cấp không được để trống'),
  items: z.array(z.object({
    productId: z.string().min(1, 'Sản phẩm không được để trống'),
    variantId: z.string().optional(),
    quantity: z.number().min(1, 'Số lượng phải lớn hơn 0'),
    unitCost: z.number().min(0, 'Đơn giá không được âm'),
    batchNumber: z.string().optional(),
    expiryDate: z.string().optional()
  })).min(1, 'Phải có ít nhất 1 sản phẩm'),
  discount: z.number().min(0, 'Giảm giá không được âm').optional(),
  tax: z.number().min(0, 'Thuế không được âm').optional(),
  expectedDate: z.string().optional(),
  note: z.string().max(1000, 'Ghi chú không được quá 1000 ký tự').optional()
});

/**
 * Tạo phiếu nhập hàng mới
 */
export async function createGoodsReceipt(req, res) {
  try {
    const parsed = goodsReceiptSchema.parse(req.body);
    const userId = req.user.id;

    // Kiểm tra mã phiếu trùng
    const existingReceipt = await GoodsReceipt.findOne({ code: parsed.code });
    if (existingReceipt) {
      return res.status(409).json({ message: 'Mã phiếu đã tồn tại' });
    }

    // Kiểm tra nhà cung cấp
    const supplier = await Supplier.findById(parsed.supplierId);
    if (!supplier) {
      return res.status(404).json({ message: 'Không tìm thấy nhà cung cấp' });
    }

    // Kiểm tra sản phẩm
    for (const item of parsed.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Không tìm thấy sản phẩm: ${item.productId}` });
      }

      if (item.variantId) {
        const variant = product.variants.id(item.variantId);
        if (!variant) {
          return res.status(404).json({ message: `Không tìm thấy biến thể sản phẩm: ${item.variantId}` });
        }
      }
    }

    // Tạo phiếu nhập
    const goodsReceipt = new GoodsReceipt({
      ...parsed,
      createdBy: userId,
      expectedDate: parsed.expectedDate ? new Date(parsed.expectedDate) : undefined,
      items: parsed.items.map(item => ({
        ...item,
        totalCost: item.unitCost * item.quantity,
        expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined
      }))
    });

    await goodsReceipt.save();

    res.status(201).json({
      message: 'Tạo phiếu nhập thành công',
      goodsReceipt
    });
  } catch (error) {
    console.error('Create goods receipt error:', error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
    } else if (error.name === 'ZodError') {
      res.status(400).json({ message: error.errors[0].message });
    } else {
      res.status(500).json({ message: 'Lỗi khi tạo phiếu nhập' });
    }
  }
}

/**
 * Lấy danh sách phiếu nhập với phân trang và lọc
 */
export async function getGoodsReceipts(req, res) {
  try {
    const {
      page = 1,
      limit = 20,
      supplierId,
      status,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    
    if (supplierId) filter.supplierId = supplierId;
    if (status) filter.status = status;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const goodsReceipts = await GoodsReceipt.find(filter)
      .populate('supplierId', 'name code')
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await GoodsReceipt.countDocuments(filter);

    res.json({
      goodsReceipts,
      pagination: {
        current: parseInt(page),
        pageSize: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get goods receipts error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách phiếu nhập' });
  }
}

/**
 * Lấy chi tiết phiếu nhập
 */
export async function getGoodsReceiptById(req, res) {
  try {
    const { id } = req.params;

    const goodsReceipt = await GoodsReceipt.findById(id)
      .populate('supplierId', 'name code companyName phone address')
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name')
      .populate('items.productId', 'name sku barcode')
      .populate('items.variantId');

    if (!goodsReceipt) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu nhập' });
    }

    res.json(goodsReceipt);
  } catch (error) {
    console.error('Get goods receipt by id error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy chi tiết phiếu nhập' });
  }
}

/**
 * Cập nhật phiếu nhập
 */
export async function updateGoodsReceipt(req, res) {
  try {
    const { id } = req.params;
    const parsed = goodsReceiptSchema.partial().parse(req.body);

    const goodsReceipt = await GoodsReceipt.findById(id);
    if (!goodsReceipt) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu nhập' });
    }

    // Chỉ cho phép cập nhật khi ở trạng thái draft
    if (goodsReceipt.status !== 'draft') {
      return res.status(400).json({ message: 'Chỉ có thể cập nhật phiếu nhập ở trạng thái nháp' });
    }

    // Cập nhật items nếu có
    if (parsed.items) {
      parsed.items = parsed.items.map(item => ({
        ...item,
        totalCost: item.unitCost * item.quantity,
        expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined
      }));
    }

    Object.assign(goodsReceipt, parsed);
    await goodsReceipt.save();

    res.json({
      message: 'Cập nhật phiếu nhập thành công',
      goodsReceipt
    });
  } catch (error) {
    console.error('Update goods receipt error:', error);
    if (error.name === 'ZodError') {
      res.status(400).json({ message: error.errors[0].message });
    } else {
      res.status(500).json({ message: 'Lỗi khi cập nhật phiếu nhập' });
    }
  }
}

/**
 * Duyệt phiếu nhập
 */
export async function approveGoodsReceipt(req, res) {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const userId = req.user.id;

    const goodsReceipt = await GoodsReceipt.findById(id);
    if (!goodsReceipt) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu nhập' });
    }

    if (goodsReceipt.status !== 'pending') {
      return res.status(400).json({ message: 'Chỉ có thể duyệt phiếu nhập ở trạng thái chờ duyệt' });
    }

    // Cập nhật trạng thái
    goodsReceipt.status = 'completed';
    goodsReceipt.approvedBy = userId;
    goodsReceipt.approvedAt = new Date();
    goodsReceipt.receivedDate = new Date();

    // Tạo giao dịch tồn kho cho từng item
    for (const item of goodsReceipt.items) {
      const transaction = new InventoryTransaction({
        productId: item.productId,
        variantId: item.variantId,
        type: 'import',
        quantity: item.quantity,
        unitCost: item.unitCost,
        totalCost: item.totalCost,
        batchNumber: item.batchNumber,
        expiryDate: item.expiryDate,
        supplierId: goodsReceipt.supplierId,
        goodsReceiptId: goodsReceipt._id,
        reason: 'Nhập hàng từ nhà cung cấp',
        note: note || goodsReceipt.note,
        performedBy: userId,
        warehouse: 'main'
      });

      await transaction.save();
    }

    await goodsReceipt.save();

    res.json({
      message: 'Duyệt phiếu nhập thành công',
      goodsReceipt
    });
  } catch (error) {
    console.error('Approve goods receipt error:', error);
    res.status(500).json({ message: 'Lỗi khi duyệt phiếu nhập' });
  }
}

/**
 * Hủy phiếu nhập
 */
export async function cancelGoodsReceipt(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const goodsReceipt = await GoodsReceipt.findById(id);
    if (!goodsReceipt) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu nhập' });
    }

    if (goodsReceipt.status === 'completed') {
      return res.status(400).json({ message: 'Không thể hủy phiếu nhập đã hoàn thành' });
    }

    goodsReceipt.status = 'cancelled';
    goodsReceipt.note = reason || goodsReceipt.note;
    await goodsReceipt.save();

    res.json({
      message: 'Hủy phiếu nhập thành công',
      goodsReceipt
    });
  } catch (error) {
    console.error('Cancel goods receipt error:', error);
    res.status(500).json({ message: 'Lỗi khi hủy phiếu nhập' });
  }
}

/**
 * Lấy thống kê phiếu nhập
 */
export async function getGoodsReceiptStats(req, res) {
  try {
    const stats = await GoodsReceipt.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$finalAmount' }
        }
      }
    ]);

    const monthlyStats = await GoodsReceipt.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$finalAmount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      statusStats: stats,
      monthlyStats
    });
  } catch (error) {
    console.error('Get goods receipt stats error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy thống kê phiếu nhập' });
  }
}
