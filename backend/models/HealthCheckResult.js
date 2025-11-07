import mongoose from "mongoose";

const healthCheckResultSchema = new mongoose.Schema(
  {
    healthCheckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HealthCheck",
      required: true
    },
    minScore: {
      type: Number,
      required: true
    },
    maxScore: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true,
      maxlength: 200
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000
    },
    recommendations: [{
      type: String,
      maxlength: 500
    }],
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low"
    }
  },
  { timestamps: true }
);

healthCheckResultSchema.index({ healthCheckId: 1, minScore: 1, maxScore: 1 });

export default mongoose.model("HealthCheckResult", healthCheckResultSchema);

