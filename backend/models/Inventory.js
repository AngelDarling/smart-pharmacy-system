import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
    quantity: { type: Number, default: 0 },
    batchNo: { type: String },
    expiryDate: { type: Date }
  },
  { timestamps: true }
);

inventorySchema.index({ productId: 1, branchId: 1, batchNo: 1 }, { unique: true, sparse: true });

export default mongoose.model("Inventory", inventorySchema);


