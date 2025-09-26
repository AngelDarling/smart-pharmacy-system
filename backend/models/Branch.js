import mongoose from "mongoose";

const branchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true }
  },
  { timestamps: true }
);

branchSchema.index({ name: 1 });

export default mongoose.model("Branch", branchSchema);


