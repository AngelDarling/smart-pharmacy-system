import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    nameSnapshot: { type: String, required: true },
    priceSnapshot: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["active", "abandoned", "converted"], default: "active" },
    items: { type: [cartItemSchema], default: [] },
    voucherCode: { type: String },
    totals: {
      items: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      grand: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

cartSchema.index({ userId: 1, status: 1 });

export default mongoose.model("Cart", cartSchema);


