import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import api from "../api/client.js";
import { getImageUrl, handleImageError } from "../utils/imageUtils";

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders");
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "#f59e0b";
      case "confirmed": return "#3b82f6";
      case "shipped": return "#8b5cf6";
      case "delivered": return "#10b981";
      case "cancelled": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending": return "Chờ xác nhận";
      case "confirmed": return "Đã xác nhận";
      case "shipped": return "Đang giao hàng";
      case "delivered": return "Đã giao hàng";
      case "cancelled": return "Đã hủy";
      default: return status;
    }
  };

  if (!user) {
    return <div>Vui lòng đăng nhập để xem đơn hàng</div>;
  }

  if (isLoading) {
    return (
      <div style={{ maxWidth: 1200, margin: "40px auto", padding: 20, textAlign: "center" }}>
        <p>Đang tải đơn hàng...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "40px auto", padding: 20 }}>
      <h1 style={{ marginBottom: 32, color: "#1f2937" }}>Đơn hàng của tôi</h1>
      
      {orders.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          padding: "60px 20px",
          background: "white",
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
          <h3 style={{ color: "#374151", marginBottom: 8 }}>Chưa có đơn hàng nào</h3>
          <p style={{ color: "#6b7280", marginBottom: 24 }}>Hãy mua sắm để tạo đơn hàng đầu tiên của bạn!</p>
          <a 
            href="/products" 
            style={{
              display: "inline-block",
              padding: "12px 24px",
              background: "#667eea",
              color: "white",
              textDecoration: "none",
              borderRadius: 8,
              fontWeight: 500
            }}
          >
            Mua sắm ngay
          </a>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {orders.map((order) => (
            <div key={order._id} style={{
              background: "white",
              borderRadius: 12,
              padding: 24,
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              border: "1px solid #e5e7eb"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0, color: "#1f2937", fontSize: 18 }}>Đơn hàng #{order.orderNumber}</h3>
                  <p style={{ margin: "4px 0 0 0", color: "#6b7280", fontSize: 14 }}>
                    Ngày đặt: {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{
                    padding: "6px 12px",
                    borderRadius: 20,
                    background: getStatusColor(order.status) + "20",
                    color: getStatusColor(order.status),
                    fontSize: 12,
                    fontWeight: 500,
                    display: "inline-block"
                  }}>
                    {getStatusText(order.status)}
                  </div>
                  <p style={{ margin: "8px 0 0 0", color: "#1f2937", fontSize: 16, fontWeight: 600 }}>
                    {order.totalAmount?.toLocaleString("vi-VN")}₫
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <h4 style={{ margin: "0 0 12px 0", color: "#374151", fontSize: 14 }}>Sản phẩm:</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {order.items?.map((item, index) => (
                    <div key={index} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <img
                        src={getImageUrl(item.image, "/default-product.svg")}
                        alt={item.name}
                        onError={handleImageError}
                        style={{
                          width: 40,
                          height: 40,
                          objectFit: "cover",
                          borderRadius: 6
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, color: "#374151", fontSize: 14, fontWeight: 500 }}>
                          {item.name}
                        </p>
                        <p style={{ margin: "2px 0 0 0", color: "#6b7280", fontSize: 12 }}>
                          Số lượng: {item.quantity} × {item.price?.toLocaleString("vi-VN")}₫
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {order.shippingAddress && (
                <div style={{ marginBottom: 16 }}>
                  <h4 style={{ margin: "0 0 8px 0", color: "#374151", fontSize: 14 }}>Địa chỉ giao hàng:</h4>
                  <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>
                    {order.shippingAddress}
                  </p>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTop: "1px solid #e5e7eb" }}>
                <div style={{ display: "flex", gap: 12 }}>
                  <button style={{
                    padding: "8px 16px",
                    background: "#f3f4f6",
                    color: "#374151",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 14
                  }}>
                    Xem chi tiết
                  </button>
                  {order.status === "pending" && (
                    <button style={{
                      padding: "8px 16px",
                      background: "#ef4444",
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 14
                    }}>
                      Hủy đơn hàng
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
