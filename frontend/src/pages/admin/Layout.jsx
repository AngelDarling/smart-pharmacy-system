import { NavLink, Outlet, Navigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { confirm } from "../../api/alert.js";

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  if (loading) return <div style={{ padding: 16 }}>Đang kiểm tra quyền...</div>;
  if (!user || user.role !== "admin") return <Navigate to="/admin/login" />;
  const menuGroups = [
    {
      title: "TỔNG QUAN",
      items: [
        { to: "/admin/dashboard", label: "Dashboard", icon: "🏠" }
      ]
    },
    {
      title: "SẢN PHẨM",
      items: [
        { to: "/admin/products", label: "Danh sách sản phẩm", icon: "📦" },
        { to: "/admin/categories", label: "Danh mục sản phẩm", icon: "📂" }
      ]
    },
    {
      title: "QUẢN LÝ TỒN KHO",
      items: [
        { to: "/admin/inventory", label: "Nhập/Xuất kho", icon: "📈" },
        { to: "/admin/suppliers", label: "Nhà cung cấp", icon: "🏭" },
        { to: "/admin/goods-receipts", label: "Phiếu nhập", icon: "🧾" }
      ]
    }
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7fb" }}>
      <aside className={collapsed ? "sidebar collapsed" : "sidebar"} style={{ width: collapsed ? 64 : 260, transition: "width .2s", background: "#ffffff", color: "#065f46", padding: 16, display: "flex", flexDirection: "column", borderRight: "1px solid #e5e7eb" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", marginBottom: 16 }}>
          {!collapsed && <div style={{ fontWeight: 700, fontSize: 18, color: "#047857" }}>Phần quản trị</div>}
          <button title={collapsed ? "Mở rộng" : "Thu gọn"} onClick={() => setCollapsed((v) => !v)} className="icon-button">
            ☰
          </button>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {menuGroups.map((group) => (
            <div key={group.title} className="nav-group">
              {!collapsed && <div className="group-title">{group.title}</div>}
              <div className="group-items">
                {/* Parent row behaves like a menu header when collapsed: show flyout with items */}
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={item.label}
                    className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                    style={{ justifyContent: collapsed ? "center" : "flex-start" }}
                  >
                    {collapsed ? item.icon : item.label}
                  </NavLink>
                ))}
                {collapsed && (
                  <div className="flyout">
                    <div className="flyout-title">{group.title}</div>
                    {group.items.map((item) => (
                      <NavLink key={item.to} to={item.to} className={({ isActive }) => `flyout-link${isActive ? " active" : ""}`}>{item.label}</NavLink>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </nav>
        <div style={{ marginTop: "auto" }}>
          {!collapsed && <div style={{ fontSize: 12, color: "#6b7280", margin: "16px 0 8px" }}>TÀI KHOẢN</div>}
          {!collapsed && <div style={{ marginBottom: 8, color: "#065f46" }}>Xin chào, {user?.name}</div>}
          <button className="btn-primary" title="Đăng xuất" onClick={async () => { const res = await confirm({ title: "Đăng xuất?", text: "Bạn sẽ thoát khỏi phiên làm việc", confirmText: "Đăng xuất", cancelText: "Hủy" }); if (res.isConfirmed) logout(); }} style={{ width: collapsed ? 40 : undefined, height: collapsed ? 40 : undefined, display: "flex", alignItems: "center", justifyContent: "center", padding: collapsed ? 0 : undefined }}>
            {collapsed ? "⎋" : "Đăng xuất"}
          </button>
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


