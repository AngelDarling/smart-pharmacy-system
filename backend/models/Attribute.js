import mongoose from "mongoose";

/**
 * Attribute Schema - Schema linh hoạt để quản lý các thuộc tính sản phẩm
 * Hỗ trợ nhiều loại thuộc tính: Dạng bào chế, Loại da, Công dụng chính, v.v.
 */
const attributeSchema = new mongoose.Schema(
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
    type: {
      type: String,
      required: true,
      enum: [
        'dosage_form',      // Dạng bào chế
        'skin_type',        // Loại da
        'main_use',         // Công dụng chính
        'age_group',        // Độ tuổi
        'gender',           // Giới tính
        'ingredient_type',  // Loại thành phần
        'effect',           // Tác dụng
        'color',            // Màu sắc
        'size',             // Kích thước
        'material',         // Chất liệu
        'origin',           // Xuất xứ
        'certification',    // Chứng nhận
        'other'             // Khác
      ]
    },
    description: {
      type: String,
      maxlength: 500
    },
    values: [{
      value: {
        type: String,
        required: true,
        maxlength: 100
      },
      displayValue: {
        type: String,
        maxlength: 100
      },
      color: {
        type: String,
        validate: {
          validator: function(v) {
            return !v || /^#[0-9A-F]{6}$/i.test(v);
          },
          message: 'Color must be a valid hex color'
        }
      },
      iconUrl: {
        type: String
      },
      sortOrder: {
        type: Number,
        default: 0
      },
      isActive: {
        type: Boolean,
        default: true
      }
    }],
    isRequired: {
      type: Boolean,
      default: false
    },
    isFilterable: {
      type: Boolean,
      default: true
    },
    isSearchable: {
      type: Boolean,
      default: true
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    sortOrder: {
      type: Number,
      default: 0
    },
    // Cấu hình hiển thị
    displayConfig: {
      showInProductCard: {
        type: Boolean,
        default: true
      },
      showInProductDetail: {
        type: Boolean,
        default: true
      },
      showInFilter: {
        type: Boolean,
        default: true
      },
      displayType: {
        type: String,
        enum: ['text', 'color', 'icon', 'badge'],
        default: 'text'
      }
    },
    // Thống kê
    usageCount: {
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

// Virtual để lấy active values
attributeSchema.virtual('activeValues').get(function() {
  return this.values.filter(v => v.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
});

// Indexes cho tối ưu hiệu năng
attributeSchema.index({ slug: 1 }, { unique: true });
attributeSchema.index({ type: 1, isActive: 1, sortOrder: 1 });
attributeSchema.index({ isFilterable: 1, isActive: 1 });
attributeSchema.index({ isSearchable: 1, isActive: 1 });
attributeSchema.index({ 
  name: "text", 
  description: "text",
  "values.value": "text",
  "values.displayValue": "text"
}, { 
  weights: { 
    name: 10, 
    "values.value": 8, 
    "values.displayValue": 6, 
    description: 3 
  },
  default_language: "none"
});

// Static method để tìm kiếm attributes
attributeSchema.statics.search = function(query, options = {}) {
  const {
    type,
    isActive = true,
    isFilterable,
    isSearchable,
    limit = 20,
    skip = 0,
    sort = { sortOrder: 1, name: 1 }
  } = options;

  const filter = { isActive };
  if (type) filter.type = type;
  if (isFilterable !== undefined) filter.isFilterable = isFilterable;
  if (isSearchable !== undefined) filter.isSearchable = isSearchable;

  if (query) {
    filter.$text = { $search: query };
  }

  return this.find(filter)
    .sort(sort)
    .limit(limit)
    .skip(skip);
};

// Static method để lấy attributes theo type
attributeSchema.statics.getByType = function(type, options = {}) {
  const {
    isActive = true,
    isFilterable = true,
    sort = { sortOrder: 1, name: 1 }
  } = options;

  return this.find({
    type,
    isActive,
    isFilterable
  }).sort(sort);
};

// Static method để cập nhật usageCount
attributeSchema.statics.updateUsageCount = async function(attributeId) {
  const Product = mongoose.model('Product');
  const count = await Product.countDocuments({
    'attributes.attributeId': attributeId,
    isActive: true
  });
  
  await this.findByIdAndUpdate(attributeId, { usageCount: count });
  return count;
};

// Method để thêm value mới
attributeSchema.methods.addValue = function(valueData) {
  const newValue = {
    value: valueData.value,
    displayValue: valueData.displayValue || valueData.value,
    color: valueData.color,
    iconUrl: valueData.iconUrl,
    sortOrder: valueData.sortOrder || this.values.length,
    isActive: valueData.isActive !== false
  };
  
  this.values.push(newValue);
  return this.save();
};

// Method để cập nhật value
attributeSchema.methods.updateValue = function(valueId, updateData) {
  const value = this.values.id(valueId);
  if (value) {
    Object.assign(value, updateData);
    return this.save();
  }
  throw new Error('Value not found');
};

// Method để xóa value
attributeSchema.methods.removeValue = function(valueId) {
  this.values.pull(valueId);
  return this.save();
};

export default mongoose.model("Attribute", attributeSchema);
