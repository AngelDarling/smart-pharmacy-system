import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client.js";

export default function ProductDetail() {
  const { slug } = useParams();
  const [p, setP] = useState(null);

  useEffect(() => {
    api.get(`/products/slug/${slug}`).then((res) => setP(res.data));
  }, [slug]);

  if (!p) return <div style={{ padding: 16 }}>Đang tải...</div>;
  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", gap: 24 }}>
        <img src={p.imageUrls?.[0] || "/vite.svg"} alt={p.name} style={{ width: 320, height: 320, objectFit: "cover" }} />
        <div>
          <h2>{p.name}</h2>
          <p style={{ color: "#2e7d32", fontWeight: 700, fontSize: 20 }}>{p.price?.toLocaleString()} đ</p>
          <p>{p.description}</p>
          <button>Thêm vào giỏ</button>
        </div>
      </div>
    </div>
  );
}


