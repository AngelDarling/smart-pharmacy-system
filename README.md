# 💊 Smart Pharmacy System

## 📌 Giới thiệu

Đề tài **Xây dựng hệ thống quản lý bán thuốc trực tuyến tích hợp chatbot tư vấn sản phẩm**
**Smart Pharmacy System** là nền tảng thương mại điện tử toàn diện dành cho nhà thuốc, cung cấp giải pháp quản lý và bán hàng trực tuyến hiện đại.

### ✨ Tính năng chính

#### 🏪 Quản lý nhà thuốc
- **Quản lý sản phẩm**: Thuốc, thực phẩm chức năng, dược mỹ phẩm
- **Quản lý kho**: Nhập/xuất kho, cảnh báo tồn kho, theo dõi hạn sử dụng
- **Quản lý đơn hàng**: Xử lý đơn hàng, cập nhật trạng thái, in hóa đơn
- **Quản lý khách hàng**: Thông tin khách hàng, lịch sử mua hàng, điểm thưởng
- **Báo cáo thống kê**: Dashboard analytics, báo cáo doanh thu, sản phẩm bán chạy

#### 🛒 Mua sắm trực tuyến
- Tìm kiếm và lọc sản phẩm thông minh
- Giỏ hàng và thanh toán trực tuyến
- Theo dõi đơn hàng realtime
- Đánh giá và nhận xét sản phẩm
- Chương trình khuyến mãi và tích điểm

#### 🤖 AI Chatbot (RAG)
- Tư vấn sản phẩm thông minh với **Google Gemini AI**
- Tìm kiếm sản phẩm bằng ngôn ngữ tự nhiên
- Đề xuất sản phẩm phù hợp với nhu cầu
- Trả lời câu hỏi về thuốc và sức khỏe

#### 💳 Thanh toán đa dạng
- **MoMo**: Thanh toán qua ví điện tử MoMo
- **VNPay**: Thanh toán qua cổng VNPay (ATM, Visa, MasterCard)
- **COD**: Thanh toán khi nhận hàng

#### 📊 Kiểm tra sức khỏe
- Bài kiểm tra sàng lọc sức khỏe trực tuyến
- Đánh giá nguy cơ bệnh lý
- Đề xuất sản phẩm phù hợp với tình trạng sức khỏe

---

## 🛠️ Công nghệ sử dụng

### Frontend
- **Framework**: React 19 + Vite
- **Routing**: React Router DOM v7
- **UI Libraries**: 
  - Ant Design (AntD) - UI components chính
  - Material-UI (MUI) - Bổ sung components
  - React Icons - Icon library
- **State Management**: React Hooks
- **Styling**: CSS, Emotion
- **Charts**: Recharts
- **Forms**: React Quill (Rich text editor)
- **Animations**: Framer Motion
- **HTTP Client**: Axios
- **Notifications**: SweetAlert2

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js v5
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer + Cloudinary
- **Payment Gateways**:
  - MoMo Payment Gateway
  - VNPay
- **AI Integration**: Google Gemini AI (`@google/genai`)
- **Validation**: Zod
- **Scheduling**: node-cron
- **Rate Limiting**: express-rate-limit
- **Logging**: Morgan

### Database
- **MongoDB**: NoSQL database
- **Mongoose**: ODM (Object Data Modeling)

### AI & Machine Learning
- **Google Gemini AI**: Chatbot tư vấn sản phẩm với kỹ thuật RAG (Retrieval-Augmented Generation)

### DevOps & Tools
- **Development**: Nodemon (auto-reload)
- **Environment**: Dotenv
- **CORS**: Cross-Origin Resource Sharing
- **Testing**: Ngrok (IPN testing)

---

## � Cấu trúc dự án

```
smart-pharmacy-system/
├── backend/                 # Backend API
│   ├── config/             # Database & app configuration
│   ├── controllers/        # Request handlers
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utility functions
│   ├── scripts/            # Utility scripts
│   └── server.js           # Entry point
│
├── frontend/               # React frontend
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── App.jsx         # Main app component
│   └── index.html
│
├── CHATBOT_SETUP.md        # Hướng dẫn setup Gemini AI
├── MOMO_SETUP.md           # Hướng dẫn setup MoMo
├── VNPAY_SETUP.md          # Hướng dẫn setup VNPay
├── NGROK_SETUP.md          # Hướng dẫn setup Ngrok
└── README.md               # Tài liệu này
```

---

## 🚀 Cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js >= 18.x
- MongoDB >= 6.x
- npm hoặc yarn

### 1. Clone repository
```bash
git clone <repository-url>
cd smart-pharmacy-system
```

### 2. Cài đặt Backend
```bash
cd backend
npm install
```

Tạo file `.env` trong thư mục `backend/`:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/smart-pharmacy

# JWT
JWT_SECRET=your_jwt_secret_key

# Cloudinary (Upload ảnh)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# MoMo Payment
MOMO_PARTNER_CODE=your_partner_code
MOMO_ACCESS_KEY=your_access_key
MOMO_SECRET_KEY=your_secret_key
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
MOMO_IPN_URL=your_backend_url/api/payment/momo/ipn
MOMO_REDIRECT_URL=your_frontend_url/order-success

# VNPay Payment
VNPAY_TMN_CODE=your_tmn_code
VNPAY_HASH_SECRET=your_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn
VNPAY_RETURN_URL=your_frontend_url/order-success
VNPAY_IPN_URL=your_backend_url/api/payment/vnpay/ipn
```

Khởi động backend:
```bash
npm run dev
```

### 3. Cài đặt Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Truy cập ứng dụng
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

---

## 📚 Tài liệu hướng dẫn

- [Hướng dẫn setup Gemini AI Chatbot](CHATBOT_SETUP.md)
- [Hướng dẫn tích hợp MoMo Payment](MOMO_SETUP.md)
- [Hướng dẫn tích hợp VNPay Payment](VNPAY_SETUP.md)
- [Hướng dẫn setup Ngrok cho IPN testing](NGROK_SETUP.md)
- [Debug Gemini API](backend/DEBUG_GEMINI.md)

---

## 🎯 Tính năng nổi bật

### 1. AI Chatbot với RAG
- Sử dụng Google Gemini AI để tư vấn sản phẩm
- Tìm kiếm thông minh trong database
- Đề xuất sản phẩm dựa trên ngữ cảnh

### 2. Quản lý kho thông minh
- Cảnh báo tồn kho thấp
- Theo dõi hạn sử dụng
- Báo cáo nhập/xuất kho

### 3. Thanh toán đa dạng
- Tích hợp MoMo và VNPay
- Xử lý IPN (Instant Payment Notification)
- Cập nhật trạng thái đơn hàng tự động

### 4. Dashboard Analytics
- Thống kê doanh thu theo thời gian
- Biểu đồ sản phẩm bán chạy
- Phân tích xu hướng mua hàng

---

## 👥 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng tạo issue hoặc pull request.

---

## 📄 License

[MIT License](LICENSE)

---

## 📧 Liên hệ

Nếu có bất kỳ câu hỏi nào, vui lòng liên hệ qua email hoặc tạo issue trên GitHub.