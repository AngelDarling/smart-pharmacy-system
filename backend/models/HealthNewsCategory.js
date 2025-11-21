import mongoose from 'mongoose';

const healthNewsCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  icon: {
    type: String,
    default: '📰'
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for slug (unique)
healthNewsCategorySchema.index({ slug: 1 }, { unique: true });

// Index for active categories ordered by order field
healthNewsCategorySchema.index({ isActive: 1, order: 1 });

export default mongoose.model('HealthNewsCategory', healthNewsCategorySchema);
