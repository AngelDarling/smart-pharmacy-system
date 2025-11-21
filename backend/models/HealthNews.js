import mongoose from 'mongoose';
import slugify from 'slugify';

const healthNewsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  excerpt: {
    type: String,
    required: true,
    maxlength: 300
  },
  content: {
    type: String,
    required: true
  },
  featuredImage: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HealthNewsCategory',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  author: {
    name: {
      type: String,
      required: true
    },
    avatar: String,
    bio: String
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: Date,
  viewCount: {
    type: Number,
    default: 0
  },
  likeCount: {
    type: Number,
    default: 0
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String],
    ogImage: String,
    schemaType: {
      type: String,
      enum: ['Article', 'MedicalWebPage'],
      default: 'Article'
    }
  },
  relatedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  isFeatured: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  }
}, {
  timestamps: true
});

// Text search index for title and tags (IMPORTANT for performance)
healthNewsSchema.index({ title: 'text', tags: 'text' });

// Unique slug index
healthNewsSchema.index({ slug: 1 }, { unique: true });

// Compound indexes for common queries
healthNewsSchema.index({ status: 1, publishedAt: -1 });
healthNewsSchema.index({ category: 1, status: 1 });
healthNewsSchema.index({ isFeatured: 1, status: 1 });
healthNewsSchema.index({ status: 1, viewCount: -1 }); // For trending articles

// Pre-save hook to handle slug generation and duplicate slugs
healthNewsSchema.pre('save', async function(next) {
  if (this.isModified('title')) {
    // Generate base slug from title
    let baseSlug = slugify(this.title, {
      lower: true,
      strict: true,
      locale: 'vi'
    });
    
    let slug = baseSlug;
    let counter = 1;
    
    // Check for duplicate slugs and auto-increment
    while (await this.constructor.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    this.slug = slug;
  }
  
  // Set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

export default mongoose.model('HealthNews', healthNewsSchema);
