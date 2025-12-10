import { Link } from 'react-router-dom';
import { getImageUrl, handleImageError } from "../../utils/imageUtils";

export default function RelatedProducts({ products, formatPrice, formatDiscountAmount }) {
    if (products.length === 0) return null;

    return (
        <div>
            <h2 style={{
                fontSize: 24,
                fontWeight: 700,
                color: '#1f2937',
                marginBottom: 20
            }}>
                Sản phẩm liên quan
            </h2>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 20
            }}>
                {products.map(rp => (
                    <Link
                        key={rp._id}
                        to={`/p/${rp.slug}`}
                        style={{ textDecoration: 'none' }}
                    >
                        <div style={{
                            background: 'white',
                            borderRadius: 12,
                            overflow: 'hidden',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                            }}
                        >
                            <div style={{
                                height: 200,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#f8f9fa',
                                padding: 16,
                                position: 'relative',
                                flexShrink: 0
                            }}>
                                <img
                                    src={getImageUrl(rp.imageUrls?.[0], '/default-product.svg')}
                                    alt={rp.name}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'contain'
                                    }}
                                    onError={(e) => handleImageError(e, '/default-product.svg')}
                                />
                                {rp.discount > 0 && (
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
                                        {rp.discountType === 'amount'
                                            ? `-${formatDiscountAmount(rp.discountValue)}`
                                            : `-${rp.discount}%`}
                                    </div>
                                )}
                            </div>
                            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', flex: 1 }}>
                                <h3 style={{
                                    fontSize: 15,
                                    fontWeight: 600,
                                    color: '#1f2937',
                                    margin: '0 0 8px',
                                    lineHeight: 1.4,
                                    minHeight: 42,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    flexShrink: 0
                                }}>
                                    {rp.name}
                                </h3>
                                <div style={{ minHeight: '48px', flexShrink: 0 }}>
                                    {rp.discount > 0 && rp.finalPrice !== undefined && rp.originalPrice !== undefined ? (
                                        <>
                                            <div style={{
                                                fontSize: 18,
                                                fontWeight: 700,
                                                color: '#3b82f6',
                                                marginBottom: 4
                                            }}>
                                                {formatPrice(rp.finalPrice)}₫
                                            </div>
                                            <div style={{
                                                fontSize: 13,
                                                color: '#9ca3af',
                                                textDecoration: 'line-through'
                                            }}>
                                                {formatPrice(rp.originalPrice)}₫
                                            </div>
                                        </>
                                    ) : (
                                        <div style={{
                                            fontSize: 18,
                                            fontWeight: 700,
                                            color: '#3b82f6'
                                        }}>
                                            {formatPrice(rp.price)}₫
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
