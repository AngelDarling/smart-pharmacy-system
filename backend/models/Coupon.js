import mongoose from "mongoose";

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, trim: true, uppercase: true },
  description: { type: String, default: "" },
  discountType: { type: String, enum: ["percent", "amount"], required: true },
  discountValue: { type: Number, required: true },
  minOrder: { type: Number, default: 0 },
  maxDiscount: { type: Number, default: 0 },
  startDate: { type: Date },
  endDate: { type: Date },
  usageLimit: { type: Number, default: 0 },
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

CouponSchema.index({ code: 1 }, { unique: true });

export default mongoose.model("Coupon", CouponSchema);


