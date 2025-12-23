import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client.js";

export default function FeaturedCategoriesSection() {
    const [categories, setCategories] = useState([]);

    // Vibrant colors for category cards
    const cardGradients = [
        "linear-gradient(135deg, #10b981 0%, #059669 100%)", // Emerald
        "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", // Blue
        "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", // Amber
        "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", // Red
        "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)", // Violet
        "linear-gradient(135deg, #ec4899 0%, #db2777 100%)", // Pink
        "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)", // Cyan
        "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", // Orange
        "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)", // Teal
        "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"  // Indigo
    ];

    useEffect(() => {
        // Fetch categories with product count
        api.get("/categories/tree").then((res) => {
            const data = Array.isArray(res.data) ? res.data : [];
            // Get all level 1 categories
            const level1Categories = [];
            data.forEach(parent => {
                if (parent.children) {
                    level1Categories.push(...parent.children);
                }
            });
            // Sort by product count (descending) and take top 10
            const sorted = level1Categories
                .filter(cat => cat.productCount > 0) // Only show categories with products
                .sort((a, b) => (b.productCount || 0) - (a.productCount || 0))
                .slice(0, 12);

            console.log('Featured categories:', sorted); // Debug log
            setCategories(sorted);
        }).catch((err) => {
            console.error('Error fetching categories:', err);
            setCategories([]);
        });
    }, []);

    return (
        <div style={{ padding: "60px 0", background: "#f1f5f9" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 35
                }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        fontSize: 24,
                        fontWeight: 700,
                        color: "#1e3a8a"
                    }}>
                        <div style={{
                            width: 44,
                            height: 44,
                            background: "white",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                            fontSize: 26
                        }}>
                            🏆
                        </div>
                        <span>Danh mục nổi bật</span>
                    </div>
                </div>

                {categories.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                        Đang tải danh mục...
                    </div>
                ) : (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(6, 1fr)",
                        gap: 16
                    }}>
                        {categories.map((category, index) => {
                            // Ensure iconUrl is properly formatted
                            const iconSrc = category.iconUrl
                                ? (category.iconUrl.startsWith('http') ? category.iconUrl : `${category.iconUrl}`)
                                : null;

                            return (
                                <Link
                                    key={category._id}
                                    to={`/catalog?category=${category.slug}`}
                                    style={{
                                        textDecoration: "none",
                                        background: "white",
                                        borderRadius: 16,
                                        padding: "24px 16px",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        textAlign: "center",
                                        minHeight: 160,
                                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)",
                                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                        cursor: "pointer",
                                        border: "1px solid #f1f5f9"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-6px)";
                                        e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)";
                                        e.currentTarget.style.borderColor = "#e2e8f0";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)";
                                        e.currentTarget.style.borderColor = "#f1f5f9";
                                    }}
                                >
                                    <div style={{
                                        width: 60,
                                        height: 60,
                                        marginBottom: 16,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: "#eff6ff",
                                        borderRadius: 12,
                                        padding: 10
                                    }}>
                                        {iconSrc ? (
                                            <img
                                                src={iconSrc}
                                                alt={category.name}
                                                style={{
                                                    maxWidth: "100%",
                                                    maxHeight: "100%",
                                                    objectFit: "contain",
                                                    filter: "drop-shadow(0 2px 4px rgba(59, 130, 246, 0.2))"
                                                }}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'block';
                                                }}
                                            />
                                        ) : null}
                                        <div style={{ display: iconSrc ? 'none' : 'block', fontSize: 24, color: "#3b82f6" }}>
                                            📁
                                        </div>
                                    </div>
                                    <div style={{
                                        fontSize: 15,
                                        fontWeight: 700,
                                        color: "#0f172a",
                                        marginBottom: 6,
                                        lineHeight: "1.4",
                                        height: "2.8em",
                                        overflow: "hidden",
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical"
                                    }}>
                                        {category.name}
                                    </div>
                                    <div style={{
                                        fontSize: 13,
                                        color: "#64748b",
                                        fontWeight: 500
                                    }}>
                                        {category.productCount || 0} sản phẩm
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
