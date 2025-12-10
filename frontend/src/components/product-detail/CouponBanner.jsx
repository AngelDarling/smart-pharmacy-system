export default function CouponBanner({ coupon, formatPrice }) {
    if (!coupon) return null;

    return (
        <div style={{
            background: 'white',
            borderRadius: 8,
            border: '1px solid #f0f0f0',
            marginBottom: 24,
            overflow: 'hidden'
        }}>
            <div style={{
                background: '#fff7e6',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 8
            }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fa8c16" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6M12 16h.01" />
                </svg>
                <span style={{ color: '#fa8c16', fontWeight: 600, fontSize: 14 }}>
                    Khuyến mãi được áp dụng
                </span>
            </div>
            <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                    width: 48,
                    height: 48,
                    background: '#e6f7ff',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1890ff" strokeWidth="2">
                        <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                    </svg>
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 500, color: '#262626', marginBottom: 4 }}>
                        Giảm ngay {coupon.discountType === 'percent'
                            ? `${coupon.discountValue}%`
                            : `${formatPrice(coupon.discountValue)}₫`}
                        {coupon.endDate && (
                            <span style={{ color: '#8c8c8c', fontWeight: 400 }}>
                                {' '}áp dụng đến {new Date(coupon.endDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                            </span>
                        )}
                    </div>
                    {coupon.description && (
                        <div style={{ fontSize: 13, color: '#8c8c8c' }}>
                            {coupon.description}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
