import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/**
 * @deprecated This model is deprecated. Use Staff.js for staff/admin users and Customer.js for customers.
 * This is kept for backward compatibility and migration purposes only.
 */

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: false, sparse: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    role: { 
      type: String, 
      enum: ["customer", "admin", "staff", "manager", "pharmacist"], 
      default: "customer", 
      index: true 
    },
    isActive: { type: Boolean, default: true },
    // Staff specific fields
    employeeId: { type: String, sparse: true },
    department: { type: String, trim: true },
    position: { type: String, trim: true },
    hireDate: { type: Date },
    salary: { type: Number, min: 0 },
    // Granular permissions system
    permissions: {
      type: Map,
      of: [String],
      default: () => new Map(),
      description: 'Resource-based permissions: { "products": ["view", "edit"], "orders": ["view"] }'
    },
    avatar: { type: String },
    lastLogin: { type: Date },
    loginCount: { type: Number, default: 0 },
    // Điểm thành viên tích lũy
    loyaltyPoints: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

userSchema.statics.hashPassword = async function (plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
};

userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ employeeId: 1 }, { unique: true, sparse: true });


// PointHistory is now exported from Customer.js
// Commented out to avoid Mongoose OverwriteModelError
/*
const pointHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  orderCode: { type: String },
  points: { type: Number, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const PointHistory = mongoose.model("PointHistory", pointHistorySchema);
*/

export default mongoose.model("User", userSchema);



