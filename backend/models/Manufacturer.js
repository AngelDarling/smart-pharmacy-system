import mongoose from "mongoose";

const manufacturerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    country: { type: String, trim: true }
  },
  { timestamps: true }
);

manufacturerSchema.index({ name: 1 }, { unique: true });

export default mongoose.model("Manufacturer", manufacturerSchema);


