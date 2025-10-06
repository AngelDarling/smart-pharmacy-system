import { useEffect, useMemo, useState } from "react";
import useAuth from "../../hooks/useAuth.js";
import { showSuccess } from "../../api/alert.js";
import api from "../../api/client.js";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  useEffect(() => {
    const flag = localStorage.getItem("flash");
    if (flag === "login_success") {
      showSuccess("Đăng nhập thành công", "Xin chào!");
      localStorage.removeItem("flash");
    }
  }, []);
  useEffect(() => {
    let mounted = true;
    api.get("/admin/stats").then((res) => {
      if (mounted) setStats(res.data);
    }).finally(() => setLoading(false));
    return () => { mounted = false; };
  }, []);

  const monthRevenue = stats?.month?.revenue || 0;
  const todayRevenue = stats?.today?.revenue || 0;
  const todayInvoices = stats?.today?.invoices || 0;
  const lowStock = stats?.inventory?.lowStockCount || 0;

  function formatMoney(v) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v || 0);
  }
  if (loading) {
    return <div>Đang tải thống kê...</div>;
  }

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Xin chào, {user?.name}</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12, margin: "12px 0" }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ color: "#6b7280", fontSize: 12 }}>DOANH SỐ</div>
          <div style={{ fontWeight: 700, fontSize: 20, color: "#047857" }}>{formatMoney(monthRevenue)}</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Tháng này</div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ color: "#6b7280", fontSize: 12 }}>HÓA ĐƠN HÔM NAY</div>
          <div style={{ fontWeight: 700, fontSize: 20, color: "#047857" }}>{todayInvoices}</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Doanh số: {formatMoney(todayRevenue)}</div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ color: "#6b7280", fontSize: 12 }}>CẢNH BÁO HÀNG HÓA</div>
          <div style={{ fontWeight: 700, fontSize: 20, color: lowStock > 0 ? "#b91c1c" : "#047857" }}>{lowStock} mặt hàng sắp hết</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Kiểm tra tồn kho</div>
        </div>
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontWeight: 600, color: "#065f46" }}>Doanh số bán hàng tháng này</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Tổng: {formatMoney(monthRevenue)}</div>
        </div>
        <DashboardChart data={stats?.chart?.daily || []} />
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 12 }}>
        <div style={{ fontWeight: 600, color: "#065f46", marginBottom: 8 }}>Lô hàng sắp hết hạn (30 ngày)</div>
        <table width="100%" border="1" cellPadding="6">
          <thead><tr><th>Sản phẩm</th><th>Mã lô</th><th>HSD</th><th>Tồn</th></tr></thead>
          <tbody>
            {(stats?.nearExpiry || []).map((b) => (
              <tr key={b._id}>
                <td>{b.productId}</td>
                <td>{b.batchNo || "-"}</td>
                <td>{b.expiryDate ? new Date(b.expiryDate).toLocaleDateString("vi-VN") : "-"}</td>
                <td>{b.quantity}</td>
              </tr>
            ))}
            {(!stats?.nearExpiry || stats.nearExpiry.length === 0) && <tr><td colSpan="4" style={{ color: "#6b7280" }}>Không có lô sắp hết hạn</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 600, color: "#065f46", marginBottom: 8 }}>Hoạt động gần đây</div>
        <ul style={{ padding: 0, margin: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
          {(stats?.activities || []).map((a) => (
            <li key={a.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>📝</span>
              <div>
                <div style={{ fontWeight: 500 }}>{a.action}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{new Date(a.createdAt).toLocaleString("vi-VN")}</div>
              </div>
            </li>
          ))}
          {(!stats?.activities || stats.activities.length === 0) && <li style={{ color: "#6b7280" }}>Chưa có hoạt động</li>}
        </ul>
      </div>
    </div>
  );
}

function DashboardChart({ data }) {
  // simple bar chart using pure divs
  const max = Math.max(1, ...data.map((d) => d.total));
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 180 }}>
        {data.map((d) => (
          <div key={d.day} title={`Ngày ${d.day}: ${d.total.toLocaleString("vi-VN")}`} style={{ background: "#86efac", width: 10, height: Math.round((d.total / max) * 170) }} />
        ))}
      </div>
      <div style={{ display: "flex", gap: 4, fontSize: 10, color: "#6b7280", marginTop: 6 }}>
        {data.map((d) => (
          <div key={d.day} style={{ width: 10, textAlign: "center" }}>{d.day}</div>
        ))}
      </div>
    </div>
  );
}


