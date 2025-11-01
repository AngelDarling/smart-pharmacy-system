import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client.js";
import { getImageUrl, handleImageError } from "../utils/imageUtils";
import ProductCard from "../components/ProductCard.jsx";
import SelectPurchaseModal from "../components/SelectPurchaseModal.jsx";

export default function Landing() {
  const navigate = useNavigate();
  const [bestSellers, setBestSellers] = useState([]);
  const [todayFeatured, setTodayFeatured] = useState([]);
  const [page, setPage] = useState(0); // 0 or 1
  const [todayPage, setTodayPage] = useState(0); // 0 or 1 for today featured
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    api.get("/products/best-sellers?limit=12").then((res) => setBestSellers(res.data.items || [])).catch(() => setBestSellers([]));
    api.get("/products/today-featured").then((res) => {
      setTodayFeatured(res.data.items || []);
    }).catch((err) => {
      console.error('Error fetching today featured:', err);
      setTodayFeatured([]);
    });
  }, []);

  const handleProductClick = (product) => {
    navigate(`/p/${product.slug}`);
  };

  const handleBuyClick = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedProduct(product);
    setShowModal(true);
  };

  return (
  <div style={{ background: '#e6f3ff', marginTop: 'auto' }}>
      <Hero />
      <BestSellingSection 
        products={bestSellers}
        page={page}
        onPrev={() => setPage((p) => Math.max(0, p - 1))}
        onNext={() => {
          const totalPages = Math.max(1, Math.ceil((bestSellers?.length || 0) / 6));
          setPage((p) => Math.min(totalPages - 1, p + 1));
        }}
        onProductClick={handleProductClick}
        onBuyClick={handleBuyClick}
      />
      <BannerSection />
      <FeaturedCategoriesSection />
      <TodayFeaturedSection 
        products={todayFeatured}
        page={todayPage}
        onPrev={() => setTodayPage((p) => Math.max(0, p - 1))}
        onNext={() => {
          const totalPages = Math.max(1, Math.ceil((todayFeatured?.length || 0) / 6));
          setTodayPage((p) => Math.min(totalPages - 1, p + 1));
        }}
        onProductClick={handleProductClick}
        onBuyClick={handleBuyClick}
      />
      <HealthCheckSection />
      <DiseaseLookupSection />
      <HealthNewsSection />
      <BrandSection />
      {selectedProduct && (
        <SelectPurchaseModal
          product={selectedProduct}
          open={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}

function Hero() {
  return (
    <div style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "60px 0", color: "white" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", textAlign: "center" }}>
        <h1 style={{ margin: "0 0 20px", fontSize: 48, fontWeight: 700 }}>Mừng Ngày Quốc Tế Người Cao Tuổi</h1>
        <h2 style={{ margin: "0 0 30px", fontSize: 32, fontWeight: 500 }}>TẶNG GÓI TẦM SOÁT MIỄN PHÍ</h2>
        <p style={{ fontSize: 18, margin: "0 0 30px", opacity: 0.9 }}>Chăm sóc sức khỏe toàn diện cho người cao tuổi</p>
        <button style={{ 
          background: "#ff6b6b", 
          color: "white", 
          border: "none", 
          padding: "15px 30px", 
          borderRadius: 25, 
          fontSize: 18, 
          fontWeight: 600,
          cursor: "pointer"
        }}>
          Tìm hiểu ngay
        </button>
      </div>
    </div>
  );
}


function BestSellingSection({ products, page = 0, onPrev, onNext, onProductClick, onBuyClick }) {
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
              <div key={idx} style={{ flex: `0 0 ${100/totalPages}%`, padding: "0 2px" }}>
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
                        transition: "all 0.3s ease" 
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
                        {p.monthQuantity > 0 && (
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
                            -{Math.min(35, Math.round((p.compareAtPrice && p.compareAtPrice > p.price) ? (1 - p.price / p.compareAtPrice) * 100 : 0))}%
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
                        <div style={{ fontSize: 14, fontWeight: 600, minHeight: 44, color: "#0f172a", marginBottom: 10 }}>{p.name}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                          <span style={{ color: "#0ea5e9", fontWeight: 800, fontSize: 16 }}>{p.price?.toLocaleString()}₫</span>
                          {p.compareAtPrice && p.compareAtPrice > p.price && (
                            <span style={{ color: "#9ca3af", textDecoration: "line-through", fontSize: 13 }}>{p.compareAtPrice.toLocaleString()}₫</span>
                          )}
                        </div>
                        <button 
                          onClick={(e) => onBuyClick(e, p)}
                          style={{ 
                            marginTop: 10, 
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

function HealthCheckSection() {
  return (
    <div style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "60px 0", color: "white" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", textAlign: "center" }}>
        <h2 style={{ margin: "0 0 20px", fontSize: 36, fontWeight: 700 }}>Kiểm tra sức khỏe</h2>
        <p style={{ fontSize: 18, margin: "0 0 40px", opacity: 0.9 }}>Đội ngũ bác sĩ chuyên khoa tư vấn miễn phí</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 40, flexWrap: "wrap" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>🩺</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>Tư vấn sức khỏe</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>💊</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>Kê đơn thuốc</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>📋</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>Xét nghiệm</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DiseaseLookupSection() {
  const diseases = [
    { name: "Bệnh nam giới", icon: "👨", conditions: ["Rối loạn cương dương", "Viêm tuyến tiền liệt", "Ung thư tuyến tiền liệt"] },
    { name: "Bệnh phụ nữ", icon: "👩", conditions: ["Kinh nguyệt không đều", "Viêm âm đạo", "Ung thư cổ tử cung"] },
    { name: "Bệnh người già", icon: "👴", conditions: ["Cao huyết áp", "Tiểu đường", "Loãng xương"] },
    { name: "Bệnh trẻ em", icon: "👶", conditions: ["Sốt cao", "Tiêu chảy", "Ho khan"] }
  ];

  return (
    <div style={{ padding: "60px 0", background: "#e6f3ff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, margin: "0 0 40px", textAlign: "center", color: "#2c3e50" }}>Tra cứu bệnh thường gặp</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 30 }}>
          {diseases.map((disease, i) => (
            <div key={i} style={{ background: "white", borderRadius: 12, padding: 25, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 48, marginBottom: 10 }}>{disease.icon}</div>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: "#2c3e50" }}>{disease.name}</h3>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {disease.conditions.map((condition, j) => (
                  <li key={j} style={{ padding: "8px 0", borderBottom: "1px solid #eee", fontSize: 14, color: "#666" }}>
                    • {condition}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HealthNewsSection() {
  const news = [
    { title: "Mùa cảm cúm: cách phòng tránh hiệu quả", desc: "Rửa tay, đeo khẩu trang, bổ sung vitamin C", img: "https://images.unsplash.com/photo-1513863324036-5bed9d00a5f2?w=400&q=80" },
    { title: "10 mẹo ngủ ngon mỗi đêm", desc: "Thói quen lành mạnh giúp cải thiện giấc ngủ", img: "https://images.unsplash.com/photo-1511296265585-3e2aa3b67e4b?w=400&q=80" },
    { title: "Bí quyết chăm sóc da khỏe mạnh", desc: "Chọn sản phẩm phù hợp loại da", img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80" }
  ];

  return (
    <div style={{ padding: "60px 0", background: "#e6f3ff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, margin: "0 0 40px", textAlign: "center", color: "#2c3e50" }}>Tin tức sức khỏe</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 30 }}>
          {news.map((article, i) => (
            <div key={i} style={{ background: "white", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
              <img src={article.img} alt={article.title} style={{ width: "100%", height: 200, objectFit: "cover" }} />
              <div style={{ padding: 20 }}>
                <h3 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 600, color: "#2c3e50" }}>{article.title}</h3>
                <p style={{ margin: 0, fontSize: 14, color: "#666", lineHeight: 1.5 }}>{article.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BannerSection() {
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

function FeaturedCategoriesSection() {
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

function BrandSection() {
  const brands = ["BRAUER", "OcuMi", "Tảo Spirulina", "Viên uống collagen", "Omega 3", "Vitamin D3"];

  return (
    <div style={{ background: "#e6f3ff", padding: "40px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 30px", textAlign: "center", color: "#2c3e50" }}>Thương hiệu nổi bật</h2>
        <div style={{ display: "flex", gap: 30, overflowX: "auto", paddingBottom: 10 }}>
          {brands.map((brand, i) => (
            <div key={i} style={{ 
              minWidth: 150, 
              height: 80, 
              background: "white", 
              borderRadius: 8, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: "#2c3e50" }}>{brand}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TodayFeaturedSection({ products, page = 0, onPrev, onNext, onProductClick, onBuyClick }) {
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
                    src={getImageUrl(product.productImage || product.images?.[0])}
                    alt={product.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      borderRadius: 8
                    }}
                    onError={handleImageError}
                  />
                  {product.todaySales && (
                    <div style={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                      background: "#ff4757",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 600
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
                        {new Intl.NumberFormat('vi-VN').format(product.productPrice || product.price)}₫
                      </span>
                      {product.originalPrice && product.originalPrice > (product.productPrice || product.price) && (
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
                        onBuyClick(product);
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




