import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import api from "../api/client.js";
import { getImageUrl, handleImageError } from "../utils/imageUtils";

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

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
      case "processing": return "#3b82f6";
      case "shipping": return "#8b5cf6";
      case "completed": return "#10b981";
      case "cancelled": return "#ef4444";
      // Fallback cho các trạng thái cũ (nếu có trong database)
      case "confirmed": return "#3b82f6";
      case "delivered": return "#10b981";
      default: return "#6b7280";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending": return "Chờ xử lý";
      case "processing": return "Đang xử lý";
      case "shipping": return "Đang giao";
      case "completed": return "Hoàn tất";
      case "cancelled": return "Đã hủy";
      // Fallback cho các trạng thái cũ (nếu có trong database)
      case "confirmed": return "Đã xác nhận";
      case "delivered": return "Đã giao hàng";
      default: return status || "Không xác định";
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
    <div style={{ maxWidth: 1200, margin: "40px auto", padding: 20, marginTop: 'auto' }}>
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #e5e7eb" }}>
                <div>
                  <h3 style={{ margin: 0, color: "#1f2937", fontSize: 20, fontWeight: 700 }}>
                    Đơn hàng #{order.code || order.orderNumber || order._id.slice(-6).toUpperCase()}
                  </h3>
                  <p style={{ margin: "8px 0 0 0", color: "#6b7280", fontSize: 14 }}>
                    Ngày đặt: {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{
                    padding: "8px 16px",
                    borderRadius: 20,
                    background: getStatusColor(order.status) + "20",
                    color: getStatusColor(order.status),
                    fontSize: 13,
                    fontWeight: 600,
                    display: "inline-block",
                    marginBottom: 8
                  }}>
                    {getStatusText(order.status)}
                  </div>
                </div>
              </div>

              {/* Compact Product List */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h4 style={{ margin: 0, color: "#374151", fontSize: 14, fontWeight: 600 }}>
                    Sản phẩm ({order.items?.length || 0})
                  </h4>
                  <span style={{ color: "#1f2937", fontSize: 16, fontWeight: 700 }}>
                    {(order.totals?.grand || order.totalAmount || 0).toLocaleString("vi-VN")}₫
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {order.items?.slice(0, 2).map((item, index) => (
                    <div key={index} style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: 12,
                      fontSize: 14
                    }}>
                      <img
                        src={getImageUrl(item.imageSnapshot || item.image, "/default-product.svg")}
                        alt={item.nameSnapshot || item.name}
                        onError={handleImageError}
                        style={{
                          width: 40,
                          height: 40,
                          objectFit: "contain",
                          borderRadius: 6,
                          background: "#f9fafb",
                          padding: 4
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, color: "#374151", fontWeight: 500 }}>
                          {item.nameSnapshot || item.name || 'Sản phẩm'}
                        </p>
                        <p style={{ margin: "2px 0 0 0", color: "#9ca3af", fontSize: 13 }}>
                          {(item.priceSnapshot || item.price || 0).toLocaleString("vi-VN")}₫ × {item.quantity || 0}
                        </p>
                      </div>
                      <div style={{ textAlign: "right", color: "#374151", fontWeight: 600 }}>
                        {((item.priceSnapshot || item.price || 0) * (item.quantity || 0)).toLocaleString("vi-VN")}₫
                      </div>
                    </div>
                  ))}
                  {order.items?.length > 2 && (
                    <p style={{ margin: "4px 0 0 0", color: "#9ca3af", fontSize: 13, textAlign: "center" }}>
                      và {order.items.length - 2} sản phẩm khác...
                    </p>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTop: "1px solid #e5e7eb" }}>
                <div style={{ display: "flex", gap: 12 }}>
                  <button 
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowDetailModal(true);
                    }}
                    style={{
                      padding: "8px 16px",
                      background: "#3b82f6",
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 14,
                      fontWeight: 500,
                      transition: "background-color 0.2s"
                    }}
                    onMouseEnter={(e) => e.target.style.background = "#2563eb"}
                    onMouseLeave={(e) => e.target.style.background = "#3b82f6"}
                  >
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

      {/* Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20
          }}
          onClick={() => setShowDetailModal(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: 12,
              maxWidth: 800,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 30
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#1f2937" }}>
                  Đơn hàng #{selectedOrder.code || selectedOrder.orderNumber || selectedOrder._id.slice(-6).toUpperCase()}
                </h2>
                <p style={{ margin: "8px 0 0 0", color: "#6b7280", fontSize: 14 }}>
                  Ngày đặt: {new Date(selectedOrder.createdAt).toLocaleDateString("vi-VN", {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 28,
                  color: "#9ca3af",
                  cursor: "pointer",
                  padding: 0,
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            {/* Status */}
            <div style={{ marginBottom: 24 }}>
              <div style={{
                display: "inline-block",
                padding: "8px 16px",
                borderRadius: 20,
                background: getStatusColor(selectedOrder.status) + "20",
                color: getStatusColor(selectedOrder.status),
                fontSize: 13,
                fontWeight: 600
              }}>
                {getStatusText(selectedOrder.status)}
              </div>
            </div>

            {/* Products */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: 18, fontWeight: 600, color: "#1f2937" }}>
                Sản phẩm
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {selectedOrder.items?.map((item, index) => (
                  <div key={index} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: 12,
                    background: "#f9fafb",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb"
                  }}>
                    <img
                      src={getImageUrl(item.imageSnapshot || item.image, "/default-product.svg")}
                      alt={item.nameSnapshot || item.name}
                      onError={handleImageError}
                      style={{
                        width: 60,
                        height: 60,
                        objectFit: "contain",
                        borderRadius: 8,
                        background: "white",
                        padding: 4
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, color: "#1f2937", fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                        {item.nameSnapshot || item.name || 'Sản phẩm'}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 13 }}>
                        <span style={{ color: "#6b7280" }}>
                          Đơn giá: <span style={{ fontWeight: 600, color: "#374151" }}>{(item.priceSnapshot || item.price || 0).toLocaleString("vi-VN")}₫</span>
                        </span>
                        <span style={{ color: "#6b7280" }}>
                          Số lượng: <span style={{ fontWeight: 600, color: "#374151" }}>×{item.quantity || 0}</span>
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: 0, color: "#dc2626", fontSize: 16, fontWeight: 700 }}>
                        {((item.priceSnapshot || item.price || 0) * (item.quantity || 0)).toLocaleString("vi-VN")}₫
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            {selectedOrder.shippingAddress && (
              <div style={{ marginBottom: 24, padding: 16, background: "#f9fafb", borderRadius: 8 }}>
                <h3 style={{ margin: "0 0 12px 0", fontSize: 18, fontWeight: 600, color: "#1f2937" }}>
                  Địa chỉ giao hàng
                </h3>
                <div style={{ fontSize: 14, lineHeight: 1.6 }}>
                  <p style={{ margin: "0 0 6px 0", color: "#374151", fontWeight: 600 }}>
                    {typeof selectedOrder.shippingAddress === 'string'
                      ? selectedOrder.shippingAddress
                      : `${selectedOrder.shippingAddress.fullName || ''}`}
                  </p>
                  {typeof selectedOrder.shippingAddress === 'object' && selectedOrder.shippingAddress.phone && (
                    <p style={{ margin: "0 0 6px 0", color: "#6b7280" }}>
                      SĐT: {selectedOrder.shippingAddress.phone}
                    </p>
                  )}
                  {typeof selectedOrder.shippingAddress === 'object' && selectedOrder.shippingAddress.address && (
                    <p style={{ margin: "0 0 6px 0", color: "#6b7280" }}>
                      {selectedOrder.shippingAddress.address}
                    </p>
                  )}
                  {typeof selectedOrder.shippingAddress === 'object' && selectedOrder.shippingAddress.email && (
                    <p style={{ margin: "0 0 6px 0", color: "#6b7280" }}>
                      Email: {selectedOrder.shippingAddress.email}
                    </p>
                  )}
                  {typeof selectedOrder.shippingAddress === 'object' && selectedOrder.shippingAddress.note && (
                    <p style={{ margin: "6px 0 0 0", color: "#9ca3af", fontSize: 13, fontStyle: "italic" }}>
                      Ghi chú: {selectedOrder.shippingAddress.note}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div style={{
              padding: 16,
              background: "#f9fafb",
              borderRadius: 8,
              border: "1px solid #e5e7eb"
            }}>
              <h3 style={{ margin: "0 0 12px 0", fontSize: 18, fontWeight: 600, color: "#1f2937" }}>
                Tổng kết đơn hàng
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "#6b7280" }}>Tạm tính:</span>
                  <span style={{ color: "#374151", fontWeight: 600 }}>
                    {(selectedOrder.totals?.items || selectedOrder.items?.reduce((sum, item) => sum + ((item.priceSnapshot || item.price || 0) * (item.quantity || 0)), 0) || 0).toLocaleString("vi-VN")}₫
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "#6b7280" }}>Phí vận chuyển:</span>
                  <span style={{ color: "#374151", fontWeight: 600 }}>
                    {(selectedOrder.totals?.shipping || selectedOrder.shippingFee) ? `${(selectedOrder.totals?.shipping || selectedOrder.shippingFee).toLocaleString("vi-VN")}₫` : 'Miễn phí'}
                  </span>
                </div>
                {(selectedOrder.totals?.discount || selectedOrder.discount) > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span style={{ color: "#6b7280" }}>Giảm giá:</span>
                    <span style={{ color: "#059669", fontWeight: 600 }}>
                      -{(selectedOrder.totals?.discount || selectedOrder.discount).toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                )}
                <div style={{
                  height: 1,
                  background: "#d1d5db",
                  margin: "8px 0"
                }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16 }}>
                  <span style={{ color: "#1f2937", fontWeight: 700 }}>Tổng cộng:</span>
                  <span style={{ color: "#dc2626", fontWeight: 700, fontSize: 20 }}>
                    {(selectedOrder.totals?.grand || selectedOrder.totalAmount || 0).toLocaleString("vi-VN")}₫
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

