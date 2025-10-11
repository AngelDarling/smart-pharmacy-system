import mongoose from "mongoose";
import Product from "./Product.js";

/**
 * Drug Schema - Schema cho sản phẩm thuốc
 * Kế thừa từ ProductBaseSchema với các trường đặc thù cho thuốc
 */
const drugSchema = new mongoose.Schema({
  // Thông tin dược lý
  pharmacologicalClass: {
    type: String,
    required: true,
    enum: [
      'analgesic',           // Giảm đau
      'antipyretic',         // Hạ sốt
      'anti_inflammatory',   // Kháng viêm
      'antibiotic',          // Kháng sinh
      'antiviral',           // Kháng virus
      'antifungal',          // Kháng nấm
      'antihistamine',       // Kháng histamine
      'bronchodilator',      // Giãn phế quản
      'vasodilator',         // Giãn mạch
      'diuretic',            // Lợi tiểu
      'anticoagulant',       // Chống đông máu
      'antihypertensive',    // Hạ huyết áp
      'hypoglycemic',        // Hạ đường huyết
      'antidepressant',      // Chống trầm cảm
      'anxiolytic',          // Chống lo âu
      'sedative',            // An thần
      'stimulant',           // Kích thích
      'vitamin',             // Vitamin
      'mineral',             // Khoáng chất
      'hormone',             // Hormone
      'enzyme',              // Enzyme
      'probiotic',           // Probiotic
      'other'                // Khác
    ]
  },
  
  // Dạng bào chế
  dosageForm: {
    type: String,
    required: true,
    enum: [
      'tablet',              // Viên nén
      'capsule',             // Viên nang
      'syrup',               // Siro
      'injection',           // Tiêm
      'drops',               // Giọt
      'spray',               // Xịt
      'cream',               // Kem
      'ointment',            // Thuốc mỡ
      'gel',                 // Gel
      'lotion',              // Lotion
      'powder',              // Bột
      'suppository',         // Viên đặt
      'patch',               // Miếng dán
      'inhaler',             // Ống hít
      'solution',            // Dung dịch
      'suspension',          // Huyền phù
      'emulsion',            // Nhũ tương
      'other'                // Khác
    ]
  },
  
  // Hàm lượng hoạt chất
  activeSubstanceContent: [{
    substanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ActiveSubstance',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 100
    },
    unit: {
      type: String,
      required: true,
      enum: ['mg', 'g', 'ml', 'IU', 'mcg', '%', 'other'],
      default: 'mg'
    }
  }],
  
  // Chỉ định điều trị
  therapeuticIndications: [{
    type: String,
    maxlength: 200
  }],
  
  // Chống chỉ định
  contraindications: [{
    type: String,
    maxlength: 200
  }],
  
  // Tác dụng phụ
  adverseEffects: [{
    type: String,
    maxlength: 200
  }],
  
  // Tương tác thuốc
  drugInteractions: [{
    drugName: {
      type: String,
      maxlength: 200
    },
    interaction: {
      type: String,
      enum: ['major', 'moderate', 'minor'],
      default: 'minor'
    },
    description: {
      type: String,
      maxlength: 500
    }
  }],
  
  // Liều dùng
  dosage: {
    adult: {
      type: String,
      maxlength: 300
    },
    pediatric: {
      type: String,
      maxlength: 300
    },
    elderly: {
      type: String,
      maxlength: 300
    },
    renalImpairment: {
      type: String,
      maxlength: 300
    },
    hepaticImpairment: {
      type: String,
      maxlength: 300
    }
  },
  
  // Cách dùng
  administration: {
    route: {
      type: String,
      enum: ['oral', 'topical', 'injection', 'inhalation', 'rectal', 'vaginal', 'other'],
      required: true
    },
    method: {
      type: String,
      maxlength: 200
    },
    frequency: {
      type: String,
      maxlength: 100
    },
    duration: {
      type: String,
      maxlength: 100
    }
  },
  
  // Thông tin dược động học
  pharmacokinetics: {
    absorption: {
      type: String,
      maxlength: 500
    },
    distribution: {
      type: String,
      maxlength: 500
    },
    metabolism: {
      type: String,
      maxlength: 500
    },
    elimination: {
      type: String,
      maxlength: 500
    },
    halfLife: {
      type: String,
      maxlength: 100
    }
  },
  
  // Cảnh báo đặc biệt
  warnings: [{
    type: String,
    maxlength: 500
  }],
  
  // Thông tin pháp lý
  regulatoryInfo: {
    registrationNumber: {
      type: String,
      maxlength: 100
    },
    licenseNumber: {
      type: String,
      maxlength: 100
    },
    fdaApproved: {
      type: Boolean,
      default: false
    },
    emaApproved: {
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
    prescriptionRequired: {
      type: Boolean,
      default: false
    },
    controlledSubstance: {
      type: Boolean,
      default: false
    },
    controlledSubstanceClass: {
      type: String,
      enum: ['I', 'II', 'III', 'IV', 'V', 'none'],
      default: 'none'
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
    },
    insuranceCoverage: {
      type: Boolean,
      default: false
    },
    insuranceCode: {
      type: String,
      maxlength: 50
    }
  },
  
  // Thông tin khuyến mãi đặc biệt cho thuốc
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
    }]
  },
  
  // Thông tin bổ sung
  additionalInfo: {
    pregnancyCategory: {
      type: String,
      enum: ['A', 'B', 'C', 'D', 'X', 'unknown'],
      default: 'unknown'
    },
    lactationCategory: {
      type: String,
      enum: ['safe', 'caution', 'avoid', 'unknown'],
      default: 'unknown'
    },
    pediatricUse: {
      type: String,
      maxlength: 200
    },
    geriatricUse: {
      type: String,
      maxlength: 200
    }
  }
}, {
  timestamps: true
});

