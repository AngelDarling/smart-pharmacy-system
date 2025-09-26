import { useEffect, useState } from "react";
import api from "../api/client.js";
import ProductCard from "../components/ProductCard.jsx";
import CategorySidebar from "../components/CategorySidebar.jsx";

export default function Home() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (categoryId) params.set("categoryId", categoryId);
    api.get(`/products?${params.toString()}`)
      .then((res) => {
        setItems(res.data.items);
        setTotal(res.data.total);
      });
  }, [q, categoryId]);

  return (
    <div style={{ display: "flex", gap: 16, padding: 16 }}>
      <CategorySidebar selected={categoryId} onSelect={setCategoryId} />
      <main style={{ flex: 1 }}>
        <div style={{ marginBottom: 12 }}>
          <input placeholder="Tìm sản phẩm" value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 360, padding: 8 }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {items.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
        <p style={{ marginTop: 8 }}>Tổng {total} sản phẩm</p>
      </main>
    </div>
  );
}


