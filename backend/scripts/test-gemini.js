import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌ GEMINI_API_KEY không tồn tại trong .env");
  process.exit(1);
}

console.log("🔑 API Key:", apiKey.substring(0, 20) + "...");
console.log("\n🧪 Đang test Gemini 2.5 Flash...\n");

// GoogleGenAI tự động lấy API key từ biến môi trường
const ai = new GoogleGenAI({});

async function testModel() {
  try {
    console.log(`📦 Đang test: gemini-2.5-flash...`);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Xin chào, bạn có thể giới thiệu về mình không?"
    });
    const text = response.text;
    console.log(`✅ gemini-2.5-flash hoạt động tốt!`);
    console.log(`   Response: ${text.substring(0, 150)}...\n`);
    console.log(`\n✅ Model hoạt động: gemini-2.5-flash`);
    console.log(`\n💡 Hệ thống sẽ sử dụng model này cho chatbot.`);
    return "gemini-2.5-flash";
  } catch (error) {
    if (error.message?.includes('404')) {
      console.log(`❌ gemini-2.5-flash - Model không tìm thấy (404)\n`);
    } else if (error.message?.includes('403')) {
      console.log(`❌ gemini-2.5-flash - Không có quyền truy cập (403)\n`);
    } else {
      console.log(`❌ gemini-2.5-flash - Lỗi: ${error.message}\n`);
    }
    
    console.log("\n⚠️  Model không hoạt động!");
    console.log("\n🔍 Có thể do:");
    console.log("   1. API key không có quyền truy cập gemini-2.5-flash");
    console.log("   2. Cần enable billing trong Google Cloud");
    console.log("   3. Quota đã hết");
    console.log("   4. API key không hợp lệ");
    console.log("\n📚 Kiểm tra tại: https://aistudio.google.com/app/apikey");
    return null;
  }
}

testModel()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Lỗi:", error);
    process.exit(1);
  });

