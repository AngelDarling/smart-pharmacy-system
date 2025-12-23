import { getImageUrl, handleImageError } from "../../utils/imageUtils";

export default function BestSellingSection({ products, page = 0, onPrev, onNext, onProductClick, onBuyClick }) {
    const pageSize = 6;
    const totalPages = Math.ceil((products?.length || 0) / pageSize) || 1;
    const pages = Array.from({ length: totalPages }, (_, i) =>
        (products || []).slice(i * pageSize, i * pageSize + pageSize)
    );

    return (
        <div style={{ padding: "40px 0", background: "#e6f3ff" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
                <div style={{ position: "relative", background: "linear-gradient(180deg, #2ca4ff 0%, #1f88ff 100%)", borderRadius: 16, padding: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                        <div style={{ background: "#e11d48", color: "white", padding: "10px 20px", borderRadius: 999, fontSize: 18, fontWeight: 700 }}>
                            Sản phẩm bán chạy nhất
                        </div>
                    </div>
                    <button
                        onClick={onPrev}
                        disabled={page === 0}
                        style={{
                            position: "absolute",
                            left: 8,
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "white",
                            border: "none",
                            boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                            borderRadius: "50%",
                            width: 52,
                            height: 52,
                            padding: 0,
                            lineHeight: "52px",
                            cursor: page === 0 ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 2,
                            fontSize: 22,
                            fontWeight: 700,
                            color: "#333",
                            opacity: page === 0 ? 0.5 : 1
                        }}
                    >
                        ‹
                    </button>
                    <button
                        onClick={onNext}
                        disabled={page >= totalPages - 1}
                        style={{
                            position: "absolute",
                            right: 8,
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "white",
                            border: "none",
                            boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                            borderRadius: "50%",
                            width: 52,
                            height: 52,
                            padding: 0,
                            lineHeight: "52px",
                            cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 2,
                            fontSize: 22,
                            fontWeight: 700,
                            color: "#333",
                            opacity: page >= totalPages - 1 ? 0.5 : 1
                        }}
                    >
                        ›
                    </button>

                    {/* Slider viewport */}
                    <div style={{ overflow: "hidden" }}>
                        {/* Slider track */}
                        <div
                            style={{
                                display: "flex",
                                width: `${totalPages * 100}%`,
                                transform: `translateX(-${page * (100 / totalPages)}%)`,
                                transition: "transform 400ms ease",
                                gap: 0
                            }}
                        >
                            {pages.map((items, idx) => (
                                <div key={idx} style={{ flex: `0 0 ${100 / totalPages}%`, padding: "0 2px" }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 20 }}>
                                        {items.map((p) => (
                                            <div
                                                key={p._id}
                                                onClick={() => onProductClick(p)}
                                                style={{
                                                    background: "white",
                                                    borderRadius: 16,
                                                    padding: 16,
                                                    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                                                    position: "relative",
                                                    cursor: "pointer",
                                                    transition: "all 0.3s ease",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    height: "100%"
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = "translateY(-4px)";
                                                    e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = "translateY(0)";
                                                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
                                                }}
                                            >
                                                {p.discount > 0 && (
                                                    <div style={{
                                                        position: "absolute",
                                                        top: 0,
                                                        left: 0,
                                                        background: "#ef4444",
                                                        color: "white",
                                                        padding: "4px 8px",
                                                        borderTopLeftRadius: 12,
                                                        borderBottomRightRadius: 12,
                                                        fontSize: 12,
                                                        fontWeight: 700,
                                                        zIndex: 1
                                                    }}>
                                                        {p.discountType === 'amount' && p.discountValue ?
                                                            `-${(p.discountValue / 1000).toFixed(0)}K` :
                                                            `-${p.discount}%`
                                                        }
                                                    </div>
                                                )}
                                                <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                                                    <img
                                                        src={getImageUrl(p.imageUrls?.[0], "/default-product.png")}
                                                        alt={p.name}
                                                        style={{ maxWidth: "100%", maxHeight: 180, objectFit: "contain" }}
                                                        onError={(e) => handleImageError(e, "/default-product.png")}
                                                    />
                                                </div>
                                                <div style={{
                                                    fontSize: 14,
                                                    fontWeight: 600,
                                                    height: 66,
                                                    color: "#0f172a",
                                                    marginBottom: 10,
                                                    overflow: "hidden",
                                                    display: "-webkit-box",
                                                    WebkitLineClamp: 3,
                                                    WebkitBoxOrient: "vertical",
                                                    lineHeight: "22px"
                                                }}>{p.name}</div>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                                    <span style={{ color: "#0ea5e9", fontWeight: 800, fontSize: 16 }}>{(p.finalPrice || p.price)?.toLocaleString()}₫</span>
                                                    {p.discount > 0 && p.originalPrice && p.originalPrice > (p.finalPrice || p.price) && (
                                                        <span style={{ color: "#9ca3af", textDecoration: "line-through", fontSize: 13 }}>{p.originalPrice.toLocaleString()}₫</span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={(e) => onBuyClick(e, p)}
                                                    style={{
                                                        marginTop: "auto",
                                                        width: "100%",
                                                        background: "#2563eb",
                                                        color: "white",
                                                        border: "none",
                                                        padding: "10px 12px",
                                                        borderRadius: 8,
                                                        cursor: "pointer",
                                                        fontWeight: 600,
                                                        transition: "background-color 0.2s"
                                                    }}
                                                    onMouseEnter={(e) => e.target.style.background = "#1d4ed8"}
                                                    onMouseLeave={(e) => e.target.style.background = "#2563eb"}
                                                >
                                                    Chọn mua
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
