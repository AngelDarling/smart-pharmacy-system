import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    nameSnapshot: { type: String, required: true },
    priceSnapshot: { type: Number, required: true },
    quantity: { type: Number, required: true }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    code: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["pending", "processing", "shipping", "completed", "cancelled"], default: "pending" },
    paymentMethod: { type: String, enum: ["cod", "simulate"], default: "cod" },
    shippingAddress: { type: Object },
    items: { type: [orderItemSchema], default: [] },
    totals: {
      items: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      shipping: { type: Number, default: 0 },
      grand: { type: Number, default: 0 }
    },
    voucherCode: { type: String },
    couponCode: { type: String },
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
    shipment: { type: mongoose.Schema.Types.ObjectId, ref: "Shipment" }
  },
  { timestamps: true }
);

orderSchema.index({ code: 1 }, { unique: true });
orderSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Order", orderSchema);


