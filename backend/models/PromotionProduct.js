import mongoose from "mongoose";

const promotionProductSchema = new mongoose.Schema(
  {
    promotionId: { type: mongoose.Schema.Types.ObjectId, ref: "Promotion", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true }
  },
  { timestamps: true }
);

promotionProductSchema.index({ promotionId: 1, productId: 1 }, { unique: true });

export default mongoose.model("PromotionProduct", promotionProductSchema);


