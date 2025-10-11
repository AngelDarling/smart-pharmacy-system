import mongoose from "mongoose";
import Product from "./Product.js";

/**
 * Cosmeceutical Schema - Schema cho sản phẩm mỹ phẩm
 * Kế thừa từ ProductBaseSchema với các trường đặc thù cho mỹ phẩm
 */
const cosmeceuticalSchema = new mongoose.Schema({
  // Loại mỹ phẩm
  cosmeticType: {
    type: String,
    required: true,
    enum: [
      'skincare',            // Chăm sóc da
      'makeup',              // Trang điểm
      'haircare',            // Chăm sóc tóc
      'bodycare',            // Chăm sóc cơ thể
      'fragrance',           // Nước hoa
      'nailcare',            // Chăm sóc móng
      'oralcare',            // Chăm sóc răng miệng
      'sunprotection',       // Chống nắng
      'anti_aging',          // Chống lão hóa
      'acne_treatment',      // Điều trị mụn
      'whitening',           // Làm trắng
      'moisturizing',        // Dưỡng ẩm
      'cleansing',           // Làm sạch
      'toning',              // Cân bằng da
      'mask',                // Mặt nạ
      'serum',               // Serum
      'essence',             // Tinh chất
      'other'                // Khác
    ]
  },
  
  // Loại da phù hợp
  skinTypes: [{
    type: String,
    enum: [
      'normal',              // Da thường
      'dry',                 // Da khô
      'oily',                // Da dầu
      'combination',         // Da hỗn hợp
      'sensitive',           // Da nhạy cảm
      'mature',              // Da trưởng thành
      'acne_prone',          // Da dễ nổi mụn
      'dehydrated',          // Da mất nước
      'all'                  // Tất cả loại da
    ]
  }],
  
  // Mối quan tâm về da
  skinConcerns: [{
    type: String,
    enum: [
      'acne',                // Mụn
      'aging',               // Lão hóa
      'dark_spots',          // Đốm nâu
      'uneven_skin_tone',    // Da không đều màu
      'dryness',             // Khô da
      'oiliness',            // Dầu da
      'sensitivity',         // Nhạy cảm
      'dullness',            // Da xỉn màu
      'large_pores',         // Lỗ chân lông to
      'fine_lines',          // Nếp nhăn
      'wrinkles',            // Nếp nhăn sâu
      'hyperpigmentation',   // Tăng sắc tố
      'dehydration',         // Mất nước
      'rough_texture',       // Da thô ráp
      'other'                // Khác
    ]
  }],
  
  // Thành phần chính
  keyIngredients: [{
    name: {
      type: String,
      required: true,
      maxlength: 200
    },
    concentration: {
      type: String,
      maxlength: 100
    },
    benefits: [{
      type: String,
      maxlength: 200
    }]
  }],
  
  // Thành phần hoạt tính
  activeIngredients: [{
    name: {
      type: String,
      required: true,
      maxlength: 200
    },
    concentration: {
      type: String,
      maxlength: 100
    },
    type: {
      type: String,
      enum: [
        'antioxidant',       // Chống oxy hóa
        'moisturizer',       // Dưỡng ẩm
        'exfoliant',         // Tẩy tế bào chết
        'anti_aging',        // Chống lão hóa
        'whitening',         // Làm trắng
        'anti_acne',         // Chống mụn
        'soothing',          // Làm dịu
        'anti_inflammatory', // Kháng viêm
        'hydrating',         // Cấp ẩm
        'firming',           // Làm săn chắc
        'brightening',       // Làm sáng
        'other'              // Khác
      ]
    },
    benefits: [{
      type: String,
      maxlength: 200
    }]
  }],
  
  // Công dụng chính
  mainBenefits: [{
    type: String,
    maxlength: 200
  }],
  
  // Cách sử dụng
  usageInstructions: {
    steps: [{
      step: {
        type: Number,
        required: true
      },
      instruction: {
        type: String,
        required: true,
        maxlength: 500
      }
    }],
    frequency: {
      type: String,
      maxlength: 100
    },
    bestTime: {
      type: String,
      enum: ['morning', 'evening', 'both', 'as_needed'],
      default: 'both'
    },
    duration: {
      type: String,
      maxlength: 100
    }
  },
  
  // Kết cấu sản phẩm
  texture: {
    type: String,
    enum: [
      'cream',               // Kem
      'lotion',              // Lotion
      'gel',                 // Gel
      'serum',               // Serum
      'essence',             // Tinh chất
      'toner',               // Nước hoa hồng
      'cleanser',            // Sữa rửa mặt
      'scrub',               // Tẩy tế bào chết
      'mask',                // Mặt nạ
      'oil',                 // Dầu
      'balm',                // Kem đặc
      'foam',                // Bọt
      'milk',                // Sữa
      'water',               // Nước
      'powder',              // Bột
      'stick',               // Thỏi
      'other'                // Khác
    ]
  },
  
  // Mùi hương
  fragrance: {
    type: {
      type: String,
      enum: ['fragrance_free', 'light', 'moderate', 'strong'],
      default: 'fragrance_free'
    },
    notes: [{
      type: String,
      maxlength: 100
    }]
  },
  
  // Thông tin an toàn
  safetyInfo: {
    hypoallergenic: {
      type: Boolean,
      default: false
    },
    nonComedogenic: {
      type: Boolean,
      default: false
    },
    dermatologicallyTested: {
      type: Boolean,
      default: false
    },
    crueltyFree: {
      type: Boolean,
      default: false
    },
    vegan: {
      type: Boolean,
      default: false
    },
    parabenFree: {
      type: Boolean,
      default: false
    },
    sulfateFree: {
      type: Boolean,
      default: false
    },
    alcoholFree: {
      type: Boolean,
      default: false
    },
    phthalateFree: {
      type: Boolean,
      default: false
    },
    mineralOilFree: {
      type: Boolean,
      default: false
    }
  },
  
  // Thông tin bảo quản
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
  
  // Thông tin pháp lý
  regulatoryInfo: {
    cosmeticLicense: {
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
    },
    approvalDate: {
      type: Date
    },
    expiryDate: {
      type: Date
    }
  },
  
  // Thông tin nhà sản xuất
  manufacturer: {
    name: {
      type: String,
      maxlength: 200
    },
    address: {
      type: String,
      maxlength: 500
    },
    country: {
      type: String,
      maxlength: 100
    },
    licenseNumber: {
      type: String,
      maxlength: 100
    }
  },
  
  // Thông tin nhập khẩu
  importInfo: {
    importer: {
      type: String,
      maxlength: 200
    },
    importLicense: {
      type: String,
      maxlength: 100
    },
    countryOfOrigin: {
      type: String,
      maxlength: 100
    }
  },
  
  // Thông tin giá
  pricing: {
    wholesalePrice: {
      type: Number,
      min: 0
    },
    retailPrice: {
      type: Number,
      min: 0
    }
  },
  
  // Thông tin khuyến mãi đặc biệt cho mỹ phẩm
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
    },
    bulkDiscount: [{
      minQuantity: {
        type: Number,
        required: true,
        min: 1
      },
      discountPercentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      }
    }],
    giftWithPurchase: {
      type: String,
      maxlength: 200
    }
  },
  
  // Thông tin bổ sung
  additionalInfo: {
    ageGroup: {
      type: String,
      enum: ['teen', 'adult', 'mature', 'all'],
      default: 'all'
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'unisex'],
      default: 'unisex'
    },
    season: {
      type: String,
      enum: ['spring', 'summer', 'autumn', 'winter', 'all'],
      default: 'all'
    },
    occasion: {
      type: String,
      enum: ['daily', 'special', 'professional', 'casual', 'all'],
      default: 'all'
    }
  }
}, {
  timestamps: true
});

