import React from 'react';

const Terms = () => {
    return (
        <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 20px' }}>
            <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1f2937' }}>Điều khoản sử dụng</h1>
            <div style={{ background: 'white', padding: 30, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ lineHeight: 1.6, color: '#4b5563' }}>
                    Chào mừng bạn đến với website Smart Pharmacy. Khi truy cập và sử dụng website này, bạn đồng ý tuân thủ các điều khoản sau đây:
                </p>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginTop: 24, marginBottom: 12 }}>1. Quyền sở hữu trí tuệ</h3>
                <p style={{ lineHeight: 1.6, color: '#4b5563' }}>
                    Mọi nội dung trên website bao gồm hình ảnh, văn bản, logo đều thuộc sở hữu của Smart Pharmacy.
                </p>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginTop: 24, marginBottom: 12 }}>2. Trách nhiệm người dùng</h3>
                <p style={{ lineHeight: 1.6, color: '#4b5563' }}>
                    Bạn cam kết cung cấp thông tin chính xác khi đăng ký tài khoản và mua hàng.
                </p>
                <p style={{ lineHeight: 1.6, color: '#4b5563', marginTop: 16 }}>
                    Nội dung chi tiết đang được cập nhật...
                </p>
            </div>
        </div>
    );
};

export default Terms;
