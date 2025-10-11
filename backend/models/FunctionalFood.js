import mongoose from "mongoose";
import Product from "./Product.js";

/**
 * FunctionalFood Schema - Schema cho sản phẩm thực phẩm chức năng
 * Kế thừa từ ProductBaseSchema với các trường đặc thù cho thực phẩm chức năng
 */
const functionalFoodSchema = new mongoose.Schema({
  // Loại thực phẩm chức năng
  foodType: {
    type: String,
    required: true,
    enum: [
      'vitamin',             // Vitamin
      'mineral',             // Khoáng chất
      'protein',             // Protein
      'omega3',              // Omega-3
      'probiotic',           // Probiotic
      'prebiotic',           // Prebiotic
      'antioxidant',         // Chống oxy hóa
      'immune_support',      // Hỗ trợ miễn dịch
      'digestive_support',   // Hỗ trợ tiêu hóa
      'heart_health',        // Sức khỏe tim mạch
      'bone_health',         // Sức khỏe xương
      'brain_health',        // Sức khỏe não bộ
      'eye_health',          // Sức khỏe mắt
      'skin_health',         // Sức khỏe da
      'hair_health',         // Sức khỏe tóc
      'weight_management',   // Quản lý cân nặng
      'energy_boost',        // Tăng cường năng lượng
      'sleep_support',       // Hỗ trợ giấc ngủ
      'stress_relief',       // Giảm căng thẳng
      'detox',               // Thanh lọc cơ thể
      'other'                // Khác
    ]
  },
  
  // Dạng sản phẩm
  productForm: {
    type: String,
    required: true,
    enum: [
      'tablet',              // Viên nén
      'capsule',             // Viên nang
      'softgel',             // Viên nang mềm
      'powder',              // Bột
      'liquid',              // Dạng lỏng
      'gummy',               // Kẹo dẻo
      'chewable',            // Nhai được
      'effervescent',        // Sủi bọt
      'syrup',               // Siro
      'drops',               // Giọt
      'spray',               // Xịt
      'bar',                 // Thanh
      'drink',               // Đồ uống
      'other'                // Khác
    ]
  },
  
  // Thành phần chính
  mainIngredients: [{
    name: {
      type: String,
      required: true,
      maxlength: 200
    },
    concentration: {
      type: String,
      maxlength: 100
    },
    unit: {
      type: String,
      enum: ['mg', 'g', 'mcg', 'IU', 'ml', '%', 'other'],
      default: 'mg'
    },
    benefits: [{
      type: String,
      maxlength: 200
    }]
  }],
  
  // Vitamin và khoáng chất
  vitamins: [{
    name: {
      type: String,
      required: true,
      maxlength: 100
    },
    amount: {
      type: String,
      required: true,
      maxlength: 50
    },
    unit: {
      type: String,
      enum: ['mg', 'mcg', 'IU', 'g'],
      default: 'mg'
    },
    dailyValue: {
      type: String,
      maxlength: 50
    }
  }],
  
  minerals: [{
    name: {
      type: String,
      required: true,
      maxlength: 100
    },
    amount: {
      type: String,
      required: true,
      maxlength: 50
    },
    unit: {
      type: String,
      enum: ['mg', 'mcg', 'g'],
      default: 'mg'
    },
    dailyValue: {
      type: String,
      maxlength: 50
    }
  }],
  
  // Công dụng chính
  mainBenefits: [{
    type: String,
    maxlength: 200
  }],
  
  // Chỉ định sử dụng
  indications: [{
    type: String,
    maxlength: 200
  }],
  
  // Chống chỉ định
  contraindications: [{
    type: String,
    maxlength: 200
  }],
  
  // Cách sử dụng
  usageInstructions: {
    dosage: {
      type: String,
      required: true,
      maxlength: 200
    },
    frequency: {
      type: String,
      required: true,
      maxlength: 100
    },
    timing: {
      type: String,
      enum: ['morning', 'evening', 'with_meals', 'empty_stomach', 'as_needed'],
      default: 'with_meals'
    },
    duration: {
      type: String,
      maxlength: 100
    },
    precautions: [{
      type: String,
      maxlength: 200
    }]
  },
  
  // Thông tin dinh dưỡng
  nutritionalInfo: {
    calories: {
      type: Number,
      min: 0
    },
    protein: {
      type: Number,
      min: 0
    },
    carbohydrates: {
      type: Number,
      min: 0
    },
    fat: {
      type: Number,
      min: 0
    },
    fiber: {
      type: Number,
      min: 0
    },
    sugar: {
      type: Number,
      min: 0
    },
    sodium: {
      type: Number,
      min: 0
    },
    other: [{
      name: { type: String, maxlength: 100 },
      amount: { type: String, maxlength: 50 },
      unit: { type: String, maxlength: 20 }
    }]
  },
  
  // Thông tin an toàn
  safetyInfo: {
    allergenFree: {
      type: Boolean,
      default: false
    },
    glutenFree: {
      type: Boolean,
      default: false
    },
    dairyFree: {
      type: Boolean,
      default: false
    },
    soyFree: {
      type: Boolean,
      default: false
    },
    nutFree: {
      type: Boolean,
      default: false
    },
    nonGMO: {
      type: Boolean,
      default: false
    },
    organic: {
      type: Boolean,
      default: false
    },
    vegan: {
      type: Boolean,
      default: false
    },
    vegetarian: {
      type: Boolean,
      default: false
    },
    kosher: {
      type: Boolean,
      default: false
    },
    halal: {
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
    foodLicense: {
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
    },
    healthClaim: {
      type: String,
      maxlength: 500
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
    },
    contactInfo: {
      phone: { type: String, maxlength: 20 },
      email: { type: String, maxlength: 100 },
      website: { type: String, maxlength: 200 }
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
    },
    distributor: {
      type: String,
      maxlength: 200
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
  
  // Thông tin khuyến mãi đặc biệt cho thực phẩm chức năng
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
      enum: ['children', 'adult', 'elderly', 'all'],
      default: 'all'
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'unisex'],
      default: 'unisex'
    },
    lifestyle: {
      type: String,
      enum: ['active', 'sedentary', 'athletic', 'all'],
      default: 'all'
    },
    healthCondition: [{
      type: String,
      maxlength: 100
    }]
  }
}, {
  timestamps: true
});

