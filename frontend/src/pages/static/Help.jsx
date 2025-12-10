import React from 'react';

const Help = () => {
    return (
        <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 20px' }}>
            <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1f2937' }}>Hướng dẫn mua hàng</h1>
            <div style={{ background: 'white', padding: 30, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginTop: 0, marginBottom: 12 }}>Bước 1: Tìm kiếm sản phẩm</h3>
                <p style={{ lineHeight: 1.6, color: '#4b5563' }}>
                    Sử dụng thanh tìm kiếm hoặc duyệt qua danh mục sản phẩm để tìm sản phẩm bạn cần.
                </p>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginTop: 24, marginBottom: 12 }}>Bước 2: Thêm vào giỏ hàng</h3>
                <p style={{ lineHeight: 1.6, color: '#4b5563' }}>
                    Chọn số lượng và nhấn nút "Thêm vào giỏ hàng".
                </p>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginTop: 24, marginBottom: 12 }}>Bước 3: Thanh toán</h3>
                <p style={{ lineHeight: 1.6, color: '#4b5563' }}>
                    Vào giỏ hàng, kiểm tra lại đơn hàng và nhấn "Thanh toán". Điền thông tin giao hàng và chọn phương thức thanh toán.
                </p>
            </div>
        </div>
    );
};

export default Help;
