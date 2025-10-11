import { useState } from "react";
import api from "../../api/client.js";
import { showError, showSuccess } from "../../api/alert.js";
import useAuth from "../../hooks/useAuth.js";

export default function AdminLogin() {
  const { user } = useAuth();
  // Hiển thị thông báo sau khi logout (được set từ hook)
  if (!user && typeof window !== "undefined") {
    const flag = localStorage.getItem("flash");
    if (flag === "logout_success") {
      showSuccess("Bạn đã đăng xuất thành công", "Tạm biệt!");
      localStorage.removeItem("flash");
    }
  }
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      
      // Allow admin, manager, pharmacist, and staff to access admin panel
      const allowedRoles = ['admin', 'manager', 'pharmacist', 'staff'];
      if (!allowedRoles.includes(res.data?.user?.role)) {
        setError("Tài khoản không có quyền truy cập admin panel");
        showError("Tài khoản không có quyền truy cập admin panel");
        return;
      }
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("flash", "login_success");
      // dùng replace để không ở lại trang login
      window.location.replace("/admin/dashboard");
    } catch (err) {
      setError("Đăng nhập thất bại");
      showError("Email hoặc mật khẩu không đúng");
    } finally {
      setLoading(false);
    }
  }

  // Allow admin, manager, pharmacist, and staff to access admin panel
  const allowedRoles = ['admin', 'manager', 'pharmacist', 'staff'];
  
  if (user && allowedRoles.includes(user.role)) {
    // Chặn truy cập trang login: dùng replace để không đẩy trang login vào history
    window.location.replace("/admin/dashboard");
    return null;
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">💊</div>
          <div className="auth-title">Đăng nhập Quản trị</div>
          <div className="auth-subtitle">Smart Pharmacy System</div>
        </div>

        {error && (
          <div className="auth-alert" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="auth-form">
          <div className="form-row">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="password">Mật khẩu</label>
            <div className="password-field">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="toggle-visibility"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? "Ẩn" : "Hiện"}
              </button>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn-primary btn-block">
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


