import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useCart from "../hooks/useCart.js";
import { getImageUrl, handleImageError } from "../utils/imageUtils";

// Global function để trigger cart dropdown
window.showCartDropdown = null;

export default function SelectPurchaseModal({ product, open, onClose }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const navigate = useNavigate();
  if (!open || !product) return null;

  function addToCart() {
    console.log('addToCart called:', { product: product._id, name: product.name, qty });
    add(product, qty);
    
    // Scroll lên đầu trang
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Hiển thị dropdown giỏ hàng
    if (window.showCartDropdown) {
      window.showCartDropdown();
    }
    
    // Đóng modal ngay lập tức sau khi thêm
    onClose?.();
  }

  function buyNow() {
    console.log('buyNow called:', { product: product._id, name: product.name, qty });
    add(product, qty);
    onClose?.();
    // Scroll to top before navigating
    window.scrollTo({ top: 0, behavior: 'instant' });
    navigate("/cart");
    // Ensure scroll at top after navigation
    setTimeout(() => {
      try { window.scrollTo({ top: 0, behavior: 'instant' }); } catch {}
    }, 0);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div className="card" style={{ width: 900, background: "#fff", padding: 20, position: "relative", borderRadius: 14 }}>
        <button onClick={onClose} aria-label="Đóng" title="Đóng" style={{ position: "absolute", right: 10, top: 10, border: "none", background: "transparent", fontSize: 20, cursor: "pointer", color: "#666" }}>×</button>
        <div style={{ display: "flex", gap: 20 }}>
          <img 
            src={getImageUrl(product.imageUrls?.[0], "/vite.svg")} 
            alt={product.name} 
            style={{ width: 260, height: 260, objectFit: "cover", borderRadius: 12 }}
            onError={(e) => handleImageError(e, "/vite.svg")}
          />
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


