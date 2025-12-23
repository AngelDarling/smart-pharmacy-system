import rateLimit from 'express-rate-limit';

/**
 * Giới hạn tần suất gọi API Chatbot để tránh spam và lạm dụng API key
 */
export const chatRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 20, // Tối đa 20 requests mỗi cửa sổ 15 phút
    message: {
        error: "Bạn đã gửi quá nhiều yêu cầu",
        reply: "Bạn đang gửi tin nhắn quá nhanh. Vui lòng đợi 15 phút trước khi tiếp tục trò chuyện với AI hoặc liên hệ hotline 1800 6928 để được hỗ trợ ngay."
    },
    standardHeaders: true, // Trả về thông tin giới hạn trong headers `RateLimit-*`
    legacyHeaders: false, // Tắt headers `X-RateLimit-*` cũ
});