// Indexes cho Drug
drugSchema.index({ pharmacologicalClass: 1, isActive: 1 });
drugSchema.index({ dosageForm: 1, isActive: 1 });
drugSchema.index({ 'activeSubstanceContent.substanceId': 1 });
drugSchema.index({ 'regulatoryInfo.prescriptionRequired': 1 });
drugSchema.index({ 'regulatoryInfo.controlledSubstance': 1 });
drugSchema.index({ 'regulatoryInfo.vietnamApproved': 1 });
drugSchema.index({ 'pricing.insuranceCoverage': 1 });
drugSchema.index({ 'additionalInfo.pregnancyCategory': 1 });

// Static method để tìm kiếm thuốc theo hoạt chất
drugSchema.statics.searchByActiveSubstance = function(substanceId, options = {}) {
  const {
    isActive = true,
    limit = 20,
    skip = 0,
    sort = { name: 1 }
  } = options;

  return this.find({
    'activeSubstanceContent.substanceId': substanceId,
    isActive
  })
  .populate('activeSubstances', 'name scientificName')
  .populate('categoryId', 'name slug')
  .populate('brandId', 'name slug logoUrl')
  .sort(sort)
  .limit(limit)
  .skip(skip);
};

// Static method để lấy thuốc theo dạng bào chế
drugSchema.statics.getByDosageForm = function(dosageForm, options = {}) {
  const {
    isActive = true,
    limit = 20,
    skip = 0,
    sort = { name: 1 }
  } = options;

  return this.find({
    dosageForm,
    isActive
  })
  .populate('activeSubstances', 'name scientificName')
  .populate('categoryId', 'name slug')
  .populate('brandId', 'name slug logoUrl')
  .sort(sort)
  .limit(limit)
  .skip(skip);
};

// Static method để lấy thuốc cần kê đơn
drugSchema.statics.getPrescriptionRequired = function(options = {}) {
  const {
    isActive = true,
    limit = 20,
    skip = 0,
    sort = { name: 1 }
  } = options;

  return this.find({
    'regulatoryInfo.prescriptionRequired': true,
    isActive
  })
  .populate('activeSubstances', 'name scientificName')
  .populate('categoryId', 'name slug')
  .populate('brandId', 'name slug logoUrl')
  .sort(sort)
  .limit(limit)
  .skip(skip);
};

// Method để thêm hoạt chất
drugSchema.methods.addActiveSubstance = function(substanceId, content, unit = 'mg') {
  this.activeSubstanceContent.push({
    substanceId,
    content,
    unit
  });
  return this.save();
};

// Method để cập nhật hoạt chất
drugSchema.methods.updateActiveSubstance = function(substanceId, updateData) {
  const content = this.activeSubstanceContent.find(c => c.substanceId.toString() === substanceId.toString());
  if (content) {
    Object.assign(content, updateData);
    return this.save();
  }
  throw new Error('Active substance not found');
};

// Method để xóa hoạt chất
drugSchema.methods.removeActiveSubstance = function(substanceId) {
  this.activeSubstanceContent.pull({ substanceId });
  return this.save();
};

// Tạo discriminator
const Drug = Product.discriminator('Drug', drugSchema);

export default Drug;
