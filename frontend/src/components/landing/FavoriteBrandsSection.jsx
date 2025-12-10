import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export default function FavoriteBrandsSection({ brands, scrollRef, onScrollRef }) {
    const scrollContainerRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const pageSize = 5;

    useEffect(() => {
        if (onScrollRef) {
            onScrollRef(scrollContainerRef.current);
        }
    }, [onScrollRef]);

    const totalPages = Math.ceil((brands?.length || 0) / pageSize);
    const showLeftBtn = currentIndex > 0;
    const showRightBtn = currentIndex < totalPages - 1;

    const scrollLeft = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const scrollRight = () => {
        if (currentIndex < totalPages - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    if (!brands || brands.length === 0) {
        return null;
    }

    return (
        <div style={{ padding: "50px 0", background: "#e6f3ff" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 30
                }}>
                    <div style={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                        padding: "8px 16px",
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 18,
                        fontWeight: 700
                    }}>
                        <span style={{ fontSize: 24 }}>⭐</span>
                        <span>Thương hiệu yêu thích</span>
                    </div>
                </div>

                <div style={{ position: "relative" }}>
                    {/* Left scroll button */}
                    {showLeftBtn && (
                        <button
                            onClick={scrollLeft}
                            style={{
                                position: "absolute",
                                left: -20,
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "rgba(255,255,255,0.95)",
                                border: "none",
                                borderRadius: "50%",
                                width: 48,
                                height: 48,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                zIndex: 10,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                transition: "all 0.3s ease",
                                color: "#2ca4ff"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "white";
                                e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "rgba(255,255,255,0.95)";
                                e.currentTarget.style.transform = "translateY(-50%) scale(1)";
                            }}
                        >
                            <span style={{ fontSize: 24, fontWeight: 700 }}>‹</span>
                        </button>
                    )}

                    {/* Right scroll button */}
                    {showRightBtn && (
                        <button
                            onClick={scrollRight}
                            style={{
                                position: "absolute",
                                right: -20,
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "rgba(255,255,255,0.95)",
                                border: "none",
                                borderRadius: "50%",
                                width: 48,
                                height: 48,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                zIndex: 10,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                transition: "all 0.3s ease",
                                color: "#2ca4ff"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "white";
                                e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "rgba(255,255,255,0.95)";
                                e.currentTarget.style.transform = "translateY(-50%) scale(1)";
                            }}
                        >
                            <span style={{ fontSize: 24, fontWeight: 700 }}>›</span>
                        </button>
                    )}

                    {/* Scrollable wrapper */}
                    <div
                        ref={scrollContainerRef}
                        style={{
                            overflow: "hidden",
                            position: "relative"
                        }}
                    >
                        {/* Inner container với slide animation */}
                        <div
                            style={{
                                display: "flex",
                                gap: 20,
                                transform: `translateX(-${currentIndex * 100}%)`,
                                transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
                            }}
                        >
                            {Array.from({ length: totalPages }).map((_, pageIndex) => {
                                const pageBrands = brands.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
                                return (
                                    <div
                                        key={pageIndex}
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: `repeat(${pageBrands.length}, 1fr)`,
                                            gap: 20,
                                            minWidth: "100%",
                                            flexShrink: 0
                                        }}
                                    >
                                        {pageBrands.map((brand) => {
                                            const logoSrc = brand.logoUrl
                                                ? (brand.logoUrl.startsWith('http') ? brand.logoUrl : `http://localhost:5000${brand.logoUrl}`)
                                                : null;

                                            return (
                                                <Link
                                                    key={brand._id || brand.slug}
                                                    to={`/catalog?brandSlug=${brand.slug}`}
                                                    style={{
                                                        textDecoration: "none",
                                                        background: "white",
                                                        borderRadius: 12,
                                                        padding: 20,
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        textAlign: "center",
                                                        minWidth: 200,
                                                        width: 200,
                                                        minHeight: 220,
                                                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                                        transition: "all 0.3s ease",
                                                        cursor: "pointer",
                                                        position: "relative",
                                                        overflow: "hidden",
                                                        flexShrink: 0
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
                                                        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = "translateY(0) scale(1)";
                                                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                                                    }}
                                                >
                                                    {/* Brand Logo/Image */}
                                                    <div style={{
                                                        width: "100%",
                                                        height: 120,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        marginBottom: 16
                                                    }}>
                                                        {logoSrc ? (
                                                            <img
                                                                src={logoSrc}
                                                                alt={brand.name}
                                                                style={{
                                                                    maxWidth: "100%",
                                                                    maxHeight: "100%",
                                                                    objectFit: "contain"
                                                                }}
                                                                onError={(e) => {
                                                                    console.log('Failed to load brand logo:', logoSrc);
                                                                    e.target.style.display = 'none';
                                                                    if (e.target.nextSibling) {
                                                                        e.target.nextSibling.style.display = 'flex';
                                                                    }
                                                                }}
                                                            />
                                                        ) : null}
                                                        <div style={{
                                                            width: "100%",
                                                            height: "100%",
                                                            display: logoSrc ? 'none' : 'flex',
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                            borderRadius: 8,
                                                            color: "white",
                                                            fontSize: 32,
                                                            fontWeight: 700
                                                        }}>
                                                            {brand.name?.charAt(0) || '?'}
                                                        </div>
                                                    </div>

                                                    {/* Brand Name */}
                                                    <div style={{
                                                        fontSize: 15,
                                                        fontWeight: 600,
                                                        color: "#2c3e50",
                                                        marginBottom: 8,
                                                        lineHeight: 1.3,
                                                        minHeight: 40,
                                                        display: "-webkit-box",
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: "vertical",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis"
                                                    }}>
                                                        {brand.name}
                                                    </div>

                                                    {/* Product Count */}
                                                    {brand.productCount > 0 && (
                                                        <div style={{
                                                            fontSize: 12,
                                                            color: "#6b7280",
                                                            fontWeight: 500
                                                        }}>
                                                            {brand.productCount} sản phẩm
                                                        </div>
                                                    )}
                                                </Link>
                                            );
                                        })}
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
