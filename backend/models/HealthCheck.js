import mongoose from "mongoose";

const healthCheckSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      maxlength: 500
    },
    shortDescription: {
      type: String,
      maxlength: 300
    },
    iconUrl: {
      type: String,
      maxlength: 500
    },
    isActive: {
      type: Boolean,
      default: true
    },
    sortOrder: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

healthCheckSchema.index({ isActive: 1, sortOrder: 1 });

export default mongoose.model("HealthCheck", healthCheckSchema);

