# Hướng dẫn Debug Gemini API

## Vấn đề: Model không tìm thấy (404 Not Found)

Nếu bạn gặp lỗi "models/xxx is not found for API version v1beta", có thể do:

### 1. API Key không có quyền truy cập model

**Giải pháp:**
- Kiểm tra API key tại: https://aistudio.google.com/app/apikey
- Đảm bảo API key còn hiệu lực
- Tạo API key mới nếu cần

### 2. Model name không đúng

Hệ thống sẽ tự động thử các model names sau theo thứ tự:
1. `gemini-1.5-flash-latest` (mới nhất, nhanh)
2. `gemini-1.5-pro-latest` (pro mới nhất)
3. `gemini-pro` (cơ bản)
4. `gemini-1.0-pro` (cũ hơn)

### 3. Kiểm tra model có sẵn

Bạn có thể test API key bằng cách chạy script sau:

```javascript
// test-gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌ GEMINI_API_KEY không tồn tại trong .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

// Thử các model
const models = [
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro-latest",
  "gemini-pro",
  "gemini-1.0-pro"
];

async function testModels() {
  for (const modelName of models) {
    try {
      console.log(`\n🧪 Đang test model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Xin chào");
      const response = await result.response;
      const text = response.text();
      console.log(`✅ ${modelName} hoạt động tốt!`);
      console.log(`   Response: ${text.substring(0, 50)}...`);
      return modelName; // Trả về model đầu tiên hoạt động
    } catch (error) {
      console.log(`❌ ${modelName} không hoạt động: ${error.message}`);
    }
  }
  console.log("\n⚠️  Không có model nào hoạt động!");
  return null;
}

testModels().then((workingModel) => {
  if (workingModel) {
    console.log(`\n✅ Model hoạt động: ${workingModel}`);
    console.log(`\n💡 Cập nhật model name trong chatController.js thành: "${workingModel}"`);
  }
});
```

Chạy script:
```bash
cd backend
node test-gemini.js
```

### 4. Sử dụng API v1 thay vì v1beta

Nếu tất cả model đều không hoạt động, có thể cần cập nhật SDK:

```bash
cd backend
npm install @google/generative-ai@latest
```

### 5. Kiểm tra quota và billing

- Đảm bảo API key có quota còn lại
- Kiểm tra billing tại Google Cloud Console
- Một số model có thể yêu cầu billing enabled

## Thông tin hữu ích

- Documentation: https://ai.google.dev/docs
- Model list: https://ai.google.dev/models
- API status: https://status.cloud.google.com/

## Liên hệ hỗ trợ

Nếu vẫn gặp vấn đề, vui lòng:
1. Kiểm tra log chi tiết trong console
2. Test API key bằng script trên
3. Kiểm tra documentation mới nhất của Google

