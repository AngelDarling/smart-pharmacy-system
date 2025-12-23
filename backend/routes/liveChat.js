import express from "express";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

const router = express.Router();

// Get history for a customer/session
router.get("/history/:sessionId", async (req, res) => {
  try {
    const conversation = await Conversation.findOne({ sessionId: req.params.sessionId });
    if (!conversation) return res.json([]);
    
    const messages = await Message.find({ conversationId: conversation._id }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Get all conversations
router.get("/conversations", async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const conversations = await Conversation.find(query).sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Close a conversation
router.patch("/close/:conversationId", async (req, res) => {
  try {
    const conversation = await Conversation.findByIdAndUpdate(
      req.params.conversationId,
      { status: "closed" },
      { new: true }
    );
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Cleanup old closed conversations
// Use POST instead of DELETE to be safer in some environments
router.post("/cleanup", async (req, res) => {
  console.log("Cleanup request received via POST");
  try {
    const result = await Conversation.deleteMany({ status: "closed" });
    console.log(`Deleted ${result.deletedCount} closed conversations`);
    
    // Cleanup orphan messages
    const allConvs = await Conversation.find().select('_id');
    const allIds = allConvs.map(c => c._id);
    const msgResult = await Message.deleteMany({ conversationId: { $nin: allIds } });
    console.log(`Deleted ${msgResult.deletedCount} orphan messages`);
    
    res.json({ 
      message: `Đã dọn dẹp sạch ${result.deletedCount} cuộc trò chuyện đã đóng.`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Admin: Get messages for a conversation
router.get("/messages/:conversationId", async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
