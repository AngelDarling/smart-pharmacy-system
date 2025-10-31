import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true
    },
    // Thông tin cho người dùng chưa đăng nhập
    guestName: {
      type: String,
      trim: true
    },
    guestEmail: {
      type: String,
      trim: true,
      lowercase: true
    },
    guestPhone: {
      type: String,
      trim: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    isVerified: {
      type: Boolean,
      default: false // Đánh dấu đã mua hàng hay chưa
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved" // Tự động approve, có thể thay đổi sau
    },
    adminReply: {
      type: String,
      trim: true,
      maxlength: 2000
    },
    adminReplyAt: {
      type: Date
    },
    adminReplyBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

reviewSchema.index({ productId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ status: 1 });

export default mongoose.model("Review", reviewSchema);

