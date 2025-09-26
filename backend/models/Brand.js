import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

brandSchema.index({ name: 1 }, { unique: true });

export default mongoose.model("Brand", brandSchema);


