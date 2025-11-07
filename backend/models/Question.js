import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    healthCheckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HealthCheck",
      required: true
    },
    questionText: {
      type: String,
      required: true,
      maxlength: 1000
    },
    questionType: {
      type: String,
      enum: ["single-choice", "multiple-choice", "number", "text"],
      default: "single-choice"
    },
    order: {
      type: Number,
      required: true
    },
    isRequired: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

questionSchema.index({ healthCheckId: 1, order: 1 });

export default mongoose.model("Question", questionSchema);

