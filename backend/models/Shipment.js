import mongoose from "mongoose";

const shipmentSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    shippingCode: { type: String, required: true },
    carrier: { type: String, default: "Mock Carrier" },
    status: {
      type: String,
      enum: ["preparing", "pickup", "shipping", "delivered", "cancelled"],
      default: "preparing"
    },
    timeline: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

shipmentSchema.index({ shippingCode: 1 }, { unique: true });

export default mongoose.model("Shipment", shipmentSchema);


