import mongoose from "mongoose";

/**
 * ActiveSubstance Schema - Quản lý thông tin hoạt chất
 * Hỗ trợ tìm kiếm và phân loại hoạt chất theo nhiều tiêu chí
 */
const activeSubstanceSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true,
      maxlength: 200
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 250
    },
    // Tên khoa học
    scientificName: {
      type: String,
      maxlength: 300
    },
    // Tên quốc tế không đăng ký (INN)
    innName: {
      type: String,
      maxlength: 200
    },
    // Mã CAS (Chemical Abstracts Service)
    casNumber: {
      type: String,
      sparse: true,
      validate: {
        validator: function(v) {
          return !v || /^\d{1,7}-\d{2}-\d$/.test(v);
        },
        message: 'CAS number must be in format XXXXXXX-XX-X'
      }
    },
    // Công thức hóa học
    chemicalFormula: {
      type: String,
      maxlength: 100
    },
    // Cấu trúc phân tử (SMILES notation)
    smilesNotation: {
      type: String,
      maxlength: 500
    },
    // Phân loại dược lý
    pharmacologicalClass: {
      type: String,
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
    // Mô tả tác dụng
    mechanismOfAction: {
      type: String,
      maxlength: 2000
    },
    // Chỉ định
    indications: [{
      type: String,
      maxlength: 200
    }],
    // Chống chỉ định
    contraindications: [{
      type: String,
      maxlength: 200
    }],
    // Tác dụng phụ
    sideEffects: [{
      type: String,
      maxlength: 200
    }],
    // Tương tác thuốc
    drugInteractions: [{
      substance: {
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
    // Liều dùng
    dosage: {
      adult: {
        type: String,
        maxlength: 200
      },
      pediatric: {
        type: String,
        maxlength: 200
      },
      elderly: {
        type: String,
        maxlength: 200
      }
    },
    // Cảnh báo đặc biệt
    warnings: [{
      type: String,
      maxlength: 500
    }],
    // Thông tin pháp lý
    regulatoryInfo: {
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
      patentExpiry: {
        type: Date
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
    // Nguồn tham khảo
    references: [{
      title: {
        type: String,
        maxlength: 300
      },
      url: {
        type: String,
        maxlength: 500
      },
      type: {
        type: String,
        enum: ['study', 'guideline', 'monograph', 'other'],
        default: 'other'
      }
    }],
    isActive: { 
      type: Boolean, 
      default: true 
    },
    // Thống kê
    productCount: {
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
activeSubstanceSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'activeSubstances'
});

// Indexes cho tối ưu hiệu năng
activeSubstanceSchema.index({ slug: 1 }, { unique: true });
activeSubstanceSchema.index({ name: 1 }, { unique: true });
activeSubstanceSchema.index({ casNumber: 1 }, { unique: true, sparse: true });
activeSubstanceSchema.index({ innName: 1 });
activeSubstanceSchema.index({ scientificName: 1 });
activeSubstanceSchema.index({ pharmacologicalClass: 1, isActive: 1 });
activeSubstanceSchema.index({ 
  name: "text", 
  scientificName: "text",
  innName: "text",
  chemicalFormula: "text",
  mechanismOfAction: "text",
  indications: "text"
}, { 
  weights: { 
    name: 10, 
    innName: 9, 
    scientificName: 8, 
    chemicalFormula: 7, 
    mechanismOfAction: 5, 
    indications: 3 
  },
  default_language: "none"
});

// Static method để tìm kiếm hoạt chất
activeSubstanceSchema.statics.search = function(query, options = {}) {
  const {
    pharmacologicalClass,
    isActive = true,
    limit = 20,
    skip = 0,
    sort = { name: 1 }
  } = options;

  const filter = { isActive };
  if (pharmacologicalClass) filter.pharmacologicalClass = pharmacologicalClass;

  if (query) {
    filter.$text = { $search: query };
  }

  return this.find(filter)
    .sort(sort)
    .limit(limit)
    .skip(skip);
};

// Static method để lấy hoạt chất theo phân loại
activeSubstanceSchema.statics.getByClass = function(pharmacologicalClass, options = {}) {
  const {
    isActive = true,
    sort = { name: 1 }
  } = options;

  return this.find({
    pharmacologicalClass,
    isActive
  }).sort(sort);
};

// Static method để cập nhật productCount
activeSubstanceSchema.statics.updateProductCount = async function(substanceId) {
  const Product = mongoose.model('Product');
  const count = await Product.countDocuments({
    activeSubstances: substanceId,
    isActive: true
  });
  
  await this.findByIdAndUpdate(substanceId, { productCount: count });
  return count;
};

// Method để thêm chỉ định
activeSubstanceSchema.methods.addIndication = function(indication) {
  if (!this.indications.includes(indication)) {
    this.indications.push(indication);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method để thêm chống chỉ định
activeSubstanceSchema.methods.addContraindication = function(contraindication) {
  if (!this.contraindications.includes(contraindication)) {
    this.contraindications.push(contraindication);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method để thêm tương tác thuốc
activeSubstanceSchema.methods.addDrugInteraction = function(interaction) {
  this.drugInteractions.push(interaction);
  return this.save();
};

export default mongoose.model("ActiveSubstance", activeSubstanceSchema);
