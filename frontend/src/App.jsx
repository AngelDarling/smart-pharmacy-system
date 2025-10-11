import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import useCart from "./hooks/useCart.js";
import useSearch from "./hooks/useSearch.js";
import Home from "./pages/Home.jsx";
import Landing from "./pages/Landing.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import CategoryManagement from "./pages/admin/categories/CategoryManagement.jsx";
import ProductManagement from "./pages/admin/products/ProductManagement.jsx";
import UserManagement from "./pages/admin/users/UserManagement.jsx";
import StaffManagement from "./pages/admin/staff/StaffManagement.jsx";
import { 
  InventoryManagement, 
  GoodsReceiptManagement, 
  InventoryAlertsManagement 
} from "./pages/admin/inventory";
import AdminLogin from "./pages/admin/Login.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminSuppliers from "./pages/admin/Suppliers.jsx";
import Profile from "./pages/admin/Profile.jsx";
import Settings from "./pages/admin/Settings.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Cart from "./pages/Cart.jsx";
import SearchResults from "./pages/SearchResults.jsx";
import Products from "./pages/Products.jsx";

// Landing move to its own file with full storefront sections

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
  const { items: cartItems } = useCart();
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const searchDropdownRef = useRef(null);
  
  // Search functionality
  const {
    searchTerm,
    setSearchTerm,
    suggestions,
    isLoading,
    searchHistory,
    handleSearchChange,
    saveToHistory,
    clearHistory,
    removeFromHistory
  } = useSearch();

  // Close search dropdown when clicking outside and prevent body scroll
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target)) {
        setShowSearchModal(false);
      }
    }

    if (showSearchModal) {
      // Prevent body scroll when search modal is open
      document.body.style.overflow = 'hidden';
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      // Restore body scroll when search modal is closed
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      // Cleanup: restore scroll when component unmounts
      document.body.style.overflow = 'unset';
    };
  }, [showSearchModal]);

  return (
    <>
      {!isAdminRoute && (
        <div style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
          {/* Main header */}
          <div style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", padding: "16px 0" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 20, gap: 20 }}>
                <Link to="/" style={{ fontWeight: 700, color: "white", textDecoration: "none", fontSize: 20, minWidth: 200, flexShrink: 0, lineHeight: 1.2 }}>
                  <div>NHÀ THUỐC</div>
                  <div>SMART PHARMACY</div>
                </Link>
                
                {/* Search bar - centered */}
                <div ref={searchDropdownRef} style={{ flex: 1, display: "flex", justifyContent: "center", position: "relative", maxWidth: 1000 }}>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "stretch", 
                    gap: 8, 
                    borderRadius: 30, 
                    height: 52, 
                    padding: 6, 
                    paddingLeft: 16, 
                    background: "white", 
                    position: "relative", 
                    zIndex: 10,
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    width: "100%"
                  }}>
                        <form style={{ display: "flex", width: "100%", alignItems: "center", position: "relative" }}>
                          <input 
                            type="text" 
                            name="search"
                            autoComplete="off"
                            placeholder="Tìm tên thuốc, bệnh lý, TPCN..." 
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            onFocus={() => setShowSearchModal(true)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (searchTerm.trim()) {
                                  saveToHistory(searchTerm);
                                  window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
                                }
                              }
                            }}
                            style={{ 
                              width: "100%", 
                              background: "transparent", 
                              border: "none",
                              outline: "none",
                              fontSize: 16,
                              color: "#374151",
                              paddingRight: 100
                            }} 
                          />
                        </form>
                    
                    <div style={{ 
                      display: "inline-flex", 
                      gap: 8, 
                      alignItems: "center", 
                      paddingRight: 8 
                    }}>
                      <button 
                        type="button"
                        style={{ 
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "transparent",
                          border: "none",
                          borderRadius: 25,
                          padding: 8,
                          height: 40,
                          width: 40,
                          cursor: "pointer",
                          transition: "background 0.2s",
                          color: "#6b7280"
                        }}
                        title="Tìm với giọng nói"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" width="20" height="20">
                          <path fill="currentColor" d="M15.25 10.27a.569.569 0 0 0-.58-.579c-.328 0-.578.251-.578.58A4.094 4.094 0 0 1 10 14.361a4.094 4.094 0 0 1-4.092-4.092.569.569 0 0 0-.579-.579.569.569 0 0 0-.579.58c0 2.682 2.007 4.94 4.67 5.23v1.544H7.318a.569.569 0 0 0-.579.579c0 .328.25.579.579.579h5.366a.569.569 0 0 0 .579-.58.569.569 0 0 0-.58-.578H10.58V15.5c2.663-.29 4.67-2.548 4.67-5.23Z"></path>
                          <path fill="currentColor" d="M10 1.797a3.229 3.229 0 0 0-3.224 3.224v5.23A3.246 3.246 0 0 0 10 13.494a3.229 3.229 0 0 0 3.223-3.223V5.02A3.229 3.229 0 0 0 10 1.797Z"></path>
                        </svg>
                      </button>
                      
                      <button 
                        style={{ 
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "transparent",
                          border: "none",
                          borderRadius: 25,
                          padding: 8,
                          height: 40,
                          width: 40,
                          cursor: "pointer",
                          transition: "background 0.2s",
                          color: "#6b7280"
                        }}
                        title="Tìm với hình ảnh"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" width="20" height="20">
                          <path fill="currentColor" d="M10 5.833A4.179 4.179 0 0 0 5.834 10 4.179 4.179 0 0 0 10 14.167 4.179 4.179 0 0 0 14.167 10 4.179 4.179 0 0 0 10 5.833ZM10 7.5c1.391 0 2.5 1.11 2.5 2.5s-1.109 2.5-2.5 2.5c-1.39 0-2.5-1.108-2.5-2.5S8.61 7.5 10 7.5ZM5 1.667A3.344 3.344 0 0 0 1.667 5v1.667a.833.833 0 0 0 1.667 0V5c0-.937.729-1.667 1.666-1.667h1.667a.833.833 0 1 0 0-1.666H5ZM2.5 12.5a.833.833 0 0 0-.833.833V15c0 1.833 1.5 3.333 3.333 3.333h1.667a.833.833 0 1 0 0-1.666H5c-.937 0-1.666-.73-1.666-1.667v-1.667A.833.833 0 0 0 2.5 12.5Zm15 0a.833.833 0 0 0-.833.833V15c0 .938-.73 1.667-1.667 1.667h-1.666a.833.833 0 1 0 0 1.666H15c1.833 0 3.334-1.5 3.334-3.333v-1.667a.833.833 0 0 0-.834-.833ZM13.334 1.667a.833.833 0 1 0 0 1.666H15c.938 0 1.667.73 1.667 1.667v1.667a.833.833 0 1 0 1.667 0V5c0-1.832-1.501-3.333-3.334-3.333h-1.666Z"></path>
                        </svg>
                      </button>
                    </div>
                  </div>

                   {/* Search Dropdown */}
                   {showSearchModal && (
                     <>
                       {/* Dark Overlay */}
                       <div 
                         onClick={() => setShowSearchModal(false)}
                         style={{
                           position: "fixed",
                           top: "200px", // Start from below navigation categories
                           left: 0,
                           right: 0,
                           bottom: 0,
                           background: "rgba(0, 0, 0, 0.5)",
                           zIndex: 999
                         }} 
                       />
                       
                          {/* Search Dropdown */}
                          <div style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            right: 0,
                            background: "white",
                            borderRadius: 12,
                            maxHeight: "85vh",
                            overflow: "hidden",
                            boxShadow: "0 20px 25px rgba(0,0,0,0.1)",
                            zIndex: 1000,
                            marginTop: 8,
                            minHeight: "400px"
                          }}>
                      {/* Search Content */}
                      <div style={{ padding: 24, maxHeight: "70vh", overflowY: "auto" }}>
                        {/* Search History */}
                        {searchHistory.length > 0 && (
                          <div style={{ marginBottom: 24 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: "#374151" }}>
                                Lịch sử tìm kiếm
                              </h3>
                              <button 
                                onClick={clearHistory}
                                style={{ 
                                  background: "none", 
                                  border: "none", 
                                  color: "#6b7280", 
                                  cursor: "pointer",
                                  fontSize: 16
                                }}
                              >
                                Xóa tất cả
                              </button>
                            </div>
                            {searchHistory.slice(0, 3).map((term, index) => (
                              <div key={index} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#f8f9fa", borderRadius: 8, marginBottom: 8 }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: "#6b7280" }}>
                                  <path fill="currentColor" d="M4.63316 9C4.64345 9.00021 4.65373 9.00021 4.66399 9H8.24962C8.66383 9 8.99962 8.66421 8.99962 8.25C8.99962 7.83579 8.66383 7.5 8.24962 7.5H5.99893C7.36789 5.67743 9.54671 4.5 11.9996 4.5C16.1418 4.5 19.4996 7.85786 19.4996 12C19.4996 16.1421 16.1418 19.5 11.9996 19.5C8.08773 19.5 4.87463 16.5045 4.53022 12.6827C4.49305 12.2701 4.12848 11.9659 3.71594 12.003C3.3034 12.0402 2.9991 12.4048 3.03628 12.8173C3.44972 17.4052 7.30445 21 11.9996 21C16.9702 21 20.9996 16.9706 20.9996 12C20.9996 7.02944 16.9702 3 11.9996 3C9.31082 3 6.8982 4.17919 5.24962 6.04707V4.5C5.24962 4.08579 4.91383 3.75 4.49962 3.75C4.0854 3.75 3.74962 4.08579 3.74962 4.5V8.25C3.74962 8.66421 4.0854 9 4.49962 9H4.63316ZM11.2496 7.5C11.6638 7.5 11.9996 7.83579 11.9996 8.25V12H14.2496C14.6638 12 14.9996 12.3358 14.9996 12.75C14.9996 13.1642 14.6638 13.5 14.2496 13.5H11.2496C10.8354 13.5 10.4996 13.1642 10.4996 12.75V8.25C10.4996 7.83579 10.8354 7.5 11.2496 7.5Z"/>
                                </svg>
                                <span 
                                  style={{ flex: 1, fontSize: 16, color: "#374151", cursor: "pointer" }}
                                  onClick={() => {
                                    setSearchTerm(term);
                                    saveToHistory(term);
                                    setShowSearchModal(false);
                                    window.location.href = `/search?q=${encodeURIComponent(term)}`;
                                  }}
                                >
                                  {term}
                                </span>
                                <button 
                                  onClick={() => removeFromHistory(term)}
                                  style={{ 
                                    background: "none", 
                                    border: "none", 
                                    color: "#6b7280", 
                                    cursor: "pointer",
                                    fontSize: 14
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Loading State */}
                        {isLoading && (
                          <div style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>
                            <div style={{ fontSize: 16 }}>Đang tìm kiếm...</div>
                          </div>
                        )}

                        {/* Search Results */}
                        {!isLoading && searchTerm && (
                          <>
                            {/* Keywords */}
                            {suggestions.keywords.length > 0 && (
                              <div style={{ marginBottom: 24 }}>
                                <h3 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 600, color: "#374151" }}>
                                  Từ khóa liên quan
                                </h3>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                  {suggestions.keywords.map((keyword, index) => (
                                    <button 
                                      key={index}
                                      onClick={() => {
                                        setSearchTerm(keyword);
                                        saveToHistory(keyword);
                                        setShowSearchModal(false);
                                        window.location.href = `/search?q=${encodeURIComponent(keyword)}`;
                                      }}
                                      style={{ 
                                        background: "white",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: 20,
                                        padding: "10px 18px",
                                        fontSize: 16,
                                        color: "#6b7280",
                                        cursor: "pointer",
                                        transition: "all 0.2s"
                                      }}
                                    >
                                      {keyword}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Products */}
                            {suggestions.products.length > 0 && (
                              <div style={{ marginBottom: 24 }}>
                                <h3 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 600, color: "#374151" }}>
                                  Sản phẩm gợi ý
                                </h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                  {suggestions.products.slice(0, 3).map((product) => (
                                    <div 
                                      key={product.id}
                                      onClick={() => {
                                        setShowSearchModal(false);
                                        window.location.href = `/p/${product.id}`;
                                      }}
                                      style={{ 
                                        display: "flex", 
                                        gap: 14, 
                                        padding: 14, 
                                        borderRadius: 8, 
                                        background: "#f8f9fa", 
                                        cursor: "pointer",
                                        transition: "background 0.2s"
                                      }}
                                    >
                                      <img 
                                        src={product.image} 
                                        alt={product.name} 
                                        style={{ 
                                          width: 60, 
                                          height: 60, 
                                          borderRadius: 8, 
                                          objectFit: "cover" 
                                        }} 
                                      />
                                      <div style={{ flex: 1 }}>
                                        <h4 style={{ 
                                          margin: "0 0 4px", 
                                          fontSize: 14, 
                                          fontWeight: 600, 
                                          color: "#374151" 
                                        }}>
                                          {product.name}
                                        </h4>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#dc2626" }}>
                                            {product.price.toLocaleString()}₫
                                          </p>
                                          {product.discount > 0 && (
                                            <span style={{
                                              background: "#dc2626",
                                              color: "white",
                                              padding: "2px 6px",
                                              borderRadius: 4,
                                              fontSize: 12,
                                              fontWeight: 600
                                            }}>
                                              -{product.discount}%
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Categories */}
                            {suggestions.categories.length > 0 && (
                              <div style={{ marginBottom: 24 }}>
                                <h3 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 600, color: "#374151" }}>
                                  Danh mục liên quan
                                </h3>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                  {suggestions.categories.map((category) => (
                                    <button 
                                      key={category.id}
                                      onClick={() => {
                                        setShowSearchModal(false);
                                        window.location.href = `/catalog?category=${category.slug}`;
                                      }}
                                      style={{ 
                                        background: "white",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: 20,
                                        padding: "10px 18px",
                                        fontSize: 16,
                                        color: "#6b7280",
                                        cursor: "pointer",
                                        transition: "all 0.2s"
                                      }}
                                    >
                                      {category.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {/* Default Content when no search term */}
                        {!isLoading && !searchTerm && (
                          <>
                            {/* Top Searches */}
                            <div style={{ marginBottom: 24 }}>
                              <h3 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 600, color: "#374151" }}>
                                Tra cứu hàng đầu
                              </h3>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                {["Omega 3", "Canxi", "Thuốc nhỏ mắt", "Sữa rửa mặt", "Dung dịch vệ sinh", "Men vi sinh", "Kẽm", "Kem chống nắng"].map((term) => (
                                  <button 
                                    key={term}
                                    onClick={() => {
                                      setSearchTerm(term);
                                      saveToHistory(term);
                                      setShowSearchModal(false);
                                      window.location.href = `/search?q=${encodeURIComponent(term)}`;
                                    }}
                                    style={{ 
                                      background: "white",
                                      border: "1px solid #e5e7eb",
                                      borderRadius: 20,
                                      padding: "10px 18px",
                                      fontSize: 16,
                                      color: "#6b7280",
                                      cursor: "pointer",
                                      transition: "all 0.2s"
                                    }}
                                  >
                                    {term}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Hot Deals */}
                            <div>
                              <div style={{
                                background: "linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)",
                                color: "white",
                                padding: "14px 18px",
                                borderRadius: 8,
                                marginBottom: 16,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between"
                              }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <span style={{ fontSize: 22 }}>🔥</span>
                                  <span style={{ fontSize: 18, fontWeight: 600 }}>Ưu đãi hot hôm nay</span>
                                </div>
                                <button
                                  onClick={() => {
                                    setShowSearchModal(false);
                                    window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
                                  }}
                                  style={{
                                    background: "rgba(255,255,255,0.2)",
                                    border: "none",
                                    color: "white",
                                    padding: "6px 12px",
                                    borderRadius: 6,
                                    fontSize: 14,
                                    cursor: "pointer",
                                    transition: "background 0.2s"
                                  }}
                                >
                                  Xem tất cả
                                </button>
                              </div>

                              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {suggestions.hotDeals.length > 0 ? (
                                  suggestions.hotDeals.slice(0, 3).map((product) => (
                                    <div 
                                      key={product.id}
                                      onClick={() => {
                                        setShowSearchModal(false);
                                        window.location.href = `/p/${product.id}`;
                                      }}
                                      style={{ 
                                        display: "flex", 
                                        gap: 14, 
                                        padding: 14, 
                                        borderRadius: 8, 
                                        background: "#f8f9fa", 
                                        cursor: "pointer",
                                        transition: "background 0.2s"
                                      }}
                                    >
                                      <div style={{ position: "relative" }}>
                                        <img 
                                          src={product.image} 
                                          alt={product.name} 
                                          style={{ 
                                            width: 90, 
                                            height: 90, 
                                            borderRadius: 8, 
                                            objectFit: "cover" 
                                          }} 
                                        />
                                        {product.discount > 0 && (
                                          <div style={{
                                            position: "absolute",
                                            top: 4,
                                            left: 4,
                                            background: "#dc2626",
                                            color: "white",
                                            padding: "3px 8px",
                                            borderRadius: 4,
                                            fontSize: 12,
                                            fontWeight: 600
                                          }}>
                                            -{product.discount}%
                                          </div>
                                        )}
                                      </div>
                                      <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 600, color: "#374151" }}>
                                          {product.name}
                                        </h4>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#dc2626" }}>
                                            {product.price.toLocaleString()}₫ / Hộp
                                          </p>
                                          {product.discount > 0 && (
                                            <p style={{ margin: 0, fontSize: 16, color: "#9ca3af", textDecoration: "line-through" }}>
                                              {Math.round(product.price / (1 - product.discount / 100)).toLocaleString()}₫
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  // Fallback static content
                                  <>
                                    <div style={{ display: "flex", gap: 14, padding: 14, borderRadius: 8, background: "#f8f9fa", position: "relative" }}>
                                      <div style={{ position: "relative" }}>
                                        <img src="https://picsum.photos/80/80?random=1" alt="Anica Ocavill" style={{ width: 90, height: 90, borderRadius: 8, objectFit: "cover" }} />
                                        <div style={{
                                          position: "absolute",
                                          top: 4,
                                          left: 4,
                                          background: "#dc2626",
                                          color: "white",
                                          padding: "3px 8px",
                                          borderRadius: 4,
                                          fontSize: 12,
                                          fontWeight: 600
                                        }}>
                                          -10%
                                        </div>
                                      </div>
                                      <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 600, color: "#374151" }}>
                                          Viên uống Anica Ocavill bổ sung Canxi và Vitamin D3 (60 viên)
                                        </h4>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#dc2626" }}>
                                            504.000₫ / Hộp
                                          </p>
                                          <p style={{ margin: 0, fontSize: 16, color: "#9ca3af", textDecoration: "line-through" }}>
                                            560.000₫
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    </>
                  )}
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 180, flexShrink: 0 }}>
                  <Link to="/login" style={{ 
                    color: "white", 
                    textDecoration: "none", 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 6,
                    padding: "8px 16px",
                    borderRadius: 20,
                    background: "rgba(255,255,255,0.1)",
                    transition: "background 0.2s",
                    fontSize: 14
                  }}>
                    <span style={{ fontSize: 16 }}>👤</span>
                    <span>Đăng nhập</span>
                  </Link>
                  <div style={{ position: "relative" }}>
                    <Link 
                      to="/cart"
                      onMouseEnter={() => setShowCartDropdown(true)}
                      onMouseLeave={() => setShowCartDropdown(false)}
                      style={{ 
                        color: "white", 
                        textDecoration: "none", 
                        display: "flex", 
                        alignItems: "center", 
                        gap: 6,
                        padding: "8px 16px",
                        borderRadius: 20,
                        background: "rgba(255,255,255,0.1)",
                        transition: "background 0.2s",
                        fontSize: 14
                      }}
                    >
                      <span style={{ fontSize: 16 }}>🛒</span>
                      <span>Giỏ hàng</span>
                      {cartItems.length > 0 && (
                        <span style={{ 
                          background: "#ef4444", 
                          color: "white", 
                          borderRadius: "50%", 
                          width: 20, 
                          height: 20, 
                          fontSize: 12, 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center" 
                        }}>
                          {cartItems.length}
                        </span>
                      )}
                    </Link>
                    
                    {/* Cart Dropdown */}
                    {showCartDropdown && (
                      <div 
                        onMouseEnter={() => setShowCartDropdown(true)}
                        onMouseLeave={() => setShowCartDropdown(false)}
                        style={{
                          position: "absolute",
                          top: "100%",
                          right: 0,
                          background: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: 8,
                          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                          width: 400,
                          maxHeight: 500,
                          overflowY: "auto",
                          zIndex: 1000,
                          marginTop: 8
                        }}
                      >
                        <div style={{ padding: 16, borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 18 }}>🛒</span>
                          <span style={{ fontWeight: 600 }}>Giỏ hàng</span>
                        </div>
                        
                        {cartItems.length === 0 ? (
                          <div style={{ padding: 20, textAlign: "center", color: "#6b7280" }}>
                            Giỏ hàng trống
                          </div>
                        ) : (
                          <>
                            <div style={{ maxHeight: 300, overflowY: "auto" }}>
                              {cartItems.map((item) => (
                                <div key={item.id} style={{ 
                                  display: "flex", 
                                  alignItems: "center", 
                                  padding: 12, 
                                  borderBottom: "1px solid #f3f4f6" 
                                }}>
                                  <img 
                                    src={item.image || "/vite.svg"} 
                                    alt={item.name} 
                                    style={{ 
                                      width: 50, 
                                      height: 50, 
                                      objectFit: "cover", 
                                      borderRadius: 6, 
                                      marginRight: 12 
                                    }} 
                                  />
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ 
                                      fontSize: 13, 
                                      fontWeight: 500, 
                                      marginBottom: 4,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap"
                                    }}>
                                      {item.name}
                                    </div>
                                    <div style={{ 
                                      color: "#2e7d32", 
                                      fontWeight: 600, 
                                      fontSize: 14 
                                    }}>
                                      {item.price.toLocaleString()}₫
                                    </div>
                                    <div style={{ 
                                      color: "#6b7280", 
                                      fontSize: 12 
                                    }}>
                                      x{item.qty} Hộp
                                    </div>
                                  </div>
                                  <button 
                                    onClick={() => {
                                      const { remove } = useCart();
                                      remove(item.id);
                                      setShowCartDropdown(false);
                                    }}
                                    style={{ 
                                      background: "none", 
                                      border: "none", 
                                      color: "#ef4444", 
                                      cursor: "pointer", 
                                      padding: 4,
                                      fontSize: 16
                                    }}
                                  >
                                    🗑️
                                  </button>
                                </div>
                              ))}
                            </div>
                            
                            <div style={{ 
                              padding: 16, 
                              borderTop: "1px solid #e5e7eb",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center"
                            }}>
                              <span style={{ fontSize: 14, color: "#6b7280" }}>
                                {cartItems.length} sản phẩm
                              </span>
                              <Link 
                                to="/cart" 
                                onClick={() => setShowCartDropdown(false)}
                                style={{
                                  background: "#065f46",
                                  color: "white",
                                  padding: "10px 20px",
                                  borderRadius: 25,
                                  textDecoration: "none",
                                  fontSize: 14,
                                  fontWeight: 500
                                }}
                              >
                                Xem giỏ hàng
                              </Link>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Popular searches */}
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginTop: 12 }}>
                {["Omega 3", "Canxi", "Thuốc nhỏ mắt", "Sữa rửa mặt", "Dung dịch vệ sinh", "Men vi sinh", "Kẽm", "Kem chống nắng"].map((term) => (
                  <span key={term} style={{ 
                    fontSize: 14, 
                    cursor: "pointer", 
                    padding: "6px 12px", 
                    borderRadius: 20, 
                    background: "rgba(255,255,255,0.2)",
                    color: "white",
                    transition: "background 0.2s"
                  }}>
                    {term}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation categories */}
          <div style={{ background: "white", borderBottom: "1px solid #e5e7eb" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
              <nav style={{ display: "flex", gap: 0, padding: "0", justifyContent: "center" }}>
                {[
                  { name: "Thực phẩm chức năng", hasDropdown: true },
                  { name: "Dược mỹ phẩm", hasDropdown: true },
                  { name: "Thuốc", hasDropdown: true },
                  { name: "Chăm sóc cá nhân", hasDropdown: true },
                  { name: "Thiết bị y tế", hasDropdown: true },
                  { name: "Tiêm chủng", hasDropdown: false },
                  { name: "Bệnh & Góc sức khỏe", hasDropdown: true },
                  { name: "Hệ thống nhà thuốc", hasDropdown: false }
                ].map((category, index) => (
                  <Link key={category.name} to="/products" style={{ 
                    color: "#374151", 
                    textDecoration: "none", 
                    fontWeight: 500, 
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "16px 20px",
                    transition: "all 0.2s",
                    fontSize: 14,
                    position: "relative",
                    borderBottom: "3px solid transparent"
                  }}>
                    <span>{category.name}</span>
                    {category.hasDropdown && (
                      <span style={{ fontSize: 12, marginLeft: 4 }}>▼</span>
                    )}
                  </Link>
                ))}
          </nav>
            </div>
          </div>
        </div>
      )}

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/catalog" element={<Products />} />
        <Route path="/products" element={<Products />} />
        <Route path="/p/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/search" element={<Products />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="categories" element={
            <ProtectedRoute requiredPermission="read_categories">
              <CategoryManagement />
            </ProtectedRoute>
          } />
          <Route path="products" element={
            <ProtectedRoute requiredPermission="read_products">
              <ProductManagement />
            </ProtectedRoute>
          } />
          <Route path="users" element={
            <ProtectedRoute requiredPermission="read_users">
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="staff" element={
            <ProtectedRoute requiredPermission="manage_staff">
              <StaffManagement />
            </ProtectedRoute>
          } />
          <Route path="inventory" element={
            <ProtectedRoute requiredPermission="read_inventory">
              <InventoryManagement />
            </ProtectedRoute>
          } />
          <Route path="goods-receipts" element={
            <ProtectedRoute requiredPermission="read_inventory">
              <GoodsReceiptManagement />
            </ProtectedRoute>
          } />
          <Route path="inventory-alerts" element={
            <ProtectedRoute requiredPermission="read_inventory">
              <InventoryAlertsManagement />
            </ProtectedRoute>
          } />
          <Route path="suppliers" element={
            <ProtectedRoute requiredPermission="read_inventory">
              <AdminSuppliers />
            </ProtectedRoute>
          } />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
