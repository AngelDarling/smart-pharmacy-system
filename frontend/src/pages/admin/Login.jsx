import { useState } from "react";
import api from "../../api/client.js";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data?.user?.role !== "admin") {
        setError("Tài khoản không có quyền admin");
        return;
      }
      localStorage.setItem("token", res.data.token);
      window.location.href = "/admin/dashboard";
    } catch (err) {
      setError("Đăng nhập thất bại");
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: "40px auto" }}>
      <h2>Đăng nhập Quản trị</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={onSubmit}>
        <div>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Mật khẩu</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Đăng nhập</button>
      </form>
    </div>
  );
}


