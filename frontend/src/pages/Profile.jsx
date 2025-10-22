import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import api from "../api/client.js";

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
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 20 }}>
      <h1 style={{ marginBottom: 32, color: "#1f2937" }}>Thông tin cá nhân</h1>
      
      <div style={{ 
        background: "white", 
        borderRadius: 12, 
        padding: 24, 
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        border: "1px solid #e5e7eb"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
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
                  padding: "12px 16px",
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  fontSize: 14,
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
                  padding: "12px 16px",
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  fontSize: 14,
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
                  padding: "12px 16px",
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  fontSize: 14,
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
