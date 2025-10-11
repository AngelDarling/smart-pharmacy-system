import { useEffect, useState } from "react";
import api from "../api/client.js";
import ProductCard from "../components/ProductCard.jsx";

export default function Landing() {
  const [message, setMessage] = useState("Đang kết nối...");
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.get("/hello").then((res) => setMessage(res.data.message)).catch(() => setMessage("⚠️ Lỗi kết nối API"));
    api.get("/products?limit=8").then((res) => setFeatured(res.data.items || []));
  }, []);

  return (
    <div>
      <Hero />
      <DealSection />
      <BestSellingSection products={featured} />
      <HealthCheckSection />
      <DiseaseLookupSection />
      <HealthNewsSection />
      <BrandSection />
      <Footer />
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

function DealSection() {
  return (
    <div style={{ background: "#f8f9fa", padding: "40px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
        <div style={{ 
          background: "linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)", 
          padding: "20px", 
          borderRadius: 12, 
          marginBottom: 30,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div>
            <h2 style={{ margin: "0 0 10px", color: "white", fontSize: 28, fontWeight: 700 }}>DEAL XỊN QUÀ XINH</h2>
            <div style={{ background: "#ff4757", color: "white", padding: "5px 15px", borderRadius: 20, display: "inline-block", fontSize: 18, fontWeight: 600 }}>
              49%
            </div>
          </div>
          <div style={{ textAlign: "right", color: "white" }}>
            <div style={{ fontSize: 24, fontWeight: 700 }}>20:00 - 23:00</div>
            <div style={{ fontSize: 16, opacity: 0.9 }}>Hôm nay</div>
          </div>
        </div>
        
        <div style={{ display: "flex", gap: 20, overflowX: "auto", paddingBottom: 10 }}>
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} style={{ minWidth: 200, background: "white", borderRadius: 12, padding: 15, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              <div style={{ position: "relative" }}>
                <img src={`https://picsum.photos/200/200?random=${i}`} alt="" style={{ width: "100%", height: 150, objectFit: "cover", borderRadius: 8 }} />
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
                  -10%
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Sản phẩm {i}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#ff4757", fontWeight: 700, fontSize: 16 }}>89.000₫</span>
                  <span style={{ color: "#999", textDecoration: "line-through", fontSize: 14 }}>99.000₫</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BestSellingSection({ products }) {
  return (
    <div style={{ padding: "40px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 30px", color: "#2c3e50" }}>Sản phẩm bán chạy</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
          {products.map((p) => (
            <div key={p._id} style={{ background: "white", borderRadius: 12, padding: 15, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              <img src={p.imageUrls?.[0] || "https://picsum.photos/250/200"} alt={p.name} style={{ width: "100%", height: 150, objectFit: "cover", borderRadius: 8, marginBottom: 12 }} />
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{p.name}</div>
              <div style={{ color: "#2e7d32", fontWeight: 700, fontSize: 18 }}>{p.price?.toLocaleString()}₫</div>
            </div>
          ))}
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
    <div style={{ padding: "60px 0", background: "#f8f9fa" }}>
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
    <div style={{ padding: "60px 0" }}>
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

function BrandSection() {
  const brands = ["BRAUER", "OcuMi", "Tảo Spirulina", "Viên uống collagen", "Omega 3", "Vitamin D3"];

  return (
    <div style={{ background: "#f8f9fa", padding: "40px 0" }}>
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

function Footer() {
  return (
    <div style={{ background: "#2c3e50", color: "white", padding: "60px 0 20px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 40, marginBottom: 40 }}>
          <div>
            <h3 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 600 }}>Về Smart Pharmacy</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li style={{ marginBottom: 8 }}><a href="#" style={{ color: "#bdc3c7", textDecoration: "none" }}>Giới thiệu</a></li>
              <li style={{ marginBottom: 8 }}><a href="#" style={{ color: "#bdc3c7", textDecoration: "none" }}>Tuyển dụng</a></li>
              <li style={{ marginBottom: 8 }}><a href="#" style={{ color: "#bdc3c7", textDecoration: "none" }}>Liên hệ</a></li>
            </ul>
          </div>
          <div>
            <h3 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 600 }}>Chính sách</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li style={{ marginBottom: 8 }}><a href="#" style={{ color: "#bdc3c7", textDecoration: "none" }}>Chính sách bảo mật</a></li>
              <li style={{ marginBottom: 8 }}><a href="#" style={{ color: "#bdc3c7", textDecoration: "none" }}>Điều khoản sử dụng</a></li>
              <li style={{ marginBottom: 8 }}><a href="#" style={{ color: "#bdc3c7", textDecoration: "none" }}>Chính sách đổi trả</a></li>
            </ul>
          </div>
          <div>
            <h3 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 600 }}>Hỗ trợ</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li style={{ marginBottom: 8 }}><a href="#" style={{ color: "#bdc3c7", textDecoration: "none" }}>Hướng dẫn mua hàng</a></li>
              <li style={{ marginBottom: 8 }}><a href="#" style={{ color: "#bdc3c7", textDecoration: "none" }}>Câu hỏi thường gặp</a></li>
              <li style={{ marginBottom: 8 }}><a href="#" style={{ color: "#bdc3c7", textDecoration: "none" }}>Hotline: 1800 6928</a></li>
            </ul>
          </div>
        </div>
        <div style={{ borderTop: "1px solid #34495e", paddingTop: 20, textAlign: "center", color: "#bdc3c7" }}>
          <p style={{ margin: 0 }}>© 2024 Smart Pharmacy. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </div>
  );
}



