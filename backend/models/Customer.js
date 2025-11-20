import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: false, sparse: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    avatar: { type: String },
    lastLogin: { type: Date },
    loginCount: { type: Number, default: 0 },
    
    // Customer specific field - Điểm thành viên tích lũy
    loyaltyPoints: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

customerSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

customerSchema.statics.hashPassword = async function (plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
};

customerSchema.index({ email: 1 }, { unique: true, sparse: true });
customerSchema.index({ phone: 1 }, { unique: true, sparse: true });

// Point History Schema
const pointHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  orderCode: { type: String },
  points: { type: Number, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const PointHistory = mongoose.model("PointHistory", pointHistorySchema);
export default mongoose.model("Customer", customerSchema);
