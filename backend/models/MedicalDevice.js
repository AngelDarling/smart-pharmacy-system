import mongoose from "mongoose";
import Product from "./Product.js";

/**
 * MedicalDevice Schema - Schema cho sản phẩm thiết bị y tế
 * Kế thừa từ ProductBaseSchema với các trường đặc thù cho thiết bị y tế
 */
const medicalDeviceSchema = new mongoose.Schema({
  // Loại thiết bị y tế
  deviceType: {
    type: String,
    required: true,
    enum: [
      'diagnostic',          // Chẩn đoán
      'therapeutic',         // Điều trị
      'monitoring',          // Theo dõi
      'surgical',            // Phẫu thuật
      'rehabilitation',      // Phục hồi chức năng
      'preventive',          // Phòng ngừa
      'supportive',          // Hỗ trợ
      'disposable',          // Dùng một lần
      'reusable',            // Tái sử dụng
      'implantable',         // Cấy ghép
      'wearable',            // Đeo được
      'portable',            // Di động
      'stationary',          // Cố định
      'other'                // Khác
    ]
  },
  
  // Phân loại theo rủi ro
  riskClassification: {
    type: String,
    required: true,
    enum: [
      'class_i',             // Lớp I - Rủi ro thấp
      'class_ii_a',          // Lớp IIa - Rủi ro trung bình thấp
      'class_ii_b',          // Lớp IIb - Rủi ro trung bình cao
      'class_iii'            // Lớp III - Rủi ro cao
    ]
  },
  
  // Mục đích sử dụng
  intendedUse: {
    type: String,
    required: true,
    maxlength: 500
  },
  
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
  
  // Cảnh báo và thận trọng
  warnings: [{
    type: String,
    maxlength: 500
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
    duration: {
      type: String,
      maxlength: 100
    },
    precautions: [{
      type: String,
      maxlength: 200
    }]
  },
  
  // Thông số kỹ thuật
  technicalSpecifications: {
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
    weight: {
      value: { type: Number, min: 0 },
      unit: {
        type: String,
        enum: ['mg', 'g', 'kg'],
        default: 'g'
      }
    },
    power: {
      voltage: { type: String, maxlength: 50 },
      current: { type: String, maxlength: 50 },
      power: { type: String, maxlength: 50 }
    },
    operatingTemperature: {
      min: { type: Number },
      max: { type: Number },
      unit: {
        type: String,
        enum: ['C', 'F'],
        default: 'C'
      }
    },
    operatingHumidity: {
      min: { type: Number },
      max: { type: Number },
      unit: {
        type: String,
        enum: ['%'],
        default: '%'
      }
    },
    other: [{
      name: { type: String, maxlength: 100 },
      value: { type: String, maxlength: 100 },
      unit: { type: String, maxlength: 20 }
    }]
  },
  
  // Thông tin bảo trì
  maintenance: {
    frequency: {
      type: String,
      maxlength: 100
    },
    procedures: [{
      type: String,
      maxlength: 500
    }],
    calibrationRequired: {
      type: Boolean,
      default: false
    },
    calibrationFrequency: {
      type: String,
      maxlength: 100
    },
    serviceLife: {
      type: String,
      maxlength: 100
    }
  },
  
  // Thông tin an toàn
  safetyInfo: {
    biocompatibility: {
      type: Boolean,
      default: false
    },
    sterility: {
      type: String,
      enum: ['sterile', 'non_sterile', 'sterilizable'],
      default: 'non_sterile'
    },
    radiationSafety: {
      type: Boolean,
      default: false
    },
    electricalSafety: {
      type: Boolean,
      default: false
    },
    mechanicalSafety: {
      type: Boolean,
      default: false
    },
    chemicalSafety: {
      type: Boolean,
      default: false
    },
    other: [{
      type: String,
      maxlength: 200
    }]
  },
  
  // Thông tin pháp lý
  regulatoryInfo: {
    deviceRegistration: {
      type: String,
      maxlength: 100
    },
    fdaApproved: {
      type: Boolean,
      default: false
    },
    ceMarked: {
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
    licenseNumber: {
      type: String,
      maxlength: 100
    },
    certificateNumber: {
      type: String,
      maxlength: 100
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
    },
    rentalPrice: {
      type: Number,
      min: 0
    },
    maintenanceCost: {
      type: Number,
      min: 0
    }
  },
  
  // Thông tin khuyến mãi đặc biệt cho thiết bị y tế
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
    warranty: {
      type: String,
      maxlength: 200
    },
    servicePackage: {
      type: String,
      maxlength: 200
    }
  },
  
  // Thông tin bổ sung
  additionalInfo: {
    targetUsers: {
      type: String,
      enum: ['patients', 'healthcare_professionals', 'both'],
      default: 'both'
    },
    ageGroup: {
      type: String,
      enum: ['pediatric', 'adult', 'geriatric', 'all'],
      default: 'all'
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'unisex'],
      default: 'unisex'
    },
    setting: {
      type: String,
      enum: ['home', 'clinic', 'hospital', 'all'],
      default: 'all'
    }
  }
}, {
  timestamps: true
});

