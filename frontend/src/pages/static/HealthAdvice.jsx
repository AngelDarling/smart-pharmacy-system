import React from 'react';

const HealthAdvice = () => {
    return (
        <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 20px' }}>
            <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1f2937' }}>Tư vấn sức khỏe</h1>
            <div style={{ background: 'white', padding: 30, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ lineHeight: 1.6, color: '#4b5563' }}>
                    Đội ngũ dược sĩ chuyên môn cao của Smart Pharmacy luôn sẵn sàng tư vấn miễn phí cho bạn.
                </p>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginTop: 24, marginBottom: 12 }}>Kênh tư vấn:</h3>
                <ul style={{ lineHeight: 1.6, color: '#4b5563', paddingLeft: 20 }}>
                    <li>Chat trực tiếp trên website (góc phải màn hình).</li>
                    <li>Gọi hotline 1800 6928 (Nhánh 1).</li>
                    <li>Nhắn tin qua Zalo OA Smart Pharmacy.</li>
                </ul>
                <p style={{ lineHeight: 1.6, color: '#4b5563', marginTop: 16 }}>
                    Lưu ý: Các tư vấn chỉ mang tính chất tham khảo. Vui lòng đến cơ sở y tế để được thăm khám chính xác.
                </p>
            </div>
        </div>
    );
};

export default HealthAdvice;
