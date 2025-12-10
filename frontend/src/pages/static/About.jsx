import React from 'react';

const About = () => {
    return (
        <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 20px' }}>
            <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1f2937' }}>Giới thiệu</h1>
            <div style={{ background: 'white', padding: 30, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ lineHeight: 1.6, color: '#4b5563' }}>
                    Chào mừng đến với <strong>Nhà thuốc Smart Pharmacy</strong> - Hệ thống nhà thuốc thông minh hàng đầu.
                </p>
                <p style={{ lineHeight: 1.6, color: '#4b5563', marginTop: 16 }}>
                    Chúng tôi cam kết mang đến cho khách hàng những sản phẩm chất lượng, chính hãng với giá cả hợp lý nhất.
                    Đội ngũ dược sĩ giàu kinh nghiệm của chúng tôi luôn sẵn sàng tư vấn và hỗ trợ bạn mọi lúc, mọi nơi.
                </p>
                <p style={{ lineHeight: 1.6, color: '#4b5563', marginTop: 16 }}>
                    Nội dung chi tiết đang được cập nhật...
                </p>
            </div>
        </div>
    );
};

export default About;
