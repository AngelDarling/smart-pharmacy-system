import React from 'react';

const License = () => {
    return (
        <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 20px' }}>
            <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1f2937' }}>Giấy phép kinh doanh</h1>
            <div style={{ background: 'white', padding: 30, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ lineHeight: 1.6, color: '#4b5563' }}>
                    <strong>Công ty Cổ phần Dược phẩm Smart Pharmacy</strong>
                </p>
                <ul style={{ lineHeight: 1.6, color: '#4b5563', marginTop: 16, paddingLeft: 20 }}>
                    <li>Mã số thuế: 0123456789</li>
                    <li>Ngày cấp: 01/01/2024</li>
                    <li>Nơi cấp: Sở Kế hoạch và Đầu tư TP. Hồ Chí Minh</li>
                    <li>Người đại diện pháp luật: Nguyễn Văn A</li>
                </ul>
                <p style={{ lineHeight: 1.6, color: '#4b5563', marginTop: 16 }}>
                    Giấy chứng nhận đủ điều kiện kinh doanh dược số: 1234/ĐKKDD-HCM
                </p>
            </div>
        </div>
    );
};

export default License;
