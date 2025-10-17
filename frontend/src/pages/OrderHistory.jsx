import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const response = await fetch("/api/orders", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (response.ok) {
        const ordersData = await response.json();
        setOrders(ordersData);
      } else {
        console.error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }

  function getStatusText(status) {
    const statusMap = {
      pending: "Chờ xử lý",
      processing: "Đang xử lý",
      shipping: "Đang giao hàng",
      completed: "Hoàn thành",
      cancelled: "Đã hủy"
    };
    return statusMap[status] || status;
  }

  function getStatusColor(status) {
    const colorMap = {
      pending: "#f59e0b",
      processing: "#3b82f6",
      shipping: "#8b5cf6",
      completed: "#10b981",
      cancelled: "#ef4444"
    };
    return colorMap[status] || "#6b7280";
  }

  function getPaymentMethodText(method) {
    const methodMap = {
      cod: "Thanh toán khi nhận hàng",
      momo: "Ví điện tử MoMo",
      vnpay: "VNPay"
    };
    return methodMap[method] || method;
  }

  const filteredOrders = filter === "all" 
    ? orders 
    : orders.filter(order => order.status === filter);

  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: 16, textAlign: "center" }}>
        <div>Đang tải...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 16 }}>
      <div style={{ marginBottom: 24 }}>
        <a href="/products" style={{ color: "#065f46", textDecoration: "none" }}>← Tiếp tục mua sắm</a>
      </div>

      <h1 style={{ marginBottom: 24, color: "#1f2937" }}>Lịch sử đơn hàng</h1>

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            onClick={() => setFilter("all")}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              border: "1px solid #d1d5db",
              background: filter === "all" ? "#065f46" : "white",
              color: filter === "all" ? "white" : "#374151",
              cursor: "pointer",
              fontSize: 14
            }}
          >
            Tất cả ({orders.length})
          </button>
          <button
            onClick={() => setFilter("pending")}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              border: "1px solid #d1d5db",
              background: filter === "pending" ? "#f59e0b" : "white",
              color: filter === "pending" ? "white" : "#374151",
              cursor: "pointer",
              fontSize: 14
            }}
          >
            Chờ xử lý ({orders.filter(o => o.status === "pending").length})
          </button>
          <button
            onClick={() => setFilter("processing")}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              border: "1px solid #d1d5db",
              background: filter === "processing" ? "#3b82f6" : "white",
              color: filter === "processing" ? "white" : "#374151",
              cursor: "pointer",
              fontSize: 14
            }}
          >
            Đang xử lý ({orders.filter(o => o.status === "processing").length})
          </button>
          <button
            onClick={() => setFilter("shipping")}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              border: "1px solid #d1d5db",
              background: filter === "shipping" ? "#8b5cf6" : "white",
              color: filter === "shipping" ? "white" : "#374151",
              cursor: "pointer",
              fontSize: 14
            }}
          >
            Đang giao hàng ({orders.filter(o => o.status === "shipping").length})
          </button>
          <button
            onClick={() => setFilter("completed")}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              border: "1px solid #d1d5db",
              background: filter === "completed" ? "#10b981" : "white",
              color: filter === "completed" ? "white" : "#374151",
              cursor: "pointer",
              fontSize: 14
            }}
          >
            Hoàn thành ({orders.filter(o => o.status === "completed").length})
          </button>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <h3>Không có đơn hàng nào</h3>
          <p>Bạn chưa có đơn hàng nào với trạng thái này</p>
          <a href="/products" className="btn-primary" style={{ display: "inline-block", marginTop: 16 }}>
            Mua sắm ngay
          </a>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filteredOrders.map((order) => (
            <div key={order._id} className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: "0 0 8px", color: "#1f2937" }}>Đơn hàng #{order.code}</h3>
                  <div style={{ color: "#6b7280", fontSize: 14 }}>
                    Đặt ngày {new Date(order.createdAt).toLocaleString("vi-VN")}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ 
                    padding: "6px 12px", 
                    borderRadius: 16, 
                    background: getStatusColor(order.status),
                    color: "white",
                    fontWeight: 600,
                    fontSize: 12,
                    marginBottom: 8
                  }}>
                    {getStatusText(order.status)}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: "#2e7d32" }}>
                    {order.totals.grand.toLocaleString()}₫
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: "#6b7280" }}>Sản phẩm:</span>
                  <span>{order.items.length} sản phẩm</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: "#6b7280" }}>Phương thức thanh toán:</span>
                  <span>{getPaymentMethodText(order.paymentMethod)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#6b7280" }}>Giao đến:</span>
                  <span>
                    {order.shippingAddress.fullName} - {order.shippingAddress.phone}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button
                  onClick={() => navigate(`/orders/${order._id}`)}
                  style={{
                    padding: "8px 16px",
                    border: "1px solid #d1d5db",
                    background: "white",
                    color: "#374151",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontSize: 14
                  }}
                >
                  Xem chi tiết
                </button>
                {order.status === "pending" && (
                  <button
                    onClick={() => {
                      if (confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
                        // TODO: Implement cancel order
                        alert("Tính năng hủy đơn hàng sẽ được cập nhật sớm");
                      }
                    }}
                    style={{
                      padding: "8px 16px",
                      border: "1px solid #ef4444",
                      background: "white",
                      color: "#ef4444",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontSize: 14
                    }}
                  >
                    Hủy đơn hàng
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
