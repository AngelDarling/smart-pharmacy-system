import mongoose from "mongoose";

/**
 * Variant Schema - Schema nhúng để quản lý các biến thể sản phẩm
 */
const variantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  sku: {
    type: String,
    required: true,
    sparse: true,
    maxlength: 100
  },
  barcode: {
    type: String,
    sparse: true,
    maxlength: 50
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  compareAtPrice: {
    type: Number,
    min: 0
  },
  costPrice: {
    type: Number,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    maxlength: 50
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  weight: {
    value: {
      type: Number,
      min: 0
    },
    unit: {
      type: String,
      enum: ['mg', 'g', 'kg', 'ml', 'l', 'piece', 'box', 'bottle', 'tube', 'pack'],
      default: 'g'
    }
  },
  dimensions: {
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 },
    unit: {
      type: String,
      enum: ['mm', 'cm', 'm'],
      default: 'cm'
    }
  },
  stockOnHand: {
    type: Number,
    default: 0,
    min: 0
  },
  stockReserved: {
    type: Number,
    default: 0,
    min: 0
  },
  minStockLevel: {
    type: Number,
    default: 0,
    min: 0
  },
  maxStockLevel: {
    type: Number,
    default: 1000,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  attributes: [{
    attributeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attribute',
      required: true
    },
    value: {
      type: String,
      required: true,
      maxlength: 200
    },
    displayValue: {
      type: String,
      maxlength: 200
    }
  }],
  imageUrls: [{
    type: String,
    maxlength: 500
  }],
  storage: {
    temperature: {
      type: String,
      maxlength: 100
    },
    humidity: {
      type: String,
      maxlength: 100
    },
    light: {
      type: String,
      maxlength: 100
    },
    other: {
      type: String,
      maxlength: 200
    }
  },
  expiryDate: {
    type: Date
  },
  importInfo: {
    batchNumber: {
      type: String,
      maxlength: 100
    },
    importDate: {
      type: Date
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier'
    }
  }
}, { _id: true });

/**
 * Product Base Schema - Schema cơ sở cho tất cả sản phẩm
 */
const productBaseSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true,
      maxlength: 300
    },
    slug: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true,
      maxlength: 350
    },
    description: {
      type: String,
      maxlength: 2000
    },
    shortDescription: {
      type: String,
      maxlength: 500
    },
    categoryId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Category", 
      required: true 
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true
    },
    imageUrls: { 
      type: [String], 
      default: [],
      validate: {
        validator: function(v) {
          return v.length <= 10;
        },
        message: 'Maximum 10 images allowed'
      }
    },
    thumbnailUrl: {
      type: String,
      maxlength: 500
    },
    sku: { 
      type: String, 
      sparse: true,
      maxlength: 100
    },
    barcode: { 
      type: String, 
      sparse: true,
      maxlength: 50
    },
    price: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    compareAtPrice: { 
      type: Number, 
      min: 0 
    },
    costPrice: {
      type: Number,
      min: 0
    },
    unit: { 
      type: String, 
      default: "hộp",
      maxlength: 50
    },
    totalStock: {
      type: Number,
      default: 0,
      min: 0
    },
    variants: [variantSchema],
    activeSubstances: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ActiveSubstance'
    }],
    attributes: [{
      attributeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Attribute',
        required: true
      },
      value: {
        type: String,
        required: true,
        maxlength: 200
      },
      displayValue: {
        type: String,
        maxlength: 200
      }
    }],
    usage: { 
      type: String,
      maxlength: 1000
    },
    dosage: { 
      type: String,
      maxlength: 500
    },
    ingredients: { 
      type: String,
      maxlength: 2000
    },
    contraindications: { 
      type: String,
      maxlength: 1000
    },
    sideEffects: {
      type: String,
      maxlength: 1000
    },
    warnings: {
      type: String,
      maxlength: 1000
    },
    storage: { 
      type: String,
      maxlength: 500
    },
    regulatoryInfo: {
      registrationNumber: {
        type: String,
        maxlength: 100
      },
      manufacturer: {
        type: String,
        maxlength: 200
      },
      countryOfOrigin: {
        type: String,
        maxlength: 100
      },
      fdaApproved: {
        type: Boolean,
        default: false
      },
      vietnamApproved: {
        type: Boolean,
        default: false
      }
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
    isActive: { 
      type: Boolean, 
      default: true 
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isNewProduct: {
      type: Boolean,
      default: false
    },
    isBestSeller: {
      type: Boolean,
      default: false
    },
    viewCount: {
      type: Number,
      default: 0
    },
    purchaseCount: {
      type: Number,
      default: 0
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    tags: [{
      type: String,
      maxlength: 50
    }],
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier'
    },
    promotionInfo: {
      isOnSale: {
        type: Boolean,
        default: false
      },
      salePrice: {
        type: Number,
        min: 0
      },
      saleStartDate: {
        type: Date
      },
      saleEndDate: {
        type: Date
      },
      discountPercentage: {
        type: Number,
        min: 0,
        max: 100
      }
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual để lấy variant mặc định
productBaseSchema.virtual('defaultVariant').get(function() {
  return this.variants.find(v => v.isActive) || this.variants[0];
});

// Virtual để lấy giá thấp nhất
productBaseSchema.virtual('minPrice').get(function() {
  if (this.variants.length === 0) return this.price;
  return Math.min(...this.variants.filter(v => v.isActive).map(v => v.price));
});

// Virtual để lấy giá cao nhất
productBaseSchema.virtual('maxPrice').get(function() {
  if (this.variants.length === 0) return this.price;
  return Math.max(...this.variants.filter(v => v.isActive).map(v => v.price));
});

// Virtual để kiểm tra còn hàng
productBaseSchema.virtual('inStock').get(function() {
  return this.totalStock > 0 || this.variants.some(v => v.stockOnHand > 0);
});

// Virtual để lấy productType từ categoryId
productBaseSchema.virtual('productType').get(function() {
  // This will be populated by the controller when needed
  return this._productType;
});

// Middleware để tự động cập nhật totalStock
productBaseSchema.pre('save', function(next) {
  if (this.isModified('variants')) {
    this.totalStock = this.variants.reduce((total, variant) => {
      return total + (variant.isActive ? variant.stockOnHand : 0);
    }, 0);
  }
  next();
});

// Indexes
productBaseSchema.index({ slug: 1 }, { unique: true });
productBaseSchema.index({ categoryId: 1, isActive: 1 });
productBaseSchema.index({ brandId: 1, isActive: 1 });
// productType index removed - will use categoryId instead
productBaseSchema.index({ price: 1 });
productBaseSchema.index({ totalStock: 1 });
productBaseSchema.index({ isFeatured: 1, isActive: 1 });
productBaseSchema.index({ isNewProduct: 1, isActive: 1 });
productBaseSchema.index({ isBestSeller: 1, isActive: 1 });
productBaseSchema.index({ 'rating.average': -1 });
productBaseSchema.index({ viewCount: -1 });
productBaseSchema.index({ purchaseCount: -1 });
productBaseSchema.index({ createdAt: -1 });
productBaseSchema.index({ 'promotionInfo.isOnSale': 1, 'promotionInfo.saleEndDate': 1 });
productBaseSchema.index({ 
  name: "text", 
  description: "text", 
  shortDescription: "text",
  ingredients: "text",
  usage: "text",
  tags: "text",
  seoTitle: "text",
  seoDescription: "text"
}, { 
  weights: { 
    name: 10, 
    seoTitle: 8, 
    shortDescription: 6, 
    description: 5, 
    ingredients: 4, 
    usage: 3, 
    tags: 2, 
    seoDescription: 1 
  },
  default_language: "none"
});

// Tạo model cơ sở
const Product = mongoose.model('Product', productBaseSchema);

export default Product;
