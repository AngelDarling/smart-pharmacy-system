import mongoose from "mongoose";

/**
 * Inventory Transaction Schema
 * Ghi lại tất cả các giao dịch nhập/xuất/điều chỉnh kho
 */
const inventoryTransactionSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false // null nếu là sản phẩm không có variant
  },
  type: {
    type: String,
    enum: ['import', 'export', 'adjust', 'transfer', 'return'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unitCost: {
    type: Number,
    min: 0
  },
  totalCost: {
    type: Number,
    min: 0
  },
  batchNumber: {
    type: String,
    maxlength: 100
  },
  expiryDate: {
    type: Date
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  goodsReceiptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GoodsReceipt'
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  reason: {
    type: String,
    maxlength: 500
  },
  note: {
    type: String,
    maxlength: 1000
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed'
  },
  // Thông tin kho
  warehouse: {
    type: String,
    default: 'main',
    maxlength: 100
  },
  location: {
    type: String,
    maxlength: 200
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual để tính totalCost tự động
inventoryTransactionSchema.pre('save', function(next) {
  if (this.unitCost && this.quantity) {
    this.totalCost = this.unitCost * Math.abs(this.quantity);
  }
  next();
});

// Indexes
inventoryTransactionSchema.index({ productId: 1, createdAt: -1 });
inventoryTransactionSchema.index({ type: 1, createdAt: -1 });
inventoryTransactionSchema.index({ performedBy: 1, createdAt: -1 });
inventoryTransactionSchema.index({ supplierId: 1, createdAt: -1 });
inventoryTransactionSchema.index({ batchNumber: 1 });
inventoryTransactionSchema.index({ expiryDate: 1 });

export default mongoose.model('InventoryTransaction', inventoryTransactionSchema);
