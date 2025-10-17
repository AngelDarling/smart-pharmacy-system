import { useState } from "react";
import useCart from "../hooks/useCart.js";

export default function TestCheckout() {
  const { add, items, clear } = useCart();
  const [testProducts] = useState([
    { id: "1", name: "Thuốc Fucagi 500mg Agimexpharm điều trị nhiễm một hoặc nhiều loại giun đường ruột (1 viên)", price: 16000, image: "/default-product.png" },
    { id: "2", name: "Thuốc mỡ bôi da Agiclovir 5% Agimexpharm điều trị nhiễm Herpes simplex, Herpes zoster, Herpes sinh dục (5g)", price: 10000, image: "/default-product.png" },
    { id: "3", name: "Sữa bột CaloSure gold Vitadairy ít đường, tăng cường sức khỏe tim mạch, hồi phục sức khỏe (900g)", price: 816000, image: "/default-product.png" },
    { id: "4", name: "Vitamin C 1000mg", price: 120000, image: "/default-product.png" },
    { id: "5", name: "Máy đo huyết áp", price: 650000, image: "/default-product.png" }
  ]);

  function addTestProduct(product) {
    add(product);
  }

  function clearCart() {
    clear();
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 16 }}>
      <h1>Test Checkout Flow</h1>
      
      <div style={{ marginBottom: 20 }}>
        <h2>Test Products</h2>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {testProducts.map(product => (
            <div key={product.id} style={{ 
              border: "1px solid #e5e7eb", 
              borderRadius: 8, 
              padding: 16, 
              width: 200,
              textAlign: "center"
            }}>
              <img src={product.image} alt={product.name} style={{ width: 100, height: 100, objectFit: "cover", marginBottom: 8 }} />
              <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>{product.name}</h3>
              <div style={{ color: "#2e7d32", fontWeight: 600, marginBottom: 8 }}>
                {product.price.toLocaleString()}₫
              </div>
              <button 
                onClick={() => addTestProduct(product)}
                style={{
                  background: "#065f46",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: 4,
                  cursor: "pointer"
                }}
              >
                Thêm vào giỏ
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h2>Current Cart ({items.length} items)</h2>
        {items.length > 0 ? (
          <div>
            {items.map(item => (
              <div key={item.id} style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                padding: "8px 0", 
                borderBottom: "1px solid #e5e7eb" 
              }}>
                <span>{item.name} x{item.qty}</span>
                <span>{(item.price * item.qty).toLocaleString()}₫</span>
              </div>
            ))}
            <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
              <a href="/cart" style={{
                background: "#065f46",
                color: "white",
                padding: "12px 24px",
                borderRadius: 4,
                textDecoration: "none",
                display: "inline-block"
              }}>
                Xem giỏ hàng
              </a>
              <a href="/checkout" style={{
                background: "#3b82f6",
                color: "white",
                padding: "12px 24px",
                borderRadius: 4,
                textDecoration: "none",
                display: "inline-block"
              }}>
                Thanh toán
              </a>
              <button 
                onClick={clearCart}
                style={{
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: 4,
                  cursor: "pointer"
                }}
              >
                Xóa giỏ hàng
              </button>
            </div>
          </div>
        ) : (
          <p>Giỏ hàng trống</p>
        )}
      </div>

      <div style={{ marginBottom: 20 }}>
        <h2>Test Links</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="/cart" style={{ color: "#065f46" }}>Cart Page</a>
          <a href="/checkout" style={{ color: "#065f46" }}>Checkout Page</a>
          <a href="/orders" style={{ color: "#065f46" }}>Order History</a>
          <a href="/products" style={{ color: "#065f46" }}>Products Page</a>
        </div>
      </div>
    </div>
  );
}
