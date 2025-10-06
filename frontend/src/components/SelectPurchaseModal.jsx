import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useCart from "../hooks/useCart.js";
import { showSuccess } from "../api/alert.js";

export default function SelectPurchaseModal({ product, open, onClose }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const navigate = useNavigate();
  if (!open || !product) return null;

  function addToCart() {
    add(product, qty);
    showSuccess("Đã thêm vào giỏ hàng");
    onClose?.();
  }

  function buyNow() {
    add(product, qty);
    onClose?.();
    navigate("/cart");
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div className="card" style={{ width: 900, background: "#fff", padding: 20, position: "relative", borderRadius: 14 }}>
        <button onClick={onClose} aria-label="Đóng" title="Đóng" style={{ position: "absolute", right: 10, top: 10, border: "none", background: "transparent", fontSize: 20, cursor: "pointer" }}>×</button>
        <div style={{ display: "flex", gap: 20 }}>
          <img src={product.imageUrls?.[0] || "/vite.svg"} alt={product.name} style={{ width: 260, height: 260, objectFit: "cover", borderRadius: 12 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{product.name}</div>
            <div style={{ color: "#2e7d32", fontWeight: 700, fontSize: 22, margin: "8px 0 18px" }}>{product.price?.toLocaleString()} đ</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <span>Số lượng</span>
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} style={{ padding: "6px 10px" }}>-</button>
              <input value={qty} onChange={(e) => setQty(Math.max(1, parseInt(e.target.value || 1, 10)))} style={{ width: 56, textAlign: "center", padding: 6 }} />
              <button onClick={() => setQty((q) => q + 1)} style={{ padding: "6px 10px" }}>+</button>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-primary" onClick={buyNow} style={{ padding: "8px 12px" }}>Mua ngay</button>
              <button onClick={addToCart} style={{ padding: "8px 12px" }}>Thêm vào giỏ</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


