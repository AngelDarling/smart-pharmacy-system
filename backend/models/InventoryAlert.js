import mongoose from "mongoose";

/**
 * Inventory Alert Schema
 * Cảnh báo tồn kho (hết hàng, sắp hết hạn, tồn kho cao)
 */
const inventoryAlertSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  type: {
    type: String,
    enum: ['low_stock', 'out_of_stock', 'expiring_soon', 'expired', 'overstock', 'slow_moving'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  currentStock: {
    type: Number,
    required: true
  },
  thresholdValue: {
    type: Number,
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  },
  resolvedNote: {
    type: String,
    maxlength: 500
  },
  // Thông tin bổ sung
  expiryDate: {
    type: Date
  },
  lastSaleDate: {
    type: Date
  },
  daysSinceLastSale: {
    type: Number
  },
  suggestedAction: {
    type: String,
    enum: ['reorder', 'discount', 'return_to_supplier', 'dispose', 'transfer', 'none'],
    default: 'none'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
inventoryAlertSchema.index({ productId: 1, type: 1, isResolved: 1 });
inventoryAlertSchema.index({ type: 1, severity: 1, isRead: 1 });
inventoryAlertSchema.index({ createdAt: -1 });
inventoryAlertSchema.index({ expiryDate: 1 });

export default mongoose.model('InventoryAlert', inventoryAlertSchema);
