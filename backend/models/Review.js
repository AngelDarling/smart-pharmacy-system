import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    content: { type: String }
  },
  { timestamps: true }
);

reviewSchema.index({ productId: 1, createdAt: -1 });

export default mongoose.model("Review", reviewSchema);


