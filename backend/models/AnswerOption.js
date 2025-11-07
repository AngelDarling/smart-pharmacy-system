import mongoose from "mongoose";

const answerOptionSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true
    },
    optionText: {
      type: String,
      required: true,
      maxlength: 500
    },
    scoreValue: {
      type: Number,
      default: 0
    },
    order: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

answerOptionSchema.index({ questionId: 1, order: 1 });

export default mongoose.model("AnswerOption", answerOptionSchema);

