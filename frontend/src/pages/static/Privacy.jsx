import React from 'react';

const Privacy = () => {
    return (
        <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 20px' }}>
            <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1f2937' }}>Chính sách bảo mật</h1>
            <div style={{ background: 'white', padding: 30, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ lineHeight: 1.6, color: '#4b5563' }}>
                    Smart Pharmacy cam kết bảo mật thông tin cá nhân của khách hàng. Chúng tôi chỉ sử dụng thông tin của bạn để xử lý đơn hàng và cải thiện trải nghiệm dịch vụ.
                </p>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginTop: 24, marginBottom: 12 }}>1. Thu thập thông tin</h3>
                <p style={{ lineHeight: 1.6, color: '#4b5563' }}>
                    Chúng tôi thu thập thông tin khi bạn đăng ký tài khoản, đặt hàng hoặc đăng ký nhận bản tin.
                </p>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginTop: 24, marginBottom: 12 }}>2. Sử dụng thông tin</h3>
                <p style={{ lineHeight: 1.6, color: '#4b5563' }}>
                    Thông tin được sử dụng để xử lý đơn hàng, giao hàng, thanh toán và thông báo về tình trạng đơn hàng.
                </p>
                <p style={{ lineHeight: 1.6, color: '#4b5563', marginTop: 16 }}>
                    Nội dung chi tiết đang được cập nhật...
                </p>
            </div>
        </div>
    );
};

export default Privacy;
