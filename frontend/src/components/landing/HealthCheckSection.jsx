import { useState } from "react";
import { Link } from "react-router-dom";

export default function HealthCheckSection({ healthChecks }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const pageSize = 3;
    const totalPages = Math.ceil((healthChecks?.length || 0) / pageSize);
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

    if (!healthChecks || healthChecks.length === 0) {
        return null;
    }

    return (
        <div style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "60px 0", color: "white", position: "relative" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
                <div style={{ textAlign: "center", marginBottom: 40 }}>
                    <h2 style={{ margin: "0 0 20px", fontSize: 36, fontWeight: 700 }}>Kiểm tra sức khỏe</h2>
                    <p style={{ fontSize: 18, margin: "0 0 20px", opacity: 0.9 }}>
                        Kết quả đánh giá sẽ cho bạn lời khuyên xử trí phù hợp!
                    </p>
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
                    <div style={{ overflow: "hidden", position: "relative" }}>
                        {/* Inner container với slide animation */}
                        <div
                            style={{
                                display: "flex",
                                gap: 0,
                                transform: `translateX(-${currentIndex * 100}%)`,
                                transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
                            }}
                        >
                            {Array.from({ length: totalPages }).map((_, pageIndex) => {
                                const pageChecks = healthChecks.slice(
                                    pageIndex * pageSize,
                                    (pageIndex + 1) * pageSize
                                );
                                return (
                                    <div
                                        key={pageIndex}
                                        style={{
                                            display: "flex",
                                            gap: 12,
                                            minWidth: "100%",
                                            flexShrink: 0,
                                            width: "100%",
                                            boxSizing: "border-box",
                                            padding: "0 4px"
                                        }}
                                    >
                                        {pageChecks.map((check) => (
                                            <div key={check._id || check.slug} style={{
                                                flex: "0 0 calc(33.333% - 8px)",
                                                maxWidth: "calc(33.333% - 8px)",
                                                boxSizing: "border-box"
                                            }}>
                                                <Link
                                                    to={`/health-check/${check.slug}`}
                                                    style={{
                                                        textDecoration: "none",
                                                        background: "white",
                                                        borderRadius: 10,
                                                        padding: "14px 12px",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        alignItems: "center",
                                                        textAlign: "center",
                                                        minHeight: 220,
                                                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                                                        transition: "all 0.3s ease",
                                                        cursor: "pointer",
                                                        height: "100%",
                                                        boxSizing: "border-box"
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
                                                        e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = "translateY(0) scale(1)";
                                                        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)";
                                                    }}
                                                >
                                                    {/* Icon placeholder */}
                                                    <div style={{
                                                        width: 50,
                                                        height: 50,
                                                        borderRadius: "50%",
                                                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        marginBottom: 10,
                                                        fontSize: 24,
                                                        flexShrink: 0
                                                    }}>
                                                        🏥
                                                    </div>

                                                    {/* Title */}
                                                    <h3 style={{
                                                        fontSize: 13,
                                                        fontWeight: 600,
                                                        color: "#2c3e50",
                                                        marginBottom: 6,
                                                        lineHeight: 1.3,
                                                        minHeight: 36,
                                                        display: "-webkit-box",
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: "vertical",
                                                        overflow: "hidden"
                                                    }}>
                                                        {check.name}
                                                    </h3>

                                                    {/* Description */}
                                                    {check.shortDescription && (
                                                        <p style={{
                                                            fontSize: 11,
                                                            color: "#6b7280",
                                                            marginBottom: 10,
                                                            lineHeight: 1.3,
                                                            flexGrow: 1,
                                                            display: "-webkit-box",
                                                            WebkitLineClamp: 3,
                                                            WebkitBoxOrient: "vertical",
                                                            overflow: "hidden"
                                                        }}>
                                                            {check.shortDescription}
                                                        </p>
                                                    )}

                                                    {/* Start button */}
                                                    <button
                                                        style={{
                                                            padding: "6px 16px",
                                                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                            color: "white",
                                                            border: "none",
                                                            borderRadius: 18,
                                                            fontSize: 12,
                                                            fontWeight: 600,
                                                            cursor: "pointer",
                                                            transition: "all 0.3s ease",
                                                            width: "100%",
                                                            marginTop: "auto"
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background = "linear-gradient(135deg, #764ba2 0%, #667eea 100%)";
                                                            e.currentTarget.style.transform = "translateY(-2px)";
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
                                                            e.currentTarget.style.transform = "translateY(0)";
                                                        }}
                                                    >
                                                        Bắt đầu
                                                    </button>
                                                </Link>
                                            </div>
                                        ))}
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
