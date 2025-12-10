import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client.js";

export default function FeaturedCategoriesSection() {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        // Fetch categories with product count
        api.get("/categories/tree").then((res) => {
            const data = Array.isArray(res.data) ? res.data : [];
            // Get all level 2 categories (subcategories)
            const level2Categories = [];
            data.forEach(parent => {
                if (parent.children) {
                    parent.children.forEach(level1 => {
                        if (level1.children) {
                            level2Categories.push(...level1.children);
                        }
                    });
                }
            });
            // Sort by product count (descending) and take top 10
            const sorted = level2Categories
                .filter(cat => cat.productCount > 0) // Only show categories with products
                .sort((a, b) => (b.productCount || 0) - (a.productCount || 0))
                .slice(0, 10);

            console.log('Featured categories:', sorted); // Debug log
            setCategories(sorted);
        }).catch((err) => {
            console.error('Error fetching categories:', err);
            setCategories([]);
        });
    }, []);

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
                        background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                        color: "white",
                        padding: "8px 16px",
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 18,
                        fontWeight: 700
                    }}>
                        <span style={{ fontSize: 24 }}>🏅</span>
                        <span>Danh mục nổi bật</span>
                    </div>
                </div>

                {categories.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                        Đang tải danh mục...
                    </div>
                ) : (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(5, 1fr)",
                        gap: 20
                    }}>
                        {categories.map((category) => {
                            // Ensure iconUrl is properly formatted
                            const iconSrc = category.iconUrl
                                ? (category.iconUrl.startsWith('http') ? category.iconUrl : `http://localhost:5000${category.iconUrl}`)
                                : null;

                            return (
                                <Link
                                    key={category._id}
                                    to={`/catalog?category=${category.slug}`}
                                    style={{
                                        textDecoration: "none",
                                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                        borderRadius: 12,
                                        padding: 20,
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        textAlign: "center",
                                        minHeight: 120,
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                        transition: "all 0.3s",
                                        cursor: "pointer",
                                        position: "relative",
                                        overflow: "hidden"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-4px)";
                                        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                                    }}
                                >
                                    {iconSrc && (
                                        <img
                                            src={iconSrc}
                                            alt={category.name}
                                            style={{
                                                width: 48,
                                                height: 48,
                                                objectFit: "contain",
                                                marginBottom: 12,
                                                filter: "brightness(0) invert(1)"
                                            }}
                                            onError={(e) => {
                                                console.log('Failed to load icon:', iconSrc);
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    )}
                                    <div style={{
                                        fontSize: 15,
                                        fontWeight: 600,
                                        color: "white",
                                        marginBottom: 6,
                                        lineHeight: 1.3
                                    }}>
                                        {category.name}
                                    </div>
                                    <div style={{
                                        fontSize: 13,
                                        color: "rgba(255,255,255,0.9)",
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
