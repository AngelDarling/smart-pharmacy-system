import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import api from "../api/client.js";

function PointHistoryTable() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/auth/me/point-history");
        setHistory(res.data);
      } catch {} // lỗi mạng/API -> giữ history=[]
      setLoading(false);
    })();
  }, []);

  return (
    <div style={{ marginTop: 20 }}>
      <h3 style={{ margin: 0, color: "#4f46e5", fontWeight: 600, marginBottom: 16 }}>Lịch sử nhận điểm</h3>
      {loading ? (
        <div>Đang tải...</div>
      ) : history.length === 0 ? (
        <div>Bạn chưa có lịch sử nhận điểm.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 400, background: "#f9fafb", borderRadius: 8 }}>
          <thead>
            <tr style={{ background: "#e0e7ff" }}>
              <th style={{ padding: 12, textAlign: "left", fontWeight: 500 }}>Mã đơn hàng</th>
              <th style={{ padding: 12, textAlign: "center", fontWeight: 500 }}>Số điểm nhận</th>
              <th style={{ padding: 12, textAlign: "center", fontWeight: 500 }}>Ngày nhận</th>
            </tr>
          </thead>
          <tbody>
            {history.map(log => (
              <tr key={log._id || log.orderCode}>
                <td style={{ padding: 12 }}>{log.orderCode || "-"}</td>
                <td style={{ padding: 12, textAlign: "center", fontWeight: 600 }}>{log.points}</td>
                <td style={{ padding: 12, textAlign: "center" }}>{new Date(log.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || ""
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await api.put("/auth/profile", formData);
      await refreshUser();
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div>Vui lòng đăng nhập để xem thông tin cá nhân</div>;
  }

  return (
    <div style={{ maxWidth: 960, width: "100%", margin: "40px auto 0", padding: 20 }}>
      <h1 style={{ marginBottom: 32, color: "#1f2937" }}>Thông tin cá nhân</h1>
      
      <div style={{ 
        background: "white", 
        borderRadius: 12, 
        padding: 32, 
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        border: "1px solid #e5e7eb",
        maxWidth: 900, width: "100%",
        margin: "0 auto"
      }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24, justifyContent: "space-between", gap: 10 }}>
          <h2 style={{ margin: 0, color: "#374151" }}>Thông tin tài khoản</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                padding: "8px 16px",
                background: "#667eea",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer"
              }}
            >
              Chỉnh sửa
            </button>
          )}
        </div>
        <div style={{
          marginBottom: 24,
          background: "#eef2ff",
          padding: "16px 16px 16px 24px",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          gap: 20,
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontWeight: 500, color: "#4f46e5", fontSize: 18 }}>
              Điểm tích lũy:
            </span>
            <span style={{ color: "#1e293b", fontSize: 22, fontWeight: 700 }}>
              {user.loyaltyPoints || 0} điểm
            </span>
          </div>
          <button
            style={{
              padding: "8px 18px",
              background: showHistory ? "#6366f1" : "#e5e7eb",
              color: showHistory ? "white" : "#374151",
              border: "none",
              borderRadius: 7,
              cursor: "pointer",
              fontWeight: 500,
              fontSize: 15
            }}
            onClick={() => setShowHistory(v => !v)}
          >
            {showHistory ? "Đóng lịch sử" : "Lịch sử điểm"}
          </button>
        </div>
        {showHistory && <PointHistoryTable />}

        <div style={{ display: "grid", gap: 16 }}>
          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#374151" }}>
              Họ và tên
            </label>
            {isEditing ? (
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  fontSize: 16,
                  boxSizing: "border-box"
                }}
              />
            ) : (
              <p style={{ margin: 0, padding: "12px 16px", background: "#f9fafb", borderRadius: 8, color: "#374151" }}>
                {user.fullName || user.name || "Chưa cập nhật"}
              </p>
            )}
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#374151" }}>
              Số điện thoại
            </label>
            <p style={{ margin: 0, padding: "12px 16px", background: "#f9fafb", borderRadius: 8, color: "#374151" }}>
              {user.phone || "Chưa cập nhật"}
            </p>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#374151" }}>
              Email
            </label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  fontSize: 16,
                  boxSizing: "border-box"
                }}
              />
            ) : (
              <p style={{ margin: 0, padding: "12px 16px", background: "#f9fafb", borderRadius: 8, color: "#374151" }}>
                {user.email || "Chưa cập nhật"}
              </p>
            )}
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#374151" }}>
              Địa chỉ
            </label>
            {isEditing ? (
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  fontSize: 16,
                  boxSizing: "border-box",
                  resize: "vertical"
                }}
              />
            ) : (
              <p style={{ margin: 0, padding: "12px 16px", background: "#f9fafb", borderRadius: 8, color: "#374151" }}>
                {user.address || "Chưa cập nhật"}
              </p>
            )}
          </div>
        </div>

        {isEditing && (
          <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
            <button
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  fullName: user.fullName || user.name || "",
                  email: user.email || "",
                  phone: user.phone || "",
                  address: user.address || ""
                });
              }}
              style={{
                padding: "12px 24px",
                background: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer"
              }}
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              style={{
                padding: "12px 24px",
                background: isLoading ? "#9ca3af" : "#667eea",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: isLoading ? "not-allowed" : "pointer"
              }}
            >
              {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
