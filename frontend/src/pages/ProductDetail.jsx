import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client.js";
import useCart from "../hooks/useCart.js";
import SelectPurchaseModal from "../components/SelectPurchaseModal.jsx";

export default function ProductDetail() {
  const { slug } = useParams();
  const [p, setP] = useState(null);
  const { add } = useCart();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    api.get(`/products/slug/${slug}`).then((res) => setP(res.data));
  }, [slug]);

  if (!p) return <div style={{ padding: 16 }}>Đang tải...</div>;
  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", gap: 24 }}>
        <img src={p.imageUrls?.[0] || "/vite.svg"} alt={p.name} style={{ width: 360, height: 360, objectFit: "cover", borderRadius: 12 }} />
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: "0 0 8px" }}>{p.name}</h2>
          <div style={{ color: "#6b7280", marginBottom: 8 }}>Mã SKU: {p.sku || "—"}</div>
          <div style={{ color: "#2e7d32", fontWeight: 700, fontSize: 22, marginBottom: 12 }}>{p.price?.toLocaleString()} đ</div>
          <div className="card" style={{ padding: 12, marginBottom: 12 }}>
            <div><b>Đơn vị:</b> {p.unit || "hộp"}</div>
            <div><b>Danh mục:</b> {p.categoryId || "—"}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-primary" onClick={() => setOpen(true)}>Chọn sản phẩm</button>
          </div>
        </div>
      </div>
      <SelectPurchaseModal product={p} open={open} onClose={() => setOpen(false)} />
      <div className="card" style={{ padding: 16, marginTop: 16 }}>
        <h3>Mô tả</h3>
        <p>{p.description || "Sản phẩm đang cập nhật mô tả."}</p>
        {p.attributes?.usage && (
          <>
            <h3>Công dụng</h3>
            <p>{p.attributes.usage}</p>
          </>
        )}
        {p.attributes?.active_ingredient && (
          <>
            <h3>Hoạt chất</h3>
            <p>{p.attributes.active_ingredient}</p>
          </>
        )}
      </div>
    </div>
  );
}


