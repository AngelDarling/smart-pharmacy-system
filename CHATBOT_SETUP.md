# Hướng dẫn tích hợp AI Chatbot với Gemini

## Tổng quan

Hệ thống đã được tích hợp AI Chatbot sử dụng Google Gemini với kỹ thuật RAG (Retrieval-Augmented Generation) để tư vấn sản phẩm thông minh.

## Các tính năng

- ✅ Tìm kiếm sản phẩm thông minh từ database
- ✅ Tư vấn sản phẩm bằng AI Gemini
- ✅ Hiển thị sản phẩm đề xuất trong chat
- ✅ UI/UX hiện đại và thân thiện
- ✅ Responsive design

## Cài đặt

### 1. Cài đặt dependencies

Dependencies đã được cài đặt tự động:
```bash
cd backend
npm install @google/generative-ai
```

### 2. Lấy API Key từ Google AI Studio

1. Truy cập: https://aistudio.google.com/app/apikey
2. Đăng nhập bằng tài khoản Google
3. Nhấp "Get API key" hoặc "Create API key"
4. Chọn "Create API key in new project"
5. Sao chép API key (một chuỗi ký tự dài)

### 3. Cấu hình API Key

1. Tạo file `.env` trong thư mục `backend/` (nếu chưa có)
2. Thêm dòng sau vào file `.env`:

```env
GEMINI_API_KEY=YOUR_API_KEY_HERE
```

**Lưu ý:** Thay `YOUR_API_KEY_HERE` bằng API key thật của bạn.

### 4. Khởi động lại server

Sau khi thêm API key, khởi động lại backend server:

```bash
cd backend
npm run dev
```

Bạn sẽ thấy thông báo:
```
✅ Gemini AI đã được khởi tạo thành công
```

Nếu không có API key, bạn sẽ thấy cảnh báo:
```
⚠️  GEMINI_API_KEY chưa được cấu hình. Chatbot sẽ không hoạt động.
```

## Sử dụng

1. Mở website
2. Cuộn xuống cuối trang, bạn sẽ thấy nút "AI TƯ VẤN" ở góc dưới bên phải
3. Nhấp vào nút để mở chatbot
4. Nhập câu hỏi của bạn, ví dụ:
   - "Tôi cần thuốc giảm đau"
   - "Có sản phẩm nào cho trẻ em không?"
   - "Tư vấn về vitamin C"
   - "Sản phẩm nào tốt cho da?"

## Cấu trúc code

### Backend

- `backend/routes/chat.js` - Route handler cho API chat
- `backend/controllers/chatController.js` - Logic RAG và xử lý chat
- `backend/app.js` - Đã thêm route `/api/chat`

### Frontend

- `frontend/src/components/Chatbot.jsx` - Component chatbot UI
- `frontend/src/components/Footer.jsx` - Đã tích hợp chatbot button

## Cách hoạt động (RAG)

1. **Retrieval (Truy vấn)**: Khi người dùng nhập câu hỏi, hệ thống tìm kiếm sản phẩm liên quan trong MongoDB
2. **Augmented (Bổ sung)**: Tạo context từ danh sách sản phẩm tìm được
3. **Generation (Tạo câu trả lời)**: Gửi context và câu hỏi đến Gemini AI để tạo câu trả lời thông minh

## Xử lý lỗi

Nếu chatbot không hoạt động:

1. Kiểm tra API key trong file `.env`
2. Kiểm tra console log của backend để xem có lỗi không
3. Đảm bảo backend server đang chạy
4. Kiểm tra kết nối internet (cần để gọi Gemini API)

## Lưu ý

- API key miễn phí có giới hạn số lượng request. Xem chi tiết tại: https://ai.google.dev/pricing
- Trong môi trường production, nên thêm rate limiting để tránh lạm dụng
- Có thể tùy chỉnh prompt trong `backend/controllers/chatController.js` để thay đổi cách AI trả lời

## Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra logs của backend
2. Kiểm tra console của browser
3. Đảm bảo MongoDB đang chạy và có dữ liệu sản phẩm

