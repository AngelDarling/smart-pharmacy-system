import { Link, Outlet, Navigate } from "react-router-dom";
import { useState } from "react";
import useAuth from "../../hooks/useAuth.js";

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  if (loading) return <div style={{ padding: 16 }}>Đang kiểm tra quyền...</div>;
  if (!user || user.role !== "admin") return <Navigate to="/admin/login" />;
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7fb" }}>
      <aside style={{ width: collapsed ? 64 : 260, transition: "width .2s", background: "#ffffff", color: "#065f46", padding: 16, display: "flex", flexDirection: "column", borderRight: "1px solid #e5e7eb" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", marginBottom: 16 }}>
          {!collapsed && <div style={{ fontWeight: 700, fontSize: 18, color: "#047857" }}>Phần quản trị</div>}
          <button title="Thu gọn" onClick={() => setCollapsed((v) => !v)} style={{ width: 32, height: 32 }}>
            ☰
          </button>
        </div>
        <div style={{ fontSize: 12, color: "#6b7280", margin: "8px 0" }}>TỔNG QUAN</div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Link to="/admin/dashboard" style={{ color: "#0f766e", padding: 8, borderRadius: 8, textAlign: collapsed ? "center" : "left" }}>{collapsed ? "🏠" : "Dashboard"}</Link>
        </nav>
        <div style={{ fontSize: 12, color: "#6b7280", margin: "16px 0 8px" }}>SẢN PHẨM</div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Link to="/admin/categories" style={{ color: "#0f766e", padding: 8, borderRadius: 8, textAlign: collapsed ? "center" : "left" }}>{collapsed ? "📂" : "Danh mục"}</Link>
          <Link to="/admin/products" style={{ color: "#0f766e", padding: 8, borderRadius: 8, textAlign: collapsed ? "center" : "left" }}>{collapsed ? "📦" : "Sản phẩm"}</Link>
        </nav>
        <div style={{ fontSize: 12, color: "#6b7280", margin: "16px 0 8px" }}>QUẢN LÝ TỒN KHO</div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Link to="/admin/inventory" style={{ color: "#0f766e", padding: 8, borderRadius: 8, textAlign: collapsed ? "center" : "left" }}>{collapsed ? "📈" : "Nhập/Xuất kho"}</Link>
          <Link to="/admin/suppliers" style={{ color: "#0f766e", padding: 8, borderRadius: 8, textAlign: collapsed ? "center" : "left" }}>{collapsed ? "🏭" : "Nhà cung cấp"}</Link>
          <Link to="/admin/goods-receipts" style={{ color: "#0f766e", padding: 8, borderRadius: 8, textAlign: collapsed ? "center" : "left" }}>{collapsed ? "🧾" : "Phiếu nhập"}</Link>
        </nav>
        <div style={{ marginTop: "auto" }}>
          <div style={{ fontSize: 12, color: "#6b7280", margin: "16px 0 8px" }}>TÀI KHOẢN</div>
          {!collapsed && <div style={{ marginBottom: 8, color: "#065f46" }}>Xin chào, {user?.name}</div>}
          <button className="btn-primary" onClick={logout}>{collapsed ? "⎋" : "Đăng xuất"}</button>
        </div>
      </aside>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <header className="admin-header" style={{ padding: "12px 20px" }}>
          <div style={{ fontWeight: 600, color: "#065f46" }}>Bảng điều khiển</div>
        </header>
        <main style={{ padding: 20 }}>
          <div className="card" style={{ padding: 16 }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}


