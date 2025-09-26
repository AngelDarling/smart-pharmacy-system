import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true, required: true },
    type: { type: String, enum: ["percent", "fixed"], required: true },
    value: { type: Number, required: true },
    minOrderTotal: { type: Number, default: 0 },
    maxDiscount: { type: Number },
    startAt: { type: Date },
    endAt: { type: Date },
    usageLimit: { type: Number },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    applicableCategoryIds: { type: [mongoose.Schema.Types.ObjectId], ref: "Category", default: [] },
    applicableProductIds: { type: [mongoose.Schema.Types.ObjectId], ref: "Product", default: [] }
  },
  { timestamps: true }
);

voucherSchema.index({ code: 1 }, { unique: true });

export default mongoose.model("Voucher", voucherSchema);


