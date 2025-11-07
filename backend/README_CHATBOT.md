# Hướng dẫn khắc phục lỗi "GEMINI_API_KEY chưa được cấu hình"

## Vấn đề
Nếu bạn thấy cảnh báo "⚠️ GEMINI_API_KEY chưa được cấu hình" mặc dù đã thêm API key vào file `.env`, có thể do:

1. **Server chưa được khởi động lại** sau khi thêm API key
2. **API key không đúng định dạng** trong file `.env`
3. **File .env ở sai vị trí** (phải ở thư mục `backend/`)

## Giải pháp

### Bước 1: Kiểm tra file .env
Đảm bảo file `.env` nằm trong thư mục `backend/` và có nội dung:
```env
GEMINI_API_KEY=AIzaSy... (API key của bạn)
```

**Lưu ý quan trọng:**
- Không có khoảng trắng xung quanh dấu `=`
- Không có dấu ngoặc kép `"` hoặc `'` bao quanh API key
- Mỗi dòng một biến môi trường

### Bước 2: Khởi động lại server
Sau khi thêm/sửa API key, **BẮT BUỘC** phải khởi động lại server:

```bash
# Dừng server hiện tại (Ctrl + C)
# Sau đó khởi động lại:
cd backend
npm run dev
```

### Bước 3: Kiểm tra log
Sau khi khởi động lại, bạn sẽ thấy một trong hai thông báo:

✅ **Thành công:**
```
✅ Gemini AI đã được khởi tạo thành công
```

⚠️ **Lỗi:**
```
⚠️  GEMINI_API_KEY chưa được cấu hình. Chatbot sẽ không hoạt động.
   Vui lòng thêm GEMINI_API_KEY vào file .env và khởi động lại server.
```

### Bước 4: Test chatbot
1. Mở website
2. Nhấp nút "AI TƯ VẤN" ở góc dưới bên phải
3. Gửi một tin nhắn test, ví dụ: "Xin chào"
4. Nếu chatbot trả lời được, nghĩa là đã hoạt động!

## Lưu ý bảo mật

⚠️ **KHÔNG BAO GIỜ** commit file `.env` lên Git!

File `.env` đã được thêm vào `.gitignore` để bảo vệ API key của bạn.

## Vẫn không hoạt động?

1. Kiểm tra API key có hợp lệ không tại: https://aistudio.google.com/app/apikey
2. Kiểm tra console log của backend để xem lỗi chi tiết
3. Đảm bảo không có khoảng trắng thừa trong file `.env`
4. Thử tạo API key mới nếu cần

