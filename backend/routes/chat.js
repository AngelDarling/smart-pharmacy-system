import express from "express";
import { chatWithAI } from "../controllers/chatController.js";
import { chatRateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// POST /api/chat - Chat với AI tư vấn sản phẩm (Giới hạn 20 yêu cầu / 15 phút)
router.post("/", chatRateLimiter, chatWithAI);

export default router;

