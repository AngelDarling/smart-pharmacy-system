import { useEffect, useState } from "react";
import api from "../api/client.js";
import ProductCard from "../components/ProductCard.jsx";
import CategorySidebar from "../components/CategorySidebar.jsx";

export default function Home() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (categoryId) params.set("categoryId", categoryId);
    setLoading(true);
    api.get(`/products?${params.toString()}`)
      .then((res) => {
        setItems(res.data.items);
        setTotal(res.data.total);
      })
      .finally(() => setLoading(false));
  }, [q, categoryId]);

  return (
    <div style={{ display: "flex", gap: 16, padding: 16 }}>
      <CategorySidebar selected={categoryId} onSelect={setCategoryId} />
      <main style={{ flex: 1 }}>
        <div className="card" style={{ padding: 16, marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <input placeholder="Tìm sản phẩm, thương hiệu, công dụng..." value={q} onChange={(e) => setQ(e.target.value)} style={{ flex: 1, padding: 10 }} />
            <button className="btn-primary">Tìm</button>
          </div>
        </div>
        {loading ? (
          <div>Đang tải...</div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {items.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
            <p style={{ marginTop: 8 }}>Tổng {total} sản phẩm</p>
          </>
        )}
      </main>
    </div>
  );
}


