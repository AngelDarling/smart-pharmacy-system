import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    brand: { type: String, trim: true },
    description: { type: String },
    usage: { type: String },
    imageUrls: { type: [String], default: [] },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    unit: { type: String, default: "hộp" },
    sku: { type: String, unique: true, sparse: true },
    barcode: { type: String, unique: true, sparse: true },
    stockOnHand: { type: Number, default: 0 },
    contraindications: { type: String },
    dosage: { type: String },
    ingredients: { type: String },
    storage: { type: String },
    attributes: { type: Object, default: {} },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ categoryId: 1, isActive: 1 });
productSchema.index({ name: "text", brand: "text" });
productSchema.index({ price: 1 });

export default mongoose.model("Product", productSchema);


