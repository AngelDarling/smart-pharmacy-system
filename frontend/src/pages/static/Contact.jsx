import React from 'react';

const Contact = () => {
    return (
        <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 20px' }}>
            <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1f2937' }}>Liên hệ</h1>
            <div style={{ background: 'white', padding: 30, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ lineHeight: 1.6, color: '#4b5563' }}>
                    Chúng tôi luôn sẵn sàng lắng nghe ý kiến của bạn.
                </p>
                <div style={{ marginTop: 20 }}>
                    <p style={{ marginBottom: 10 }}><strong>Địa chỉ:</strong> 123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</p>
                    <p style={{ marginBottom: 10 }}><strong>Hotline:</strong> 1800 6928</p>
                    <p style={{ marginBottom: 10 }}><strong>Email:</strong> contact@smartpharmacy.com</p>
                    <p style={{ marginBottom: 10 }}><strong>Thời gian làm việc:</strong> 8:00 - 22:00 hàng ngày</p>
                </div>
            </div>
        </div>
    );
};

export default Contact;
