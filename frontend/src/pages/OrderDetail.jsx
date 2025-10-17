import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  async function fetchOrder() {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (response.ok) {
        const orderData = await response.json();
        setOrder(orderData);
      } else {
        alert("Không tìm thấy đơn hàng");
        navigate("/orders");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      alert("Có lỗi xảy ra khi tải đơn hàng");
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

  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: 16, textAlign: "center" }}>
        <div>Đang tải...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: 16, textAlign: "center" }}>
        <h2>Không tìm thấy đơn hàng</h2>
        <button onClick={() => navigate("/orders")} className="btn-primary">
          Xem lịch sử đơn hàng
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 16 }}>
      <div style={{ marginBottom: 16 }}>
        <a href="/orders" style={{ color: "#065f46", textDecoration: "none" }}>← Quay lại lịch sử đơn hàng</a>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ color: "#1f2937" }}>Chi tiết đơn hàng #{order.code}</h1>
        <div style={{ 
          padding: "8px 16px", 
          borderRadius: 20, 
          background: getStatusColor(order.status),
          color: "white",
          fontWeight: 600,
          fontSize: 14
        }}>
          {getStatusText(order.status)}
        </div>
      </div>

      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ flex: 1 }}>
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16, color: "#1f2937" }}>Thông tin giao hàng</h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <strong>Họ và tên:</strong>
                <div>{order.shippingAddress.fullName}</div>
              </div>
              <div>
                <strong>Số điện thoại:</strong>
                <div>{order.shippingAddress.phone}</div>
              </div>
            </div>

            {order.shippingAddress.email && (
              <div style={{ marginBottom: 16 }}>
                <strong>Email:</strong>
                <div>{order.shippingAddress.email}</div>
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <strong>Địa chỉ:</strong>
              <div>
                {order.shippingAddress.address}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.city}
              </div>
            </div>

            {order.shippingAddress.note && (
              <div>
                <strong>Ghi chú:</strong>
                <div>{order.shippingAddress.note}</div>
              </div>
            )}
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 16, color: "#1f2937" }}>Sản phẩm đã đặt</h3>
            
            <div style={{ marginBottom: 16 }}>
              {order.items.map((item, index) => (
                <div key={index} style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  padding: "12px 0", 
                  borderBottom: "1px solid #e5e7eb" 
                }}>
                  <div style={{ width: 60, height: 60, background: "#f3f4f6", borderRadius: 4, marginRight: 12 }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>{item.nameSnapshot}</div>
                    <div style={{ color: "#6b7280", fontSize: 14 }}>
                      {item.priceSnapshot.toLocaleString()}₫ x {item.quantity}
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, color: "#2e7d32" }}>
                    {(item.priceSnapshot * item.quantity).toLocaleString()}₫
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ width: 400 }}>
          <div className="card" style={{ position: "sticky", top: 20 }}>
            <h3 style={{ marginBottom: 16, color: "#1f2937" }}>Tóm tắt đơn hàng</h3>
            
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span>Tạm tính:</span>
                <span>{order.totals.items.toLocaleString()}₫</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span>Phí vận chuyển:</span>
                <span style={{ color: order.totals.shipping === 0 ? "#2e7d32" : "#6b7280" }}>
                  {order.totals.shipping === 0 ? "Miễn phí" : `${order.totals.shipping.toLocaleString()}₫`}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span>Giảm giá:</span>
                <span>{order.totals.discount.toLocaleString()}₫</span>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 16, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 18 }}>
                <span>Tổng cộng:</span>
                <span style={{ color: "#2e7d32" }}>{order.totals.grand.toLocaleString()}₫</span>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <strong>Phương thức thanh toán:</strong>
              <div>{getPaymentMethodText(order.paymentMethod)}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <strong>Ngày đặt hàng:</strong>
              <div>{new Date(order.createdAt).toLocaleString("vi-VN")}</div>
            </div>

            {order.status === "pending" && (
              <button 
                className="btn-secondary" 
                style={{ width: "100%", padding: 12, fontSize: 16, marginBottom: 12 }}
                onClick={() => {
                  if (confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
                    // TODO: Implement cancel order
                    alert("Tính năng hủy đơn hàng sẽ được cập nhật sớm");
                  }
                }}
              >
                Hủy đơn hàng
              </button>
            )}

            <button 
              onClick={() => navigate("/products")} 
              className="btn-primary" 
              style={{ width: "100%" }}
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
