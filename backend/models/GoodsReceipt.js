import mongoose from "mongoose";

/**
 * Goods Receipt Schema
 * Phiếu nhập hàng từ nhà cung cấp
 */
const goodsReceiptSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    maxlength: 50
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitCost: {
      type: Number,
      required: true,
      min: 0
    },
    totalCost: {
      type: Number,
      required: true,
      min: 0
    },
    batchNumber: {
      type: String,
      maxlength: 100
    },
    expiryDate: {
      type: Date
    },
    receivedQuantity: {
      type: Number,
      default: 0,
      min: 0
    },
    damagedQuantity: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'partial', 'completed', 'cancelled'],
      default: 'pending'
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  finalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'partial', 'completed', 'cancelled'],
    default: 'draft'
  },
  receivedDate: {
    type: Date
  },
  expectedDate: {
    type: Date
  },
  note: {
    type: String,
    maxlength: 1000
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  // Thông tin thanh toán
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partial', 'paid'],
    default: 'unpaid'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'credit', 'check'],
    default: 'bank_transfer'
  },
  paymentDate: {
    type: Date
  },
  paymentNote: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual để tính totalAmount tự động
goodsReceiptSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.totalAmount = this.items.reduce((total, item) => {
      return total + (item.unitCost * item.quantity);
    }, 0);
    
    this.finalAmount = this.totalAmount - (this.discount || 0) + (this.tax || 0);
  }
  next();
});

// Virtual để tính số lượng items
goodsReceiptSchema.virtual('itemCount').get(function() {
  return this.items ? this.items.length : 0;
});

// Virtual để tính tổng số lượng
goodsReceiptSchema.virtual('totalQuantity').get(function() {
  return this.items ? this.items.reduce((total, item) => total + item.quantity, 0) : 0;
});

// Indexes
goodsReceiptSchema.index({ code: 1 }, { unique: true });
goodsReceiptSchema.index({ supplierId: 1, createdAt: -1 });
goodsReceiptSchema.index({ status: 1, createdAt: -1 });
goodsReceiptSchema.index({ createdBy: 1, createdAt: -1 });
goodsReceiptSchema.index({ receivedDate: 1 });
goodsReceiptSchema.index({ expectedDate: 1 });

export default mongoose.model('GoodsReceipt', goodsReceiptSchema);
