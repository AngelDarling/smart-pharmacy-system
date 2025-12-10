import { getImageUrl, handleImageError } from "../../utils/imageUtils";

export default function ProductsGrid({ products, loading, onProductClick, onBuyClick, formatPrice, formatDiscountAmount, capitalizeFirstLetter }) {
    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
                <div style={{ fontSize: 18 }}>Đang tải sản phẩm...</div>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '60px' }}>
                <div style={{ fontSize: 18, color: '#6b7280', marginBottom: 8 }}>
                    Không tìm thấy sản phẩm nào
                </div>
                <div style={{ color: '#9ca3af' }}>
                    Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm từ khóa khác
                </div>
            </div>
        );
    }

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16
        }}>
            {products.map(product => (
                <div
                    key={product._id}
                    onClick={() => onProductClick(product)}
                    style={{
                        background: 'white',
                        borderRadius: 12,
                        overflow: 'hidden',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                    }}
                >
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div style={{ padding: 8, backgroundColor: '#ffffff', height: 200 }}>
                            <img
                                src={getImageUrl(product.imageUrls?.[0], '/default-product.svg')}
                                alt={product.name}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    display: 'block',
                                    borderRadius: 8,
                                    backgroundColor: '#ffffff'
                                }}
                                onError={(e) => handleImageError(e, '/default-product.svg')}
                            />
                        </div>
                        {product.discount > 0 && (
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                background: '#dc2626',
                                color: 'white',
                                padding: '6px 12px',
                                borderTopLeftRadius: 12,
                                borderBottomRightRadius: 12,
                                fontSize: 12,
                                fontWeight: 700,
                                zIndex: 1
                            }}>
                                {product.discountType === 'amount'
                                    ? `-${formatDiscountAmount(product.discountValue)}`
                                    : `-${product.discount}%`}
                            </div>
                        )}
                    </div>

                    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <h3 style={{
                            margin: '0 0 10px',
                            fontSize: 15,
                            fontWeight: 600,
                            color: '#1f2937',
                            lineHeight: 1.4,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            minHeight: '42px',
                            flexShrink: 0
                        }}>
                            {product.name}
                        </h3>

                        <div style={{ marginBottom: 10, flexShrink: 0 }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'baseline',
                                gap: 6,
                                marginBottom: 4,
                                flexWrap: 'wrap',
                                height: '24px'
                            }}>
                                <span style={{
                                    fontSize: 18,
                                    fontWeight: 700,
                                    color: '#3b82f6',
                                    lineHeight: 1.2
                                }}>
                                    {product.discount > 0 && product.finalPrice !== undefined
                                        ? formatPrice(product.finalPrice)
                                        : formatPrice(product.price)}₫
                                </span>
                                <span style={{ fontSize: 13, color: '#3b82f6' }}>
                                    / {product.unit || 'cái'}
                                </span>
                            </div>
                            {product.discount > 0 && product.originalPrice !== undefined && (
                                <div style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.2, height: '18px' }}>
                                    <span style={{ textDecoration: 'line-through' }}>
                                        {formatPrice(product.originalPrice)}₫
                                    </span>
                                </div>
                            )}
                        </div>

                        <div style={{ marginBottom: 14, flexShrink: 0 }}>
                            <span style={{
                                display: 'inline-block',
                                padding: '4px 10px',
                                fontSize: 12,
                                fontWeight: 600,
                                color: '#374151',
                                backgroundColor: '#f3f4f6',
                                borderRadius: 6,
                                border: 'none',
                                cursor: 'default'
                            }}>
                                {capitalizeFirstLetter(product.unit || 'cái')}
                            </span>
                        </div>

                        <button
                            onClick={(e) => onBuyClick(e, product)}
                            style={{
                                width: '100%',
                                padding: '11px 16px',
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: 8,
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                marginTop: 'auto'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#2563eb'}
                            onMouseLeave={(e) => e.target.style.background = '#3b82f6'}
                        >
                            Chọn mua
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
