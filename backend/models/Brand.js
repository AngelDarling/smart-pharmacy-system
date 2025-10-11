import mongoose from "mongoose";

/**
 * Brand Schema - Quản lý thông tin thương hiệu
 */
const brandSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true,
      maxlength: 100
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 150
    },
    description: {
      type: String,
      maxlength: 1000
    },
    logoUrl: {
      type: String,
      default: ""
    },
    website: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Website must be a valid URL'
      }
    },
    country: {
      type: String,
      maxlength: 100
    },
    foundedYear: {
      type: Number,
      min: 1800,
      max: new Date().getFullYear()
    },
    contactInfo: {
      email: {
        type: String,
        validate: {
          validator: function(v) {
            return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
          },
          message: 'Email must be valid'
        }
      },
      phone: {
        type: String,
        maxlength: 20
      },
      address: {
        type: String,
        maxlength: 500
      }
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    sortOrder: {
      type: Number,
      default: 0
    },
    seoTitle: {
      type: String,
      maxlength: 200
    },
    seoDescription: {
      type: String,
      maxlength: 300
    },
    seoKeywords: [{
      type: String,
      maxlength: 50
    }],
    productCount: {
      type: Number,
      default: 0
    },
    totalSales: {
      type: Number,
      default: 0
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual để lấy products
brandSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'brandId'
});

// Middleware để tự động cập nhật productCount
brandSchema.pre('save', function(next) {
  if (this.isNew) {
    this.productCount = 0;
    this.totalSales = 0;
  }
  next();
});

// Indexes
brandSchema.index({ slug: 1 }, { unique: true });
brandSchema.index({ name: 1 }, { unique: true });
brandSchema.index({ isActive: 1, sortOrder: 1, name: 1 });
brandSchema.index({ country: 1, isActive: 1 });
brandSchema.index({ 
  name: "text", 
  description: "text",
  seoTitle: "text",
  seoDescription: "text"
}, { 
  weights: { 
    name: 10, 
    seoTitle: 8, 
    description: 5, 
    seoDescription: 3 
  },
  default_language: "none"
});

export default mongoose.model("Brand", brandSchema);
