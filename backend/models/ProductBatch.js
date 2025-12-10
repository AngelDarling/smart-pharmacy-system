import mongoose from "mongoose";

/**
 * Product Batch Schema
 * Quản lý tồn kho theo từng lô hàng nhập
 * Mỗi lô có số lô chung (từ phiếu nhập), nhưng mỗi sản phẩm có HSD riêng
 */
const productBatchSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  batchNumber: {
    type: String,
    required: true,
    maxlength: 100,
    index: true
  },
  goodsReceiptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GoodsReceipt',
    required: true
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  remainingQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  unitCost: {
    type: Number,
    required: true,
    min: 0
  },
  importDate: {
    type: Date,
    required: true,
    index: true
  },
  expiryDate: {
    type: Date,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'depleted', 'expired'],
    default: 'active',
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  note: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Middleware để tự động cập nhật status
productBatchSchema.pre('save', function(next) {
  // Kiểm tra hết hàng
  if (this.remainingQuantity <= 0) {
    this.status = 'depleted';
  }
  // Kiểm tra hết hạn
  else if (this.expiryDate && this.expiryDate < new Date()) {
    this.status = 'expired';
  }
  // Còn hàng và chưa hết hạn
  else {
    this.status = 'active';
  }
  
  next();
});

// Virtual để tính số ngày còn lại đến hết hạn
productBatchSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.expiryDate) return null;
  const now = new Date();
  const diffTime = this.expiryDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual để tính % còn lại
productBatchSchema.virtual('remainingPercentage').get(function() {
  if (this.quantity === 0) return 0;
  return Math.round((this.remainingQuantity / this.quantity) * 100);
});

// Indexes
productBatchSchema.index({ productId: 1, batchNumber: 1 });
productBatchSchema.index({ productId: 1, status: 1 });
productBatchSchema.index({ expiryDate: 1, status: 1 });
productBatchSchema.index({ importDate: -1 });
productBatchSchema.index({ goodsReceiptId: 1 });

export default mongoose.model('ProductBatch', productBatchSchema);
