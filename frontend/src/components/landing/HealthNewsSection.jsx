import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client.js";

export default function HealthNewsSection() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch featured health news from API
        api.get('/health-news?limit=3&sort=newest')
            .then((res) => {
                setNews(res.data.items || []);
            })
            .catch((err) => {
                console.error('Error fetching health news:', err);
                setNews([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const handleNewsClick = (slug) => {
        navigate(`/health-news/${slug}`);
    };

    const handleViewAll = () => {
        navigate('/health-news');
    };

    return (
        <div style={{ padding: "60px 0", background: "#e6f3ff" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
                    <h2 style={{ fontSize: 32, fontWeight: 700, margin: 0, color: "#2c3e50" }}>Tin tức sức khỏe</h2>
                    <button
                        onClick={handleViewAll}
                        style={{
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            color: "white",
                            border: "none",
                            padding: "10px 20px",
                            borderRadius: 8,
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.3s"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "none";
                        }}
                    >
                        Xem tất cả →
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                        Đang tải tin tức...
                    </div>
                ) : news.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                        Chưa có tin tức nào
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 30 }}>
                        {news.map((article) => (
                            <div
                                key={article._id}
                                onClick={() => handleNewsClick(article.slug)}
                                style={{
                                    background: "white",
                                    borderRadius: 12,
                                    overflow: "hidden",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    cursor: "pointer",
                                    transition: "all 0.3s"
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
                                <img
                                    src={article.featuredImage || "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&q=80"}
                                    alt={article.title}
                                    style={{ width: "100%", height: 200, objectFit: "cover" }}
                                    onError={(e) => {
                                        e.target.src = "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&q=80";
                                    }}
                                />
                                <div style={{ padding: 20 }}>
                                    <h3 style={{
                                        margin: "0 0 10px",
                                        fontSize: 18,
                                        fontWeight: 600,
                                        color: "#2c3e50",
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden",
                                        minHeight: 48
                                    }}>
                                        {article.title}
                                    </h3>
                                    <p style={{
                                        margin: 0,
                                        fontSize: 14,
                                        color: "#666",
                                        lineHeight: 1.5,
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden"
                                    }}>
                                        {article.excerpt}
                                    </p>
                                    {article.category && (
                                        <div style={{
                                            marginTop: 12,
                                            display: "inline-block",
                                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                            color: "white",
                                            padding: "4px 12px",
                                            borderRadius: 12,
                                            fontSize: 12,
                                            fontWeight: 600
                                        }}>
                                            {article.category.name}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