// Indexes cho Cosmeceutical
cosmeceuticalSchema.index({ cosmeticType: 1, isActive: 1 });
cosmeceuticalSchema.index({ skinTypes: 1, isActive: 1 });
cosmeceuticalSchema.index({ skinConcerns: 1, isActive: 1 });
cosmeceuticalSchema.index({ texture: 1, isActive: 1 });
cosmeceuticalSchema.index({ 'safetyInfo.hypoallergenic': 1 });
cosmeceuticalSchema.index({ 'safetyInfo.nonComedogenic': 1 });
cosmeceuticalSchema.index({ 'safetyInfo.crueltyFree': 1 });
cosmeceuticalSchema.index({ 'safetyInfo.vegan': 1 });
cosmeceuticalSchema.index({ 'regulatoryInfo.vietnamApproved': 1 });
cosmeceuticalSchema.index({ 'additionalInfo.ageGroup': 1 });
cosmeceuticalSchema.index({ 'additionalInfo.gender': 1 });

// Static method để tìm kiếm mỹ phẩm theo loại da
cosmeceuticalSchema.statics.searchBySkinType = function(skinType, options = {}) {
  const {
    isActive = true,
    limit = 20,
    skip = 0,
    sort = { name: 1 }
  } = options;

  return this.find({
    $or: [
      { skinTypes: skinType },
      { skinTypes: 'all' }
    ],
    isActive
  })
  .populate('categoryId', 'name slug')
  .populate('brandId', 'name slug logoUrl')
  .sort(sort)
  .limit(limit)
  .skip(skip);
};

