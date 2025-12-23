import { 
  GoodsReceipt, 
  InventoryTransaction, 
  Product, 
  Supplier, 
  ProductBatch 
} from '../models/index.js';
import { z } from 'zod';

/**
 * Goods Receipt Controller
 * Quản lý phiếu nhập hàng từ nhà cung cấp
 */

// Validation schemas
const goodsReceiptSchema = z.object({
  code: z.string().min(1, 'Mã phiếu không được để trống').max(50, 'Mã phiếu không được quá 50 ký tự'),
  supplierId: z.string().min(1, 'Nhà cung cấp không được để trống'),
  batchNumber: z.string().min(1, 'Số lô không được để trống').max(100, 'Số lô không được quá 100 ký tự'),
  items: z.array(z.object({
    productId: z.string().min(1, 'Sản phẩm không được để trống'),
    quantity: z.number().min(1, 'Số lượng phải lớn hơn 0'),
    unitCost: z.number().min(0, 'Đơn giá không được âm'),
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
    const items = parsed.items.map(item => ({
      ...item,
      totalCost: item.unitCost * item.quantity,
      expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined
    }));

    // Tính totalAmount và finalAmount
    const totalAmount = items.reduce((sum, item) => sum + item.totalCost, 0);
    const discount = parsed.discount || 0;
    const tax = parsed.tax || 0;
    const finalAmount = totalAmount - discount + tax;

    const goodsReceipt = new GoodsReceipt({
      ...parsed,
      createdBy: userId,
      expectedDate: parsed.expectedDate ? new Date(parsed.expectedDate) : undefined,
      items,
      totalAmount,
      finalAmount
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
      .populate('items.productId', 'name sku unit') // Populate product info for detail modal
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
    const { note } = req.body || {}; // Handle undefined req.body
    const userId = req.user.id;

    const goodsReceipt = await GoodsReceipt.findById(id);
    if (!goodsReceipt) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu nhập' });
    }

    // Chỉ cho phép duyệt phiếu ở trạng thái draft hoặc pending
    if (goodsReceipt.status !== 'pending' && goodsReceipt.status !== 'draft') {
      return res.status(400).json({ message: 'Chỉ có thể duyệt phiếu nhập ở trạng thái nháp hoặc chờ duyệt' });
    }

    // Cập nhật trạng thái
    goodsReceipt.status = 'completed';
    goodsReceipt.approvedBy = userId;
    goodsReceipt.approvedAt = new Date();
    goodsReceipt.receivedDate = new Date();

    // Tạo giao dịch tồn kho và ProductBatch cho từng item
    for (const item of goodsReceipt.items) {
      // 1. Tạo ProductBatch
      const productBatch = new ProductBatch({
        productId: item.productId,
        batchNumber: goodsReceipt.batchNumber, // Số lô chung từ phiếu nhập
        goodsReceiptId: goodsReceipt._id,
        supplierId: goodsReceipt.supplierId,
        quantity: item.quantity,
        remainingQuantity: item.quantity,
        unitCost: item.unitCost,
        importDate: goodsReceipt.receivedDate,
        expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
        status: 'active',
        createdBy: userId
      });
      await productBatch.save();

      // 2. Tạo InventoryTransaction
      const transaction = new InventoryTransaction({
        productId: item.productId,
        type: 'import',
        quantity: item.quantity,
        unitCost: item.unitCost,
        totalCost: item.totalCost,
        batchNumber: goodsReceipt.batchNumber,
        expiryDate: item.expiryDate,
        supplierId: goodsReceipt.supplierId,
        goodsReceiptId: goodsReceipt._id,
        reason: 'Nhập hàng từ nhà cung cấp',
        note: note || goodsReceipt.note,
        performedBy: userId,
        warehouse: 'main'
      });
      await transaction.save();

      // 3. Cập nhật totalStock của Product
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { totalStock: item.quantity } }
      );
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

/**
 * Download Excel template for goods receipt
 */
export async function downloadTemplate(req, res) {
  try {
    const { generateGoodsReceiptTemplate } = await import('../utils/excelUtils.js');
    
    // Fetch all suppliers for reference
    const suppliers = await Supplier.find({})
      .select('_id name code')
      .sort({ name: 1 })
      .lean();
    
    console.log(`[downloadTemplate] Found ${suppliers.length} suppliers`);
    
    const buffer = await generateGoodsReceiptTemplate(suppliers);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Template_Nhap_Kho.xlsx');
    res.send(buffer);
  } catch (error) {
    console.error('Download template error:', error);
    res.status(500).json({ message: 'Lỗi khi tải template' });
  }
}

/**
 * Parse and validate uploaded Excel file
 */
export async function parseExcelFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng upload file Excel' });
    }

    const { parseGoodsReceiptExcel } = await import('../utils/excelUtils.js');
    const parsedData = parseGoodsReceiptExcel(req.file.buffer);

    // Validate products exist and get full info
    const validatedProducts = [];
    const errors = [];

    for (const item of parsedData.products) {
      const product = await Product.findOne({ sku: item.sku });
      
      if (!product) {
        errors.push({
          row: item.rowNumber,
          field: 'SKU',
          message: `Không tìm thấy sản phẩm với SKU: ${item.sku}`
        });
        continue;
      }

      if (item.quantity <= 0) {
        errors.push({
          row: item.rowNumber,
          field: 'Số lượng',
          message: 'Số lượng phải lớn hơn 0'
        });
        continue;
      }

      if (item.unitCost < 0) {
        errors.push({
          row: item.rowNumber,
          field: 'Đơn giá',
          message: 'Đơn giá không được âm'
        });
        continue;
      }

      // Parse expiry date if present (DD/MM/YYYY -> ISO)
      let expiryDate = null;
      if (item.expiryDate) {
        const dateStr = item.expiryDate.toString().trim();
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1; // Month is 0-indexed
          const year = parseInt(parts[2]);
          const parsed = new Date(year, month, day);
          
          // Validate date
          if (!isNaN(parsed.getTime())) {
            expiryDate = parsed.toISOString();
          } else {
            errors.push({
              row: item.rowNumber,
              field: 'HSD',
              message: `Ngày không hợp lệ: ${dateStr}`
            });
          }
        } else {
          errors.push({
            row: item.rowNumber,
            field: 'HSD',
            message: `Định dạng ngày phải là DD/MM/YYYY, nhận được: ${dateStr}`
          });
        }
      }

      validatedProducts.push({
        ...item,
        productId: product._id,
        productName: product.name,
        unit: product.unit,
        expiryDate: expiryDate
      });
    }

    // Validate supplier
    if (parsedData.receiptInfo.supplierId) {
      const supplier = await Supplier.findById(parsedData.receiptInfo.supplierId);
      if (!supplier) {
        errors.push({
          row: 'Thông tin phiếu',
          field: 'Nhà cung cấp',
          message: 'Không tìm thấy nhà cung cấp'
        });
      }
    }

    res.json({
      success: errors.length === 0,
      data: {
        receiptInfo: parsedData.receiptInfo,
        products: validatedProducts,
        totalItems: validatedProducts.length
      },
      errors
    });
  } catch (error) {
    console.error('Parse Excel error:', error);
    res.status(500).json({ message: error.message || 'Lỗi khi đọc file Excel' });
  }
}

/**
 * Bulk create goods receipt from Excel data
 */
export async function bulkCreateFromExcel(req, res) {
  try {
    const { receiptInfo, products } = req.body;
    const userId = req.user.id;

    // Generate unique code
    const code = `GR${Date.now().toString().slice(-10)}`;

    // Prepare items
    const items = products.map(p => ({
      productId: p.productId,
      quantity: p.quantity,
      unitCost: p.unitCost,
      expiryDate: p.expiryDate,
      totalCost: p.quantity * p.unitCost
    }));

    // Calculate totals
    const totalAmount = items.reduce((sum, item) => sum + item.totalCost, 0);

    // Create goods receipt
    const goodsReceipt = new GoodsReceipt({
      code,
      supplierId: receiptInfo.supplierId,
      batchNumber: receiptInfo.batchNumber,
      items,
      totalAmount,
      finalAmount: totalAmount,
      note: receiptInfo.note,
      status: 'pending',
      createdBy: userId
    });

    await goodsReceipt.save();

    res.status(201).json({
      success: true,
      message: 'Tạo phiếu nhập từ Excel thành công',
      goodsReceipt
    });
  } catch (error) {
    console.error('Bulk create from Excel error:', error);
    res.status(500).json({ message: 'Lỗi khi tạo phiếu nhập từ Excel' });
  }
}

/**
 * Delete goods receipt (only draft status)
 */
export async function deleteGoodsReceipt(req, res) {
  try {
    const { id } = req.params;

    const goodsReceipt = await GoodsReceipt.findById(id);
    if (!goodsReceipt) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu nhập' });
    }

    // Only allow delete draft receipts
    if (goodsReceipt.status !== 'draft') {
      return res.status(400).json({ message: 'Chỉ có thể xóa phiếu nhập ở trạng thái nháp' });
    }

    await GoodsReceipt.findByIdAndDelete(id);

    res.json({ message: 'Xóa phiếu nhập thành công' });
  } catch (error) {
    console.error('Delete goods receipt error:', error);
    res.status(500).json({ message: 'Lỗi khi xóa phiếu nhập' });
  }
}
