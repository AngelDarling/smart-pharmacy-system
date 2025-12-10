import React from 'react';

const ReturnPolicy = () => {
    return (
        <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 20px' }}>
            <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1f2937' }}>Chính sách đổi trả</h1>
            <div style={{ background: 'white', padding: 30, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ lineHeight: 1.6, color: '#4b5563' }}>
                    Smart Pharmacy hỗ trợ đổi trả sản phẩm trong vòng <strong>7 ngày</strong> kể từ ngày nhận hàng.
                </p>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginTop: 24, marginBottom: 12 }}>Điều kiện đổi trả:</h3>
                <ul style={{ lineHeight: 1.6, color: '#4b5563', paddingLeft: 20 }}>
                    <li>Sản phẩm còn nguyên tem, mác, chưa qua sử dụng.</li>
                    <li>Sản phẩm bị lỗi do nhà sản xuất hoặc hư hỏng trong quá trình vận chuyển.</li>
                    <li>Có hóa đơn mua hàng hoặc xác nhận đơn hàng.</li>
                </ul>
                <p style={{ lineHeight: 1.6, color: '#4b5563', marginTop: 16 }}>
                    Vui lòng liên hệ tổng đài 1800 6928 để được hướng dẫn chi tiết.
                </p>
            </div>
        </div>
    );
};

export default ReturnPolicy;
