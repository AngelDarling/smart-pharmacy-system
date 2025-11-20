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
      case "pending": return { bg: "#fff7ed", text: "#d97706", border: "#fed7aa" };
      case "processing": return { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" };
      case "shipping": return { bg: "#f5f3ff", text: "#7c3aed", border: "#ddd6fe" };
      case "completed": return { bg: "#ecfdf5", text: "#059669", border: "#a7f3d0" };
      case "cancelled": return { bg: "#fef2f2", text: "#dc2626", border: "#fecaca" };
      case "confirmed": return { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" };
      case "delivered": return { bg: "#ecfdf5", text: "#059669", border: "#a7f3d0" };
      default: return { bg: "#f3f4f6", text: "#4b5563", border: "#e5e7eb" };
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending": return "Chờ xử lý";
      case "processing": return "Đang xử lý";
      case "shipping": return "Đang giao hàng";
      case "completed": return "Giao hàng thành công";
      case "cancelled": return "Đã hủy";
      case "confirmed": return "Đã xác nhận";
      case "delivered": return "Đã giao hàng";
      default: return status || "Không xác định";
    }
  };

  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#374151', marginBottom: 16 }}>Vui lòng đăng nhập</h2>
          <p style={{ color: '#6b7280' }}>Bạn cần đăng nhập để xem lịch sử đơn hàng</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ maxWidth: 1200, margin: "40px auto", padding: 20, textAlign: "center" }}>
        <div style={{
          display: 'inline-block',
          width: 40,
          height: 40,
          border: '3px solid #e5e7eb',
          borderTopColor: '#3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: 16, color: '#6b7280' }}>Đang tải đơn hàng...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "40px auto", padding: "0 24px", marginTop: 'auto' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#111827", marginBottom: 8 }}>Đơn hàng của tôi</h1>
        <p style={{ color: "#6b7280", fontSize: 16 }}>Quản lý và theo dõi các đơn hàng của bạn</p>
      </div>

      {orders.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "80px 20px",
          background: "white",
          borderRadius: 24,
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          border: "1px solid #f3f4f6"
        }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>📦</div>
          <h3 style={{ fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: 12 }}>Chưa có đơn hàng nào</h3>
          <p style={{ color: "#6b7280", marginBottom: 32, fontSize: 16 }}>Hãy khám phá các sản phẩm chất lượng của chúng tôi!</p>
          <a
            href="/products"
            style={{
              display: "inline-block",
              padding: "16px 32px",
              background: "#2563eb",
              color: "white",
              textDecoration: "none",
              borderRadius: 12,
              fontWeight: 600,
              fontSize: 16,
              boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)",
              transition: "all 0.2s"
            }}
          >
            Bắt đầu mua sắm
          </a>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {orders.map((order) => {
            const statusStyle = getStatusColor(order.status);
            return (
              <div key={order._id} style={{
                background: "white",
                borderRadius: 20,
                padding: 32,
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
                border: "1px solid #f3f4f6",
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "pointer"
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)";
                }}
                onClick={() => {
                  setSelectedOrder(order);
                  setShowDetailModal(true);
                }}
              >
                {/* Order Header */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 24,
                  paddingBottom: 20,
                  borderBottom: "1px solid #f3f4f6"
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: '#eff6ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#2563eb'
                    }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                        <line x1="12" y1="22.08" x2="12" y2="12"></line>
                      </svg>
                    </div>
                    <div>
                      <h3 style={{ margin: 0, color: "#111827", fontSize: 20, fontWeight: 700 }}>
                        #{order.code || order.orderNumber || order._id.slice(-6).toUpperCase()}
                      </h3>
                      <p style={{ margin: "4px 0 0 0", color: "#6b7280", fontSize: 14 }}>
                        Đặt ngày {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                          year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div style={{
                    padding: "8px 16px",
                    borderRadius: 999,
                    background: statusStyle.bg,
                    color: statusStyle.text,
                    border: `1px solid ${statusStyle.border}`,
                    fontSize: 14,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusStyle.text }}></span>
                    {getStatusText(order.status)}
                  </div>
                </div>

                {/* Product Preview */}
                <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
                  <div style={{ flex: 1 }}>
                    {order.items?.slice(0, 2).map((item, index) => (
                      <div key={index} style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 20,
                        marginBottom: 16,
                        padding: 12,
                        borderRadius: 12,
                        background: '#f9fafb'
                      }}>
                        <img
                          src={getImageUrl(item.imageSnapshot || item.image, "/default-product.svg")}
                          alt={item.nameSnapshot || item.name}
                          onError={handleImageError}
                          style={{
                            width: 80,
                            height: 80,
                            objectFit: "contain",
                            borderRadius: 8,
                            background: "white",
                            padding: 4,
                            border: '1px solid #e5e7eb'
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: "0 0 4px 0", color: "#111827", fontWeight: 600, fontSize: 16 }}>
                            {item.nameSnapshot || item.name || 'Sản phẩm'}
                          </p>
                          <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>
                            {(item.priceSnapshot || item.price || 0).toLocaleString("vi-VN")}₫ × {item.quantity || 0}
                          </p>
                        </div>
                        <div style={{ textAlign: "right", color: "#111827", fontWeight: 700, fontSize: 16 }}>
                          {((item.priceSnapshot || item.price || 0) * (item.quantity || 0)).toLocaleString("vi-VN")}₫
                        </div>
                      </div>
                    ))}
                    {order.items?.length > 2 && (
                      <p style={{ margin: "8px 0 0 0", color: "#6b7280", fontSize: 14, paddingLeft: 12 }}>
                        + {order.items.length - 2} sản phẩm khác...
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 20,
                  borderTop: "1px solid #f3f4f6"
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 14, color: '#6b7280' }}>Tổng tiền thanh toán</span>
                    <span style={{ fontSize: 24, fontWeight: 800, color: '#dc2626' }}>
                      {(order.totals?.grand || order.totalAmount || 0).toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    {order.status === "pending" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle cancel logic here or open modal
                          setSelectedOrder(order);
                          setShowDetailModal(true);
                        }}
                        style={{
                          padding: "12px 24px",
                          background: "white",
                          color: "#ef4444",
                          border: "1px solid #ef4444",
                          borderRadius: 10,
                          cursor: "pointer",
                          fontSize: 15,
                          fontWeight: 600,
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => e.target.style.background = "#fef2f2"}
                        onMouseLeave={(e) => e.target.style.background = "white"}
                      >
                        Hủy đơn hàng
                      </button>
                    )}
                    <button
                      style={{
                        padding: "12px 24px",
                        background: "#2563eb",
                        color: "white",
                        border: "none",
                        borderRadius: 10,
                        cursor: "pointer",
                        fontSize: 15,
                        fontWeight: 600,
                        boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => e.target.style.background = "#1d4ed8"}
                      onMouseLeave={(e) => e.target.style.background = "#2563eb"}
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
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
              borderRadius: 24,
              maxWidth: 900,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 40,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#111827" }}>
                  Chi tiết đơn hàng
                </h2>
                <p style={{ margin: "8px 0 0 0", color: "#6b7280", fontSize: 16 }}>
                  Mã đơn: <span style={{ fontWeight: 600, color: "#374151" }}>#{selectedOrder.code || selectedOrder.orderNumber || selectedOrder._id.slice(-6).toUpperCase()}</span>
                </p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  background: "white",
                  border: "1px solid #e5e7eb",
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: "pointer",
                  color: "#000000",
                  padding: 0,
                  transition: 'all 0.2s',
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f9fafb";
                  e.currentTarget.style.borderColor = "#d1d5db";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "white";
                  e.currentTarget.style.borderColor = "#e5e7eb";
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32 }}>
              {/* Left Column: Products & Status */}
              <div>
                {/* Status Card */}
                <div style={{
                  padding: 20,
                  background: getStatusColor(selectedOrder.status).bg,
                  border: `1px solid ${getStatusColor(selectedOrder.status).border}`,
                  borderRadius: 16,
                  marginBottom: 24,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: getStatusColor(selectedOrder.status).text
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>Trạng thái đơn hàng</p>
                    <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: getStatusColor(selectedOrder.status).text }}>
                      {getStatusText(selectedOrder.status)}
                    </p>
                  </div>
                </div>

                {/* Products List */}
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Sản phẩm</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 20,
                      padding: 16,
                      background: "white",
                      borderRadius: 16,
                      border: "1px solid #e5e7eb"
                    }}>
                      <img
                        src={getImageUrl(item.imageSnapshot || item.image, "/default-product.svg")}
                        alt={item.nameSnapshot || item.name}
                        onError={handleImageError}
                        style={{
                          width: 80,
                          height: 80,
                          objectFit: "contain",
                          borderRadius: 12,
                          background: "#f9fafb",
                          padding: 4
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: "0 0 4px 0", color: "#111827", fontSize: 16, fontWeight: 600 }}>
                          {item.nameSnapshot || item.name || 'Sản phẩm'}
                        </p>
                        <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>
                          Đơn giá: {(item.priceSnapshot || item.price || 0).toLocaleString("vi-VN")}₫
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ margin: "0 0 4px 0", color: "#6b7280", fontSize: 14 }}>
                          x{item.quantity || 0}
                        </p>
                        <p style={{ margin: 0, color: "#111827", fontSize: 16, fontWeight: 700 }}>
                          {((item.priceSnapshot || item.price || 0) * (item.quantity || 0)).toLocaleString("vi-VN")}₫
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Info & Summary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Shipping Info */}
                <div style={{ padding: 24, background: "#f9fafb", borderRadius: 20 }}>
                  <h3 style={{ margin: "0 0 16px 0", fontSize: 18, fontWeight: 700, color: "#111827" }}>
                    Thông tin giao hàng
                  </h3>
                  {selectedOrder.shippingAddress ? (
                    <div style={{ fontSize: 15, lineHeight: 1.6, color: '#4b5563' }}>
                      <p style={{ margin: "0 0 8px 0", fontWeight: 600, color: "#111827", display: 'flex', alignItems: 'center', gap: 8 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        {typeof selectedOrder.shippingAddress === 'string'
                          ? selectedOrder.shippingAddress
                          : `${selectedOrder.shippingAddress.fullName || ''}`}
                      </p>
                      {typeof selectedOrder.shippingAddress === 'object' && (
                        <>
                          <p style={{ margin: "0 0 8px 0", display: 'flex', alignItems: 'center', gap: 8 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                            {selectedOrder.shippingAddress.phone}
                          </p>
                          <p style={{ margin: "0 0 8px 0", display: 'flex', alignItems: 'start', gap: 8 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginTop: 4 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            {selectedOrder.shippingAddress.address}
                          </p>
                        </>
                      )}
                    </div>
                  ) : (
                    <p style={{ color: '#9ca3af' }}>Chưa có thông tin</p>
                  )}
                </div>

                {/* Order Summary */}
                <div style={{
                  padding: 24,
                  background: "white",
                  borderRadius: 20,
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
                }}>
                  <h3 style={{ margin: "0 0 20px 0", fontSize: 18, fontWeight: 700, color: "#111827" }}>
                    Tổng thanh toán
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15 }}>
                      <span style={{ color: "#6b7280" }}>Tạm tính</span>
                      <span style={{ color: "#111827", fontWeight: 600 }}>
                        {(selectedOrder.totals?.items || selectedOrder.items?.reduce((sum, item) => sum + ((item.priceSnapshot || item.price || 0) * (item.quantity || 0)), 0) || 0).toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15 }}>
                      <span style={{ color: "#6b7280" }}>Phí vận chuyển</span>
                      <span style={{ color: "#111827", fontWeight: 600 }}>
                        {(selectedOrder.totals?.shipping || selectedOrder.shippingFee) ? `${(selectedOrder.totals?.shipping || selectedOrder.shippingFee).toLocaleString("vi-VN")}₫` : 'Miễn phí'}
                      </span>
                    </div>
                    {(selectedOrder.totals?.discount || selectedOrder.discount) > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15 }}>
                        <span style={{ color: "#6b7280" }}>Giảm giá</span>
                        <span style={{ color: "#059669", fontWeight: 600 }}>
                          -{(selectedOrder.totals?.discount || selectedOrder.discount).toLocaleString("vi-VN")}₫
                        </span>
                      </div>
                    )}
                    <div style={{ height: 1, background: "#e5e7eb", margin: "8px 0" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: 'center' }}>
                      <span style={{ color: "#111827", fontWeight: 700, fontSize: 16 }}>Tổng cộng</span>
                      <span style={{ color: "#dc2626", fontWeight: 800, fontSize: 24 }}>
                        {(selectedOrder.totals?.grand || selectedOrder.totalAmount || 0).toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

