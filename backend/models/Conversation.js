import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    sessionId: { type: String, required: true, index: true },
    customerName: { type: String, default: "Khách hàng" },
    lastMessage: { type: String },
    status: { type: String, enum: ["open", "closed"], default: "open" },
    unreadCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Conversation", conversationSchema);
