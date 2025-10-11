import { useState } from "react";
import useCart from "../hooks/useCart.js";
import SelectPurchaseModal from "./SelectPurchaseModal.jsx";

export default function ProductCard({ product }) {
  const { add } = useCart();
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: "1px solid #eee", padding: 12, borderRadius: 8 }}>
      <img 
        src={product.imageUrls?.[0] || "/default-product.svg"} 
        alt={product.name} 
        style={{ width: "100%", height: 140, objectFit: "cover" }}
        onError={(e) => {
          e.target.src = '/default-product.svg';
        }}
      />
      <h4 style={{ margin: "8px 0" }}>{product.name}</h4>
      <p style={{ color: "#2e7d32", fontWeight: 600 }}>{product.price?.toLocaleString()} đ</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <a href={`/p/${product.slug}`} style={{ color: "#3b82f6", textDecoration: "none", fontSize: 14 }}>Xem chi tiết</a>
        <button 
          className="btn-primary" 
          onClick={() => setOpen(true)} 
          style={{ 
            width: "100%",
            padding: "8px 16px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer"
          }}
        >
          Chọn sản phẩm
        </button>
      </div>
      <SelectPurchaseModal product={product} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}


