import { getImageUrl, handleImageError } from "../../utils/imageUtils";

export default function ProductsList({ products, loading, onProductClick, onBuyClick, formatPrice, formatDiscountAmount, capitalizeFirstLetter }) {
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
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
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
                        display: 'flex',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                    }}
                >
                    {/* Product Image */}
                    <div style={{ width: 200, flexShrink: 0, position: 'relative' }}>
                        <div style={{ padding: 8, backgroundColor: '#ffffff' }}>
                            <img
                                src={getImageUrl(product.imageUrls?.[0], '/default-product.svg')}
                                alt={product.name}
                                style={{
                                    width: '100%',
                                    height: 184,
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

                    {/* Product Info */}
                    <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                            <h3 style={{
                                margin: '0 0 10px',
                                fontSize: 18,
                                fontWeight: 600,
                                color: '#1f2937',
                                lineHeight: 1.4
                            }}>
                                {product.name}
                            </h3>

                            <div style={{ marginBottom: 12 }}>
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

                            <div style={{ marginBottom: 12 }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'baseline',
                                    gap: 8,
                                    marginBottom: 4,
                                    height: '32px'
                                }}>
                                    <span style={{
                                        fontSize: 24,
                                        fontWeight: 700,
                                        color: '#3b82f6'
                                    }}>
                                        {product.discount > 0 && product.finalPrice !== undefined
                                            ? formatPrice(product.finalPrice)
                                            : formatPrice(product.price)}₫
                                    </span>
                                    <span style={{ fontSize: 14, color: '#3b82f6' }}>
                                        / {product.unit || 'cái'}
                                    </span>
                                </div>
                                {product.discount > 0 && product.originalPrice !== undefined && (
                                    <div style={{ fontSize: 14, color: '#9ca3af', height: '20px' }}>
                                        <span style={{ textDecoration: 'line-through' }}>
                                            {formatPrice(product.originalPrice)}₫
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={(e) => onBuyClick(e, product)}
                            style={{
                                width: 'fit-content',
                                padding: '12px 32px',
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: 8,
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
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
