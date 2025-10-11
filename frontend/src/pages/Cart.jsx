import { useState } from "react";
import useCart from "../hooks/useCart.js";

export default function Cart() {
  const { items, remove, clear, total, updateQty } = useCart();
  const [selectedAll, setSelectedAll] = useState(true);

  function handleQtyChange(id, newQty) {
    if (newQty <= 0) {
      remove(id);
    } else {
      updateQty(id, newQty);
    }
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 16 }}>
      <div style={{ marginBottom: 16 }}>
        <a href="/products" style={{ color: "#065f46", textDecoration: "none" }}>← Tiếp tục mua sắm</a>
      </div>

      <div style={{ background: "#e0f2fe", padding: 12, borderRadius: 8, marginBottom: 16, textAlign: "center" }}>
        <strong>Miễn phí vận chuyển đối với đơn hàng trên 300.000₫</strong>
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <h3>Giỏ hàng trống</h3>
          <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
          <a href="/products" className="btn-primary" style={{ display: "inline-block", marginTop: 16 }}>Mua sắm ngay</a>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <input type="checkbox" checked={selectedAll} onChange={(e) => setSelectedAll(e.target.checked)} />
              <span>Chọn tất cả ({items.length})</span>
            </div>

            <div className="card" style={{ padding: 0 }}>
              {items.map((item) => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", padding: 16, borderBottom: "1px solid #e5e7eb" }}>
                  <input type="checkbox" checked={selectedAll} style={{ marginRight: 12 }} />
                  <img src={item.image || "/vite.svg"} alt={item.name} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, marginRight: 16 }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: "0 0 8px", fontSize: 14 }}>{item.name}</h4>
                    <div style={{ color: "#2e7d32", fontWeight: 600, fontSize: 16 }}>{item.price.toLocaleString()}₫</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button onClick={() => handleQtyChange(item.id, item.qty - 1)} style={{ width: 32, height: 32, border: "1px solid #d1d5db", background: "white", borderRadius: 4 }}>-</button>
                      <input 
                        value={item.qty} 
                        onChange={(e) => handleQtyChange(item.id, parseInt(e.target.value || 1))}
                        style={{ width: 48, height: 32, textAlign: "center", border: "1px solid #d1d5db", borderRadius: 4 }}
                      />
                      <button onClick={() => handleQtyChange(item.id, item.qty + 1)} style={{ width: 32, height: 32, border: "1px solid #d1d5db", background: "white", borderRadius: 4 }}>+</button>
                    </div>
                    <div style={{ minWidth: 100, textAlign: "right", fontWeight: 600 }}>
                      {(item.price * item.qty).toLocaleString()}₫
                    </div>
                    <button onClick={() => remove(item.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: 8 }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ width: 320 }}>
            <div className="card" style={{ padding: 16, position: "sticky", top: 20 }}>
              <div style={{ marginBottom: 16 }}>
                <a href="#" style={{ color: "#065f46", textDecoration: "none", fontSize: 14 }}>Áp dụng ưu đãi để được giảm giá →</a>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span>Tổng tiền:</span>
                <span>{total.toLocaleString()}₫</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, color: "#6b7280" }}>
                <span>Giảm giá trực tiếp:</span>
                <span>0₫</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, color: "#6b7280" }}>
                <span>Giảm giá voucher:</span>
                <span>0₫</span>
              </div>
              
              <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 16, marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 18 }}>
                  <span>Thành tiền:</span>
                  <span style={{ color: "#2e7d32" }}>{total.toLocaleString()}₫</span>
                </div>
              </div>
              
              <button className="btn-primary" style={{ width: "100%", padding: 12, fontSize: 16, marginBottom: 12 }}>Mua hàng</button>
              
              <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.4 }}>
                Bằng việc tiến hành đặt mua hàng, bạn đồng ý với Điều khoản dịch vụ và Chính sách xử lý dữ liệu cá nhân của Smart Pharmacy.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


