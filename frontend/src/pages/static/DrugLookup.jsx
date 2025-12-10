import React from 'react';

const DrugLookup = () => {
    return (
        <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 20px' }}>
            <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1f2937' }}>Tra cứu thuốc</h1>
            <div style={{ background: 'white', padding: 30, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ lineHeight: 1.6, color: '#4b5563' }}>
                    Tính năng tra cứu thông tin thuốc đang được phát triển và sẽ sớm ra mắt.
                </p>
                <p style={{ lineHeight: 1.6, color: '#4b5563', marginTop: 16 }}>
                    Trong thời gian chờ đợi, bạn có thể sử dụng thanh tìm kiếm ở đầu trang để tìm sản phẩm hoặc liên hệ dược sĩ để được tư vấn.
                </p>
            </div>
        </div>
    );
};

export default DrugLookup;
