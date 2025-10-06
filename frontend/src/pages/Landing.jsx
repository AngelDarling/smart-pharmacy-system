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
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: 16 }}>
        <SectionTitle title="Sản phẩm nổi bật" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {featured.map((p) => (<ProductCard key={p._id} product={p} />))}
        </div>

        <SectionTitle title="Tra cứu bệnh thường gặp" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {staticArticles.map((a) => (
            <a key={a.href} href={a.href} className="card" style={{ padding: 12, textDecoration: "none", color: "inherit" }}>
              <img src={a.img} alt="" style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8 }} />
              <div style={{ marginTop: 8, fontWeight: 600 }}>{a.title}</div>
            </a>
          ))}
        </div>

        <SectionTitle title="Tin tức sức khỏe" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {staticNews.map((a) => (
            <a key={a.href} href={a.href} className="card" style={{ padding: 12, textDecoration: "none", color: "inherit" }}>
              <img src={a.img} alt="" style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 8 }} />
              <div style={{ marginTop: 8, fontWeight: 600 }}>{a.title}</div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>{a.desc}</div>
            </a>
          ))}
        </div>

        <SectionTitle title="Giới thiệu hệ thống nhà thuốc" />
        <div className="card" style={{ padding: 16 }}>
          <p>Smart Pharmacy mang đến trải nghiệm mua sắm dược phẩm an toàn với đội ngũ dược sĩ tư vấn, mạng lưới nhà thuốc và giao hàng nhanh.</p>
          <ul>
            <li>Sản phẩm chính hãng, nguồn gốc rõ ràng</li>
            <li>Dược sĩ tư vấn 24/7</li>
            <li>Ưu đãi theo tháng, mã giảm giá riêng</li>
          </ul>
          <div style={{ color: "green" }}>API: {message}</div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <div style={{ background: "linear-gradient(90deg,#e0f2fe,#dcfce7)", padding: 24 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: 24 }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, color: "#065f46" }}>Yêu trọn bản thân, sống chủ động</h1>
          <p>Chăm sóc sức khỏe mỗi ngày cùng Smart Pharmacy</p>
          <a href="/catalog" className="btn-primary" style={{ display: "inline-block" }}>Mua ngay</a>
        </div>
        <img src="/banner-hero.png" alt="Hero" style={{ width: 420, maxWidth: "45%" }} />
      </div>
    </div>
  );
}

function SectionTitle({ title }) {
  return <h2 style={{ margin: "24px 0 12px", color: "#065f46" }}>{title}</h2>;
}

const staticArticles = [
  { title: "Tay chân miệng", href: "/health/hfmd.html", img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80" },
  { title: "Cúm mùa", href: "/health/flu.html", img: "https://images.unsplash.com/photo-1584036561584-b03c19da874c?w=800&q=80" },
  { title: "Đau dạ dày", href: "/health/gastritis.html", img: "https://images.unsplash.com/photo-1582719478250-7a5d6b922c16?w=800&q=80" },
  { title: "Dị ứng thời tiết", href: "/health/allergy.html", img: "https://images.unsplash.com/photo-1490111718993-d98654ce6cf7?w=800&q=80" }
];

const staticNews = [
  { title: "Mùa cảm cúm: cách phòng tránh", href: "/news/flu-tips.html", img: "https://images.unsplash.com/photo-1513863324036-5bed9d00a5f2?w=800&q=80", desc: "Rửa tay, đeo khẩu trang, bổ sung vitamin C" },
  { title: "10 mẹo ngủ ngon", href: "/news/sleep.html", img: "https://images.unsplash.com/photo-1511296265585-3e2aa3b67e4b?w=800&q=80", desc: "Thói quen lành mạnh giúp cải thiện giấc ngủ" },
  { title: "Bí quyết chăm sóc da", href: "/news/skincare.html", img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80", desc: "Chọn sản phẩm phù hợp loại da" }
];


