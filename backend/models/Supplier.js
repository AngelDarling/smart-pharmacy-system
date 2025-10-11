import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      maxlength: 20
    },
    name: { 
      type: String, 
      required: true, 
      trim: true,
      maxlength: 200
    },
    companyName: {
      type: String,
      trim: true,
      maxlength: 200
    },
    taxCode: {
      type: String,
      trim: true,
      maxlength: 20
    },
    email: { 
      type: String, 
      trim: true,
      maxlength: 100
    },
    phone: { 
      type: String, 
      trim: true,
      maxlength: 20
    },
    address: { 
      type: String, 
      trim: true,
      maxlength: 500
    },
    city: {
      type: String,
      trim: true,
      maxlength: 100
    },
    district: {
      type: String,
      trim: true,
      maxlength: 100
    },
    contactPerson: {
      name: {
        type: String,
        trim: true,
        maxlength: 100
      },
      position: {
        type: String,
        trim: true,
        maxlength: 100
      },
      phone: {
        type: String,
        trim: true,
        maxlength: 20
      },
      email: {
        type: String,
        trim: true,
        maxlength: 100
      }
    },
    // Thông tin thanh toán
    paymentTerms: {
      type: String,
      enum: ['cash', 'net_15', 'net_30', 'net_45', 'net_60'],
      default: 'net_30'
    },
    creditLimit: {
      type: Number,
      default: 0,
      min: 0
    },
    currentDebt: {
      type: Number,
      default: 0,
      min: 0
    },
    // Thông tin giao hàng
    deliveryTime: {
      type: Number,
      default: 7, // days
      min: 0
    },
    minimumOrder: {
      type: Number,
      default: 0,
      min: 0
    },
    // Phân loại nhà cung cấp
    category: {
      type: String,
      enum: ['pharmaceutical', 'cosmetic', 'medical_device', 'supplement', 'other'],
      default: 'pharmaceutical'
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    // Trạng thái
    isActive: { 
      type: Boolean, 
      default: true 
    },
    isPreferred: {
      type: Boolean,
      default: false
    },
    // Thông tin bổ sung
    website: {
      type: String,
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual để tính available credit
supplierSchema.virtual('availableCredit').get(function() {
  return Math.max(0, this.creditLimit - this.currentDebt);
});

// Indexes
supplierSchema.index({ code: 1 }, { unique: true });
supplierSchema.index({ name: 1 });
supplierSchema.index({ category: 1, isActive: 1 });
supplierSchema.index({ isPreferred: 1, isActive: 1 });
supplierSchema.index({ taxCode: 1 });

export default mongoose.model("Supplier", supplierSchema);


