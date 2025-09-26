import mongoose from "mongoose";

const inventoryTransactionSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    type: { type: String, enum: ["import", "export", "adjust"], required: true },
    quantity: { type: Number, required: true }, // + nhập, - xuất
    unitCost: { type: Number },
    referenceType: { type: String, enum: ["purchase", "order", "manual", "return"], default: "manual" },
    referenceId: { type: String },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", default: null },
    note: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

inventoryTransactionSchema.index({ productId: 1, createdAt: -1 });
inventoryTransactionSchema.index({ type: 1 });

export default mongoose.model("InventoryTransaction", inventoryTransactionSchema);


