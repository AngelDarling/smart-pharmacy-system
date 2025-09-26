import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String },
    imageUrl: { type: String, required: true },
    linkUrl: { type: String },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Banner", bannerSchema);