// Static method để tìm kiếm mỹ phẩm theo mối quan tâm về da
cosmeceuticalSchema.statics.searchBySkinConcern = function(skinConcern, options = {}) {
  const {
    isActive = true,
    limit = 20,
    skip = 0,
    sort = { name: 1 }
  } = options;

  return this.find({
    skinConcerns: skinConcern,
    isActive
  })
  .populate('categoryId', 'name slug')
  .populate('brandId', 'name slug logoUrl')
  .sort(sort)
  .limit(limit)
  .skip(skip);
};

// Static method để lấy mỹ phẩm theo loại
cosmeceuticalSchema.statics.getByCosmeticType = function(cosmeticType, options = {}) {
  const {
    isActive = true,
    limit = 20,
    skip = 0,
    sort = { name: 1 }
  } = options;

  return this.find({
    cosmeticType,
    isActive
  })
  .populate('categoryId', 'name slug')
  .populate('brandId', 'name slug logoUrl')
  .sort(sort)
  .limit(limit)
  .skip(skip);
};

// Static method để lấy mỹ phẩm an toàn
cosmeceuticalSchema.statics.getSafeProducts = function(options = {}) {
  const {
    isActive = true,
    limit = 20,
    skip = 0,
    sort = { name: 1 }
  } = options;

  return this.find({
    'safetyInfo.hypoallergenic': true,
    'safetyInfo.dermatologicallyTested': true,
    isActive
  })
  .populate('categoryId', 'name slug')
  .populate('brandId', 'name slug logoUrl')
  .sort(sort)
  .limit(limit)
  .skip(skip);
};

// Method để thêm thành phần chính
cosmeceuticalSchema.methods.addKeyIngredient = function(ingredientData) {
  this.keyIngredients.push(ingredientData);
  return this.save();
};

// Method để thêm thành phần hoạt tính
cosmeceuticalSchema.methods.addActiveIngredient = function(ingredientData) {
  this.activeIngredients.push(ingredientData);
  return this.save();
};

// Method để cập nhật thành phần
cosmeceuticalSchema.methods.updateIngredient = function(ingredientId, updateData, type = 'key') {
  const ingredients = type === 'key' ? this.keyIngredients : this.activeIngredients;
  const ingredient = ingredients.id(ingredientId);
  if (ingredient) {
    Object.assign(ingredient, updateData);
    return this.save();
  }
  throw new Error('Ingredient not found');
};

// Method để xóa thành phần
cosmeceuticalSchema.methods.removeIngredient = function(ingredientId, type = 'key') {
  if (type === 'key') {
    this.keyIngredients.pull(ingredientId);
  } else {
    this.activeIngredients.pull(ingredientId);
  }
  return this.save();
};

// Tạo discriminator
const Cosmeceutical = Product.discriminator('Cosmeceutical', cosmeceuticalSchema);

export default Cosmeceutical;
