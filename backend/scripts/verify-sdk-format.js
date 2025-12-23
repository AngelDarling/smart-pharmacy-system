import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import Product from "../models/Product.js";
import mongoose from "mongoose";

dotenv.config();

// Giả lập Product model nếu cần hoặc kết nối db thật
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/smart-pharmacy";

const ai = new GoogleGenAI({});

// Copy hàm từ chatController để test
async function analyzeUserQuery(message) {
  const lowerMsg = message.toLowerCase();

  const profanityRegex = new RegExp(`\\b(${[
      "địt", "đụ", "lồn", "buồi", "cặc", "đm", "dm", "vcl", "vl", "đéo", "éo", 
      "pussy", "porn", "sex", "hentai", "xxx", "fuck", "ngu", "gà", "óc chó", "quần què"
  ].join("|")})`, 'i');

  const shortSensitiveRegex = new RegExp(`\\b(${["cc", "cl", "ml", "đmm", "clgt"].join("|")})\\b`, 'i');

  const offTopicRegex = new RegExp(`\\b(${[
      "thời tiết", "chính trị", "đá bóng", "xổ số", "lô đề", "đánh bạc", "cá độ", 
      "siu siu", "mãi đỉnh", "anh hổ", "pro", "vip", "đỉnh nóc", "kịch trần", "check var"
  ].join("|")})`, 'i');

  if (profanityRegex.test(lowerMsg) || shortSensitiveRegex.test(lowerMsg)) {
    return { intent: "INAPPROPRIATE", keywords: "", reason: "Từ khóa nhạy cảm (Local Check)" };
  }
  if (offTopicRegex.test(lowerMsg)) {
    return { intent: "OFF_TOPIC", keywords: "", reason: "Chủ đề lạc đề (Local Check)" };
  }

  try {
    const analysisPrompt = `
      Bạn là trợ lý AI của nhà thuốc Smart Pharmacy. Nhiệm vụ: Phân loại ý định và trích xuất từ khóa tìm kiếm thuốc.
      INPUT CỦA USER: "${message}"
      TRẢ VỀ JSON DUY NHẤT:
      {
        "intent": "MEDICAL" | "INAPPROPRIATE" | "OFF_TOPIC",
        "keywords": "từ khóa chính",
        "reason": "lý do"
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: analysisPrompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    console.log("Full AI Response Objects keys:", Object.keys(response));
    
    // ĐÂY LÀ CHỖ CẦN KIỂM TRA: response.text hay response.response.text()
    let rawText;
    try {
        rawText = response.text; // Thử kiểu SDK @google/genai
        console.log("Sử dụng response.text: ✅");
    } catch (e) {
        console.log("response.text thất bại: ❌");
        try {
            rawText = response.response.text();
            console.log("Sử dụng response.response.text(): ✅");
        } catch (e2) {
            console.log("Cả hai đều thất bại! ❌");
        }
    }

    rawText = rawText.replace(/```json|```/g, '').trim();
    return JSON.parse(rawText);
  } catch (error) {
    console.error("❌ Error in test:", error.message);
    return null;
  }
}

async function startTest() {
    console.log("🧪 Bắt đầu test SDK format...");
    const result = await analyzeUserQuery("Tôi cần mua thuốc panadol");
    console.log("Kết quả parse:", result);
    process.exit(0);
}

startTest();
