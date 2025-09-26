import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    discount: { type: Number, required: true },
    startAt: { type: Date },
    endAt: { type: Date },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Promotion", promotionSchema);


