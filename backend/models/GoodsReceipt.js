import mongoose from "mongoose";

const goodsReceiptSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        unitCost: { type: Number, required: true }
      }
    ],
    note: { type: String },
    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    receivedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

goodsReceiptSchema.index({ code: 1 }, { unique: true });
goodsReceiptSchema.index({ supplierId: 1, receivedAt: -1 });

export default mongoose.model("GoodsReceipt", goodsReceiptSchema);


