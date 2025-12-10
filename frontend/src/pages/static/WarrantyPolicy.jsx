import React from 'react';

const WarrantyPolicy = () => {
    return (
        <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 20px' }}>
            <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1f2937' }}>Chính sách bảo hành</h1>
            <div style={{ background: 'white', padding: 30, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ lineHeight: 1.6, color: '#4b5563' }}>
                    Áp dụng cho các sản phẩm thiết bị y tế và các sản phẩm có quy định bảo hành từ nhà sản xuất.
                </p>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginTop: 24, marginBottom: 12 }}>Điều kiện bảo hành:</h3>
                <ul style={{ lineHeight: 1.6, color: '#4b5563', paddingLeft: 20 }}>
                    <li>Sản phẩm còn trong thời hạn bảo hành.</li>
                    <li>Phiếu bảo hành còn nguyên vẹn, không tẩy xóa.</li>
                    <li>Lỗi kỹ thuật do nhà sản xuất.</li>
                </ul>
                <p style={{ lineHeight: 1.6, color: '#4b5563', marginTop: 16 }}>
                    Vui lòng mang sản phẩm đến cửa hàng gần nhất hoặc liên hệ tổng đài để được hỗ trợ.
                </p>
            </div>
        </div>
    );
};

export default WarrantyPolicy;