// Indexes cho MedicalDevice
medicalDeviceSchema.index({ deviceType: 1, isActive: 1 });
medicalDeviceSchema.index({ riskClassification: 1, isActive: 1 });
medicalDeviceSchema.index({ 'safetyInfo.biocompatibility': 1 });
medicalDeviceSchema.index({ 'safetyInfo.sterility': 1 });
medicalDeviceSchema.index({ 'regulatoryInfo.vietnamApproved': 1 });
medicalDeviceSchema.index({ 'regulatoryInfo.fdaApproved': 1 });
medicalDeviceSchema.index({ 'regulatoryInfo.ceMarked': 1 });
medicalDeviceSchema.index({ 'additionalInfo.targetUsers': 1 });
medicalDeviceSchema.index({ 'additionalInfo.ageGroup': 1 });
medicalDeviceSchema.index({ 'additionalInfo.setting': 1 });

// Static method để tìm kiếm thiết bị theo loại
medicalDeviceSchema.statics.searchByDeviceType = function(deviceType, options = {}) {
  const {
    isActive = true,
    limit = 20,
    skip = 0,
    sort = { name: 1 }
  } = options;

  return this.find({
    deviceType,
    isActive
  })
  .populate('categoryId', 'name slug')
  .populate('brandId', 'name slug logoUrl')
  .sort(sort)
  .limit(limit)
  .skip(skip);
};

// Static method để tìm kiếm thiết bị theo phân loại rủi ro
medicalDeviceSchema.statics.searchByRiskClassification = function(riskClassification, options = {}) {
  const {
    isActive = true,
    limit = 20,
    skip = 0,
    sort = { name: 1 }
  } = options;

  return this.find({
    riskClassification,
    isActive
  })
  .populate('categoryId', 'name slug')
  .populate('brandId', 'name slug logoUrl')
  .sort(sort)
  .limit(limit)
  .skip(skip);
};

// Static method để lấy thiết bị đã được phê duyệt
medicalDeviceSchema.statics.getApprovedDevices = function(options = {}) {
  const {
    isActive = true,
    limit = 20,
    skip = 0,
    sort = { name: 1 }
  } = options;

  return this.find({
    'regulatoryInfo.vietnamApproved': true,
    isActive
  })
  .populate('categoryId', 'name slug')
  .populate('brandId', 'name slug logoUrl')
  .sort(sort)
  .limit(limit)
  .skip(skip);
};

// Static method để lấy thiết bị cho người dùng cụ thể
medicalDeviceSchema.statics.getDevicesForUser = function(targetUsers, options = {}) {
  const {
    isActive = true,
    limit = 20,
    skip = 0,
    sort = { name: 1 }
  } = options;

  return this.find({
    $or: [
      { 'additionalInfo.targetUsers': targetUsers },
      { 'additionalInfo.targetUsers': 'both' }
    ],
    isActive
  })
  .populate('categoryId', 'name slug')
  .populate('brandId', 'name slug logoUrl')
  .sort(sort)
  .limit(limit)
  .skip(skip);
};

// Method để thêm chỉ định
medicalDeviceSchema.methods.addIndication = function(indication) {
  if (!this.indications.includes(indication)) {
    this.indications.push(indication);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method để thêm chống chỉ định
medicalDeviceSchema.methods.addContraindication = function(contraindication) {
  if (!this.contraindications.includes(contraindication)) {
    this.contraindications.push(contraindication);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method để thêm cảnh báo
medicalDeviceSchema.methods.addWarning = function(warning) {
  if (!this.warnings.includes(warning)) {
    this.warnings.push(warning);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method để thêm thông số kỹ thuật
medicalDeviceSchema.methods.addTechnicalSpec = function(specData) {
  this.technicalSpecifications.other.push(specData);
  return this.save();
};

// Tạo discriminator
const MedicalDevice = Product.discriminator('MedicalDevice', medicalDeviceSchema);

export default MedicalDevice;
