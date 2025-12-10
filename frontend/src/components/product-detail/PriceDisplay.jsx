export default function PriceDisplay({ product, directCoupon, formatPrice, formatDiscountAmount }) {
    // Tính giá sau khi áp dụng coupon trực tiếp
    let finalPrice = product.price;
    let discountAmount = 0;
    let originalPrice = product.price;

    if (directCoupon) {
        originalPrice = product.price;
        if (directCoupon.discountType === 'percent') {
            discountAmount = Math.round(product.price * directCoupon.discountValue / 100);
            if (directCoupon.maxDiscount && discountAmount > directCoupon.maxDiscount) {
                discountAmount = directCoupon.maxDiscount;
            }
        } else {
            discountAmount = directCoupon.discountValue;
        }
        finalPrice = Math.max(0, product.price - discountAmount);
    }

    return (
        <div style={{ marginBottom: 24 }}>
            {directCoupon ? (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <div style={{
                            fontSize: 36,
                            fontWeight: 700,
                            color: '#dc2626',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                        }}>
                            {formatPrice(finalPrice)}₫
                            <span style={{ fontSize: 36, color: '#dc2626', fontWeight: 400 }}>
                                / {product.unit || 'Hộp'}
                            </span>
                        </div>
                        <span style={{
                            background: '#dc2626',
                            color: 'white',
                            padding: '6px 14px',
                            borderRadius: 20,
                            fontSize: 14,
                            fontWeight: 600
                        }}>
                            {directCoupon.discountType === 'percent'
                                ? `-${directCoupon.discountValue}%`
                                : `-${formatDiscountAmount(directCoupon.discountValue)}`}
                        </span>
                    </div>
                    <span style={{
                        fontSize: 20,
                        color: '#9ca3af',
                        textDecoration: 'line-through',
                        fontWeight: 500
                    }}>
                        {formatPrice(originalPrice)}₫
                    </span>
                </div>
            ) : (
                <div>
                    <div style={{
                        fontSize: 36,
                        fontWeight: 700,
                        color: '#3b82f6',
                        marginBottom: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                    }}>
                        {formatPrice(product.price)}₫
                        <span style={{ fontSize: 36, color: '#3b82f6', fontWeight: 400 }}>
                            / {product.unit || 'Hộp'}
                        </span>
                    </div>
                    {product.discount > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{
                                fontSize: 20,
                                color: '#9ca3af',
                                textDecoration: 'line-through'
                            }}>
                                {formatPrice(Math.round(product.price / (1 - product.discount / 100)))}₫
                            </span>
                            <span style={{
                                background: '#dc2626',
                                color: 'white',
                                padding: '6px 14px',
                                borderRadius: 20,
                                fontSize: 14,
                                fontWeight: 600
                            }}>
                                {product.discountType === 'amount' && product.discountValue
                                    ? `-${formatDiscountAmount(product.discountValue)}`
                                    : `-${product.discount}%`}
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
