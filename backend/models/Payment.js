import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ["cod", "simulate"], default: "cod" },
    status: { type: String, enum: ["unpaid", "paid", "failed"], default: "unpaid" }
  },
  { timestamps: true }
);

paymentSchema.index({ orderId: 1 });

export default mongoose.model("Payment", paymentSchema);


