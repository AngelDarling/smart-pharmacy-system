import mongoose from "mongoose";

/**
 * Category Schema - Cấu trúc cây phân cấp cho danh mục sản phẩm
 */
const categorySchema = new mongoose.Schema(
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
      maxlength: 500
    },
    parent: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Category", 
      default: null 
    },
    ancestors: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
    }],
    level: {
      type: Number,
      default: 0,
      min: 0
    },
    path: { 
      type: String, 
      default: ""
    },
    iconUrl: { 
      type: String, 
      default: "" 
    },
    imageUrl: {
      type: String,
      default: ""
    },
    sortOrder: {
      type: Number,
      default: 0
    },
    isActive: { 
      type: Boolean, 
      default: true 
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
    }]
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual để lấy children
categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

// Virtual để lấy products
categorySchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'categoryId'
});

// Middleware để tự động cập nhật ancestors và level
categorySchema.pre('save', async function(next) {
  if (this.isModified('parent')) {
    if (this.parent) {
      const parent = await this.constructor.findById(this.parent);
      if (parent) {
        this.ancestors = [...parent.ancestors, parent._id];
        this.level = parent.level + 1;
        this.path = parent.path ? `${parent.path}/${this.slug}` : this.slug;
      }
    } else {
      this.ancestors = [];
      this.level = 0;
      this.path = this.slug;
    }
  }
  next();
});

// Middleware để cập nhật ancestors của tất cả children
categorySchema.post('save', async function() {
  if (this.isModified('parent') || this.isModified('ancestors')) {
    const children = await this.constructor.find({ parent: this._id });
    for (const child of children) {
      await child.save();
    }
  }
});

// Indexes
categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ parent: 1, isActive: 1, sortOrder: 1 });
categorySchema.index({ ancestors: 1 });
categorySchema.index({ level: 1, isActive: 1 });
categorySchema.index({ path: 1 });
categorySchema.index({ 
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

export default mongoose.model("Category", categorySchema);
