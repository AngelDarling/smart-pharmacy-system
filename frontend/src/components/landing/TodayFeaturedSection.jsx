import { getImageUrl, handleImageError } from "../../utils/imageUtils";

export default function TodayFeaturedSection({ products, page = 0, onPrev, onNext, onProductClick, onBuyClick }) {
    const pageSize = 6;
    const totalPages = Math.ceil((products?.length || 0) / pageSize) || 1;
    const pages = Array.from({ length: totalPages }, (_, i) =>
        (products || []).slice(i * pageSize, i * pageSize + pageSize)
    );

    if (!products || products.length === 0) {
        return null;
    }

    return (
        <div style={{ padding: "50px 0", background: "#e6f3ff" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
                <h2 style={{
                    fontSize: 28,
                    fontWeight: 700,
                    margin: "0 0 30px",
                    textAlign: "center",
                    color: "#2c3e50"
                }}>
                    Sản phẩm nổi bật hôm nay
                </h2>

                <div style={{ position: "relative" }}>
                    {/* Navigation buttons */}
                    {totalPages > 1 && (
                        <>
                            <button
                                onClick={onPrev}
                                disabled={page === 0}
                                style={{
                                    position: "absolute",
                                    left: -20,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    background: "rgba(255,255,255,0.9)",
                                    border: "none",
                                    borderRadius: "50%",
                                    width: 40,
                                    height: 40,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: page === 0 ? "not-allowed" : "pointer",
                                    opacity: page === 0 ? 0.5 : 1,
                                    zIndex: 2,
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
                                }}
                            >
                                <span style={{ fontSize: 18, color: "#2ca4ff" }}>‹</span>
                            </button>
                            <button
                                onClick={onNext}
                                disabled={page === totalPages - 1}
                                style={{
                                    position: "absolute",
                                    right: -20,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    background: "rgba(255,255,255,0.9)",
                                    border: "none",
                                    borderRadius: "50%",
                                    width: 40,
                                    height: 40,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: page === totalPages - 1 ? "not-allowed" : "pointer",
                                    opacity: page === totalPages - 1 ? 0.5 : 1,
                                    zIndex: 2,
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
                                }}
                            >
                                <span style={{ fontSize: 18, color: "#2ca4ff" }}>›</span>
                            </button>
                        </>
                    )}

                    {/* Product grid */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(6, 1fr)",
                        gap: 20,
                        overflow: "hidden"
                    }}>
                        {pages[page]?.map((product) => (
                            <div
                                key={product._id}
                                style={{
                                    background: "white",
                                    borderRadius: 16,
                                    padding: 16,
                                    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                                    transition: "box-shadow 0.2s ease-in-out",
                                    cursor: "pointer",
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
                                    e.currentTarget.style.transform = "translateY(-4px)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
                                    e.currentTarget.style.transform = "translateY(0)";
                                }}
                                onClick={() => onProductClick(product)}
                            >
                                <div style={{ position: "relative", height: 180, marginBottom: 12 }}>
                                    <img
                                        src={getImageUrl(product.productImage || product.images?.[0] || product.imageUrls?.[0])}
                                        alt={product.name}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "contain",
                                            borderRadius: 8
                                        }}
                                        onError={handleImageError}
                                    />
                                    {product.discount > 0 && (
                                        <div style={{
                                            position: "absolute",
                                            top: 8,
                                            left: 8,
                                            background: "#ef4444",
                                            color: "white",
                                            padding: "4px 8px",
                                            borderRadius: 4,
                                            fontSize: 12,
                                            fontWeight: 700,
                                            zIndex: 1
                                        }}>
                                            {product.discountType === 'amount' && product.discountValue ?
                                                `-${(product.discountValue / 1000).toFixed(0)}K` :
                                                `-${product.discount}%`
                                            }
                                        </div>
                                    )}
                                    {product.todaySales && (
                                        <div style={{
                                            position: "absolute",
                                            top: product.discount > 0 ? 40 : 8,
                                            left: 8,
                                            background: "#ff4757",
                                            color: "white",
                                            padding: "4px 8px",
                                            borderRadius: 4,
                                            fontSize: 12,
                                            fontWeight: 600,
                                            zIndex: 1
                                        }}>
                                            Bán {product.todaySales}
                                        </div>
                                    )}
                                </div>

                                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                                    <h3 style={{
                                        fontSize: 14,
                                        fontWeight: 600,
                                        margin: "0 0 8px",
                                        color: "#2c3e50",
                                        lineHeight: 1.3,
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden"
                                    }}>
                                        {product.productName || product.name}
                                    </h3>

                                    <div style={{ marginTop: "auto" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                                            <span style={{ color: "#ff4757", fontWeight: 700, fontSize: 16 }}>
                                                {new Intl.NumberFormat('vi-VN').format(product.finalPrice || product.productPrice || product.price)}₫
                                            </span>
                                            {product.discount > 0 && product.originalPrice && product.originalPrice > (product.finalPrice || product.productPrice || product.price) && (
                                                <span style={{
                                                    color: "#999",
                                                    textDecoration: "line-through",
                                                    fontSize: 14
                                                }}>
                                                    {new Intl.NumberFormat('vi-VN').format(product.originalPrice)}₫
                                                </span>
                                            )}
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onBuyClick(e, product);
                                            }}
                                            style={{
                                                width: "100%",
                                                background: "#2ca4ff",
                                                color: "white",
                                                border: "none",
                                                borderRadius: 8,
                                                padding: "8px 12px",
                                                fontSize: 14,
                                                fontWeight: 600,
                                                cursor: "pointer",
                                                transition: "background-color 0.2s ease"
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.background = "#1f88ff";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.background = "#2ca4ff";
                                            }}
                                        >
                                            Chọn mua
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
