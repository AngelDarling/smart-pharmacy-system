import { useEffect, useState } from "react";
import axios from "axios";
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import Home from "./pages/Home.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import AdminLayout from "./pages/admin/Layout.jsx";
import AdminCategories from "./pages/admin/Categories.jsx";
import AdminProducts from "./pages/admin/Products.jsx";
import AdminInventory from "./pages/admin/Inventory.jsx";
import AdminLogin from "./pages/admin/Login.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminSuppliers from "./pages/admin/Suppliers.jsx";
import AdminGoodsReceipts from "./pages/admin/GoodsReceipts.jsx";

function Landing() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
  axios.get("/api/hello")
    .then((res) => setMessage(res.data.message))
    .catch(() => setMessage("⚠️ Lỗi kết nối API"));
}, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>💊 Smart Pharmacy System (Frontend)</h1>
      <p>API Response từ Backend:</p>
      <h2 style={{ color: "green" }}>{message}</h2>
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      window.location.href = "/";
    } catch (err) {
      setError("Đăng nhập thất bại");
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: "40px auto" }}>
      <h2>Đăng nhập</h2>
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
      <p>
        Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
      </p>
    </div>
  );
}

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("/api/auth/register", { name, email, password });
      localStorage.setItem("token", res.data.token);
      window.location.href = "/";
    } catch (err) {
      setError("Đăng ký thất bại");
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: "40px auto" }}>
      <h2>Đăng ký</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={onSubmit}>
        <div>
          <label>Họ tên</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Mật khẩu</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Tạo tài khoản</button>
      </form>
      <p>
        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
      </p>
    </div>
  );
}

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  return (
    <>
      {!isAdminRoute && (
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <nav style={{ display: "flex", gap: 12, padding: 12 }}>
            <Link to="/">Trang chủ</Link>
            <Link to="/login">Đăng nhập</Link>
            <Link to="/register">Đăng ký</Link>
          </nav>
        </div>
      )}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/catalog" element={<Home />} />
        <Route path="/p/:slug" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="suppliers" element={<AdminSuppliers />} />
          <Route path="goods-receipts" element={<AdminGoodsReceipts />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
