import { useState, useEffect } from "react";
import { Table, Tag, Typography, Card, Space, Button, Descriptions, Empty, Spin } from 'antd';
import { CrownOutlined, HistoryOutlined, ShoppingOutlined, CalendarOutlined } from '@ant-design/icons';
import { useAuth } from "../contexts/AuthContext.jsx";
import api from "../api/client.js";

const { Text, Title } = Typography;

function PointHistoryTable() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/auth/me/point-history");
        setHistory(res.data);
      } catch (err) {
        console.error("Error fetching point history:", err);
      }
      setLoading(false);
    })();
  }, []);

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderCode',
      key: 'orderCode',
      render: (code) => (
        <Space>
          <ShoppingOutlined style={{ color: '#6366f1' }} />
          <Text strong>{code || "-"}</Text>
        </Space>
      )
    },
    {
      title: 'Số điểm nhận',
      dataIndex: 'points',
      key: 'points',
      align: 'center',
      render: (points) => (
        <Tag color="purple" style={{ fontSize: '14px', padding: '4px 12px', borderRadius: 20 }}>
          <CrownOutlined /> +{points} điểm
        </Tag>
      )
    },
    {
      title: 'Ngày nhận',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'right',
      render: (date) => (
        <Space>
          <CalendarOutlined style={{ color: '#8c8c8c' }} />
          <Text type="secondary">{new Date(date).toLocaleString('vi-VN')}</Text>
        </Space>
      )
    }
  ];

  return (
    <Card
      title={<Space><HistoryOutlined /> Lịch sử nhận điểm</Space>}
      styles={{ body: { padding: 0 } }}
      style={{ marginTop: 24, borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
    >
      <Table
        columns={columns}
        dataSource={history}
        loading={loading}
        rowKey={(record) => record._id || record.orderCode || Math.random()}
        pagination={history.length > 5 ? { pageSize: 5 } : false}
        locale={{
          emptyText: <Empty description="Bạn chưa có lịch sử nhận điểm" />
        }}
      />
    </Card>
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
    <div style={{ maxWidth: 960, width: "100%", margin: "40px auto 100px", padding: "0 20px" }}>
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ margin: 0 }}>Thông tin cá nhân</Title>
        <Text type="secondary">Quản lý thông tin tài khoản và theo dõi điểm thưởng của bạn</Text>
      </div>

      <div style={{
        background: "white",
        borderRadius: 16,
        padding: 40,
        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
        border: "1px solid #f1f5f9",
        margin: "0 auto"
      }}>
        {/* Loyalty Points Section */}
        <div style={{
          marginBottom: 32,
          background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
          padding: "24px 32px",
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          gap: 24,
          justifyContent: "space-between",
          color: "white",
          boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.3)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{
              width: 64,
              height: 64,
              background: "rgba(255, 255, 255, 0.2)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32
            }}>
              <CrownOutlined />
            </div>
            <div>
              <div style={{ opacity: 0.9, fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                ĐIỂM TÍCH LŨY HIỆN CÓ
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1 }}>
                {user.loyaltyPoints || 0} <span style={{ fontSize: 16, fontWeight: 400 }}>điểm</span>
              </div>
            </div>
          </div>
          <button
            style={{
              padding: "12px 24px",
              background: "white",
              color: "#6366f1",
              border: "none",
              borderRadius: 12,
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 15,
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "transform 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
            onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
            onClick={() => setShowHistory(v => !v)}
          >
            <HistoryOutlined />
            {showHistory ? "Đóng lịch sử" : "Xem lịch sử điểm"}
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
