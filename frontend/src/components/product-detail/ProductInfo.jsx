export default function ProductInfo({ product, averageRating, totalReviews }) {
    return (
        <div style={{ flex: 1 }}>
            <h1 style={{
                margin: '0 0 16px',
                fontSize: 28,
                fontWeight: 700,
                color: '#1f2937',
                lineHeight: 1.3
            }}>
                {product.name}
            </h1>

            {/* Rating & Stock */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                marginBottom: 20,
                paddingBottom: 20,
                borderBottom: '1px solid #e5e7eb'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {[1, 2, 3, 4, 5].map(star => {
                            const filled = averageRating >= star;
                            const halfFilled = averageRating >= star - 0.5 && averageRating < star;
                            return (
                                <span key={star} style={{ fontSize: 18, lineHeight: 1 }}>
                                    {filled ? (
                                        <span style={{ color: '#fbbf24' }}>★</span>
                                    ) : halfFilled ? (
                                        <span style={{ color: '#fbbf24', opacity: 0.5 }}>★</span>
                                    ) : (
                                        <span style={{ color: '#d1d5db' }}>☆</span>
                                    )}
                                </span>
                            );
                        })}
                    </div>
                    {averageRating > 0 && (
                        <span style={{ fontSize: 14, color: '#6b7280', fontWeight: 600 }}>
                            {averageRating.toFixed(1)}
                        </span>
                    )}
                    <span style={{ fontSize: 14, color: '#6b7280' }}>
                        ({totalReviews} đánh giá)
                    </span>
                </div>
                <span style={{ color: '#d1d5db' }}>|</span>
                <div style={{
                    fontSize: 14,
                    color: product.totalStock > 0 ? '#059669' : '#dc2626',
                    fontWeight: 600
                }}>
                    {product.totalStock > 0 ? `Còn hàng (${product.totalStock})` : 'Hết hàng'}
                </div>
            </div>
        </div>
    );
}
