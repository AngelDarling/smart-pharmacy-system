import express from "express";
import { chatWithAI } from "../controllers/chatController.js";

const router = express.Router();

// POST /api/chat - Chat với AI tư vấn sản phẩm
router.post("/", chatWithAI);

export default router;

