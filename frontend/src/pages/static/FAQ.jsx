import React from 'react';

const FAQ = () => {
    return (
        <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 20px' }}>
            <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1f2937' }}>Câu hỏi thường gặp</h1>
            <div style={{ background: 'white', padding: 30, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginTop: 0, marginBottom: 12 }}>1. Tôi có thể hủy đơn hàng không?</h3>
                <p style={{ lineHeight: 1.6, color: '#4b5563' }}>
                    Bạn có thể hủy đơn hàng khi đơn hàng chưa được chuyển sang trạng thái "Đang giao hàng". Vui lòng liên hệ tổng đài để được hỗ trợ.
                </p>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginTop: 24, marginBottom: 12 }}>2. Phí vận chuyển là bao nhiêu?</h3>
                <p style={{ lineHeight: 1.6, color: '#4b5563' }}>
                    Phí vận chuyển phụ thuộc vào địa chỉ nhận hàng và giá trị đơn hàng. Đơn hàng trên 500k được miễn phí vận chuyển.
                </p>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginTop: 24, marginBottom: 12 }}>3. Bao lâu tôi nhận được hàng?</h3>
                <p style={{ lineHeight: 1.6, color: '#4b5563' }}>
                    Thời gian giao hàng từ 1-5 ngày tùy khu vực.
                </p>
            </div>
        </div>
    );
};

export default FAQ;