// Indexes cho FunctionalFood
functionalFoodSchema.index({ foodType: 1, isActive: 1 });
functionalFoodSchema.index({ productForm: 1, isActive: 1 });
functionalFoodSchema.index({ 'safetyInfo.allergenFree': 1 });
functionalFoodSchema.index({ 'safetyInfo.glutenFree': 1 });
functionalFoodSchema.index({ 'safetyInfo.vegan': 1 });
functionalFoodSchema.index({ 'safetyInfo.vegetarian': 1 });
functionalFoodSchema.index({ 'safetyInfo.organic': 1 });
functionalFoodSchema.index({ 'regulatoryInfo.vietnamApproved': 1 });
functionalFoodSchema.index({ 'additionalInfo.ageGroup': 1 });
functionalFoodSchema.index({ 'additionalInfo.gender': 1 });
functionalFoodSchema.index({ 'additionalInfo.lifestyle': 1 });

// Static method để tìm kiếm thực phẩm chức năng theo loại
functionalFoodSchema.statics.searchByFoodType = function(foodType, options = {}) {
  const {
    isActive = true,
    limit = 20,
    skip = 0,
    sort = { name: 1 }
  } = options;

  return this.find({
    foodType,
    isActive
  })
  .populate('categoryId', 'name slug')
  .populate('brandId', 'name slug logoUrl')
  .sort(sort)
  .limit(limit)
  .skip(skip);
};

// Static method để tìm kiếm thực phẩm chức năng theo dạng sản phẩm
functionalFoodSchema.statics.searchByProductForm = function(productForm, options = {}) {
  const {
    isActive = true,
    limit = 20,
    skip = 0,
    sort = { name: 1 }
  } = options;

  return this.find({
    productForm,
    isActive
  })
  .populate('categoryId', 'name slug')
  .populate('brandId', 'name slug logoUrl')
  .sort(sort)
  .limit(limit)
  .skip(skip);
};

// Static method để lấy thực phẩm chức năng an toàn
functionalFoodSchema.statics.getSafeProducts = function(options = {}) {
  const {
    isActive = true,
    limit = 20,
    skip = 0,
    sort = { name: 1 }
  } = options;

  return this.find({
    'safetyInfo.allergenFree': true,
    'safetyInfo.nonGMO': true,
    isActive
  })
  .populate('categoryId', 'name slug')
  .populate('brandId', 'name slug logoUrl')
  .sort(sort)
  .limit(limit)
  .skip(skip);
};

// Static method để lấy thực phẩm chức năng theo độ tuổi
functionalFoodSchema.statics.getByAgeGroup = function(ageGroup, options = {}) {
  const {
    isActive = true,
    limit = 20,
    skip = 0,
    sort = { name: 1 }
  } = options;

  return this.find({
    $or: [
      { 'additionalInfo.ageGroup': ageGroup },
      { 'additionalInfo.ageGroup': 'all' }
    ],
    isActive
  })
  .populate('categoryId', 'name slug')
  .populate('brandId', 'name slug logoUrl')
  .sort(sort)
  .limit(limit)
  .skip(skip);
};

// Method để thêm thành phần chính
functionalFoodSchema.methods.addMainIngredient = function(ingredientData) {
  this.mainIngredients.push(ingredientData);
  return this.save();
};

// Method để thêm vitamin
functionalFoodSchema.methods.addVitamin = function(vitaminData) {
  this.vitamins.push(vitaminData);
  return this.save();
};

// Method để thêm khoáng chất
functionalFoodSchema.methods.addMineral = function(mineralData) {
  this.minerals.push(mineralData);
  return this.save();
};

// Method để cập nhật thành phần
functionalFoodSchema.methods.updateIngredient = function(ingredientId, updateData, type = 'main') {
  let ingredients;
  switch (type) {
    case 'main':
      ingredients = this.mainIngredients;
      break;
    case 'vitamin':
      ingredients = this.vitamins;
      break;
    case 'mineral':
      ingredients = this.minerals;
      break;
    default:
      throw new Error('Invalid ingredient type');
  }
  
  const ingredient = ingredients.id(ingredientId);
  if (ingredient) {
    Object.assign(ingredient, updateData);
    return this.save();
  }
  throw new Error('Ingredient not found');
};

// Method để xóa thành phần
functionalFoodSchema.methods.removeIngredient = function(ingredientId, type = 'main') {
  switch (type) {
    case 'main':
      this.mainIngredients.pull(ingredientId);
      break;
    case 'vitamin':
      this.vitamins.pull(ingredientId);
      break;
    case 'mineral':
      this.minerals.pull(ingredientId);
      break;
    default:
      throw new Error('Invalid ingredient type');
  }
  return this.save();
};

// Tạo discriminator
const FunctionalFood = Product.discriminator('FunctionalFood', functionalFoodSchema);

export default FunctionalFood;
