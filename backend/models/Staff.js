import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const staffSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: false, sparse: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, trim: true },
    role: { 
      type: String, 
      enum: ["staff", "admin", "manager", "pharmacist"], 
      default: "staff", 
      index: true 
    },
    isActive: { type: Boolean, default: true },
    
    // Staff specific fields
    employeeId: { type: String, sparse: true },
    department: { type: String, trim: true },
    position: { type: String, trim: true },
    hireDate: { type: Date },
    salary: { type: Number, min: 0 },
    permissions: {
      type: Map,
      of: [String],
      default: () => new Map()
    },
    avatar: { type: String },
    lastLogin: { type: Date },
    loginCount: { type: Number, default: 0 }
  },
  { 
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        // Convert permissions Map to plain object
        if (ret.permissions instanceof Map) {
          ret.permissions = Object.fromEntries(ret.permissions);
        }
        return ret;
      }
    }
  }
);

staffSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

staffSchema.statics.hashPassword = async function (plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
};

staffSchema.index({ email: 1 }, { unique: true, sparse: true });
staffSchema.index({ employeeId: 1 }, { unique: true, sparse: true });
staffSchema.index({ phone: 1 }, { unique: true, sparse: true });

export default mongoose.model("Staff", staffSchema);
