import mongoose from "mongoose";

const productSalesDailySchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    date: { type: Date, required: true }, // normalized to 00:00:00
    quantity: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// One doc per product per day
productSalesDailySchema.index({ productId: 1, date: 1 }, { unique: true });

export default mongoose.model("ProductSalesDaily", productSalesDailySchema);


