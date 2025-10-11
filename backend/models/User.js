import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
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
    employeeId: { type: String, sparse: true, unique: true },
    department: { type: String, trim: true },
    position: { type: String, trim: true },
    hireDate: { type: Date },
    salary: { type: Number, min: 0 },
    permissions: [{
      type: String,
      enum: [
        'read_products', 'write_products', 'delete_products',
        'read_categories', 'write_categories', 'delete_categories',
        'read_users', 'write_users', 'delete_users',
        'read_orders', 'write_orders', 'delete_orders',
        'read_inventory', 'write_inventory', 'delete_inventory',
        'read_reports', 'write_reports',
        'manage_staff', 'manage_settings'
      ]
    }],
    avatar: { type: String },
    lastLogin: { type: Date },
    loginCount: { type: Number, default: 0 }
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

export default mongoose.model("User", userSchema);


