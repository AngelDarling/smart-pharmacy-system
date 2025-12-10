import { getImageUrl, handleImageError } from "../../utils/imageUtils";

export default function RecentlyViewedSection({
    recentlyViewed,
    scrollIndex,
    onScroll,
    onProductClick,
    onBuyClick,
    formatPrice,
    formatDiscountAmount
}) {
    if (recentlyViewed.length === 0) {
        return null;
    }

    const itemsPerPage = 6;
    const totalPages = Math.ceil(recentlyViewed.length / itemsPerPage);

    return (
        <div style={{ padding: '40px 0', background: '#f3f4f6' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
                <div style={{ position: 'relative' }}>
                    {/* Title */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                        <h2 style={{
                            fontSize: 24,
                            fontWeight: 700,
                            color: '#1f2937',
                            margin: 0
                        }}>
                            Sản phẩm vừa xem
                        </h2>
                    </div>

                    {/* Navigation buttons */}
                    {totalPages > 1 && (
                        <>
                            <button
                                onClick={() => onScroll('prev')}
                                disabled={scrollIndex === 0}
                                style={{
                                    position: 'absolute',
                                    left: 8,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'white',
                                    border: 'none',
                                    boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                                    borderRadius: '50%',
                                    width: 52,
                                    height: 52,
                                    padding: 0,
                                    lineHeight: '52px',
                                    cursor: scrollIndex === 0 ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 2,
                                    fontSize: 22,
                                    fontWeight: 700,
                                    color: '#333',
                                    opacity: scrollIndex === 0 ? 0.5 : 1
                                }}
                            >
                                ‹
                            </button>

                            <button
                                onClick={() => onScroll('next')}
                                disabled={scrollIndex === totalPages - 1}
                                style={{
                                    position: 'absolute',
                                    right: 8,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'white',
                                    border: 'none',
                                    boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                                    borderRadius: '50%',
                                    width: 52,
                                    height: 52,
                                    padding: 0,
                                    lineHeight: '52px',
                                    cursor: scrollIndex === totalPages - 1 ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 2,
                                    fontSize: 22,
                                    fontWeight: 700,
                                    color: '#333',
                                    opacity: scrollIndex === totalPages - 1 ? 0.5 : 1
                                }}
                            >
                                ›
                            </button>
                        </>
                    )}

                    {/* Slider viewport */}
                    <div style={{ overflow: 'hidden' }}>
                        {/* Slider track */}
                        <div style={{
                            display: 'flex',
                            width: `${totalPages * 100}%`,
                            transform: `translateX(-${scrollIndex * (100 / totalPages)}%)`,
                            transition: 'transform 400ms ease',
                            gap: 0
                        }}>
                            {Array.from({ length: totalPages }, (_, pageIndex) => {
                                const pageProducts = recentlyViewed.slice(
                                    pageIndex * itemsPerPage,
                                    (pageIndex + 1) * itemsPerPage
                                );

                                return (
                                    <div key={pageIndex} style={{ flex: `0 0 ${100 / totalPages}%`, padding: '0 2px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 20 }}>
                                            {pageProducts.map((product) => (
                                                <div
                                                    key={product._id}
                                                    onClick={() => onProductClick(product)}
                                                    style={{
                                                        background: 'white',
                                                        borderRadius: 16,
                                                        padding: 16,
                                                        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                                                        position: 'relative',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s ease',
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
                                                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
                                                    }}
                                                >
                                                    {product.discount > 0 && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            background: '#ef4444',
                                                            color: 'white',
                                                            padding: '4px 8px',
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
                                                    <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, flexShrink: 0 }}>
                                                        <img
                                                            src={getImageUrl(product.imageUrls?.[0] || product.images?.[0], '/default-product.png')}
                                                            alt={product.name}
                                                            style={{ maxWidth: '100%', maxHeight: 180, objectFit: 'contain' }}
                                                            onError={handleImageError}
                                                        />
                                                    </div>
                                                    <div style={{ fontSize: 14, fontWeight: 600, height: 44, color: '#0f172a', marginBottom: 10, flexShrink: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '22px' }}>{product.name}</div>
                                                    <div style={{ marginBottom: 10, flexShrink: 0 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: '24px', marginBottom: 4 }}>
                                                            <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: 16 }}>
                                                                {product.discount > 0 && product.finalPrice !== undefined
                                                                    ? formatPrice(product.finalPrice)
                                                                    : formatPrice(product.price)}₫
                                                            </span>
                                                        </div>
                                                        {product.discount > 0 && product.originalPrice !== undefined && (
                                                            <div style={{ fontSize: 13, color: '#9ca3af', textDecoration: 'line-through', height: '18px' }}>
                                                                {formatPrice(product.originalPrice)}₫
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onBuyClick(e, product);
                                                        }}
                                                        style={{
                                                            width: '100%',
                                                            background: '#2563eb',
                                                            color: 'white',
                                                            border: 'none',
                                                            padding: '10px 12px',
                                                            borderRadius: 8,
                                                            cursor: 'pointer',
                                                            fontWeight: 600,
                                                            transition: 'background-color 0.2s',
                                                            marginTop: 'auto',
                                                            flexShrink: 0
                                                        }}
                                                        onMouseEnter={(e) => e.target.style.background = '#1d4ed8'}
                                                        onMouseLeave={(e) => e.target.style.background = '#2563eb'}
                                                    >
                                                        Chọn mua
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
