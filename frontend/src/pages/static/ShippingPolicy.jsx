import React from 'react';

const ShippingPolicy = () => {
    return (
        <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 20px' }}>
            <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1f2937' }}>Chính sách giao hàng</h1>
            <div style={{ background: 'white', padding: 30, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ lineHeight: 1.6, color: '#4b5563' }}>
                    Smart Pharmacy cung cấp dịch vụ giao hàng tận nơi trên toàn quốc.
                </p>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginTop: 24, marginBottom: 12 }}>Thời gian giao hàng:</h3>
                <ul style={{ lineHeight: 1.6, color: '#4b5563', paddingLeft: 20 }}>
                    <li>Nội thành TP.HCM: 1-2 ngày làm việc.</li>
                    <li>Các tỉnh thành khác: 3-5 ngày làm việc.</li>
                </ul>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginTop: 24, marginBottom: 12 }}>Phí vận chuyển:</h3>
                <p style={{ lineHeight: 1.6, color: '#4b5563' }}>
                    Miễn phí vận chuyển cho đơn hàng từ 500.000đ trở lên.
                </p>
            </div>
        </div>
    );
};

export default ShippingPolicy;
