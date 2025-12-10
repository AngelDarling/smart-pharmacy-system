export default function BannerSection() {
    const banners = [
        { id: 1, image: '/uploads/banners/banner-1.jpg', alt: 'Đẹp hiện đại - Phụ nữ giới tự tin' },
        { id: 2, image: '/uploads/banners/banner-2.jpg', alt: 'Dung dịch vệ sinh' },
        { id: 3, image: '/uploads/banners/banner-3.jpg', alt: 'Tháng của nàng - Mạch đẹp xinh' }
    ];

    return (
        <div style={{ padding: "40px 0", background: "#e6f3ff" }}>
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
                        <span style={{ fontSize: 24 }}>🏆</span>
                        <span>Nhà thuốc uy tín hàng đầu</span>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
                    {/* Large Banner - Left */}
                    <div style={{
                        gridRow: "span 2",
                        borderRadius: 16,
                        overflow: "hidden",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        cursor: "pointer",
                        transition: "transform 0.3s",
                        position: "relative"
                    }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                    >
                        <img
                            src={banners[0].image}
                            alt={banners[0].alt}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block"
                            }}
                            onError={(e) => {
                                e.target.src = "https://via.placeholder.com/800x600?text=Banner+1";
                            }}
                        />
                    </div>

                    {/* Small Banners - Right */}
                    {banners.slice(1, 3).map((banner) => (
                        <div
                            key={banner.id}
                            style={{
                                borderRadius: 16,
                                overflow: "hidden",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                cursor: "pointer",
                                transition: "transform 0.3s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                        >
                            <img
                                src={banner.image}
                                alt={banner.alt}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    display: "block"
                                }}
                                onError={(e) => {
                                    e.target.src = `https://via.placeholder.com/400x300?text=Banner+${banner.id}`;
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
