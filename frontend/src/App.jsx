import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import useCart from "./hooks/useCart.js";
import { useAuth } from "./contexts/AuthContext.jsx";
import AuthModal from "./components/AuthModal.jsx";
import VoiceSearchModal from "./components/VoiceSearchModal.jsx";
import ImageSearchModal from "./components/ImageSearchModal.jsx";
import Footer from "./components/Footer.jsx";
import Swal from "sweetalert2";
import useSearch from "./hooks/useSearch.js";
import { getImageUrl, handleImageError } from "./utils/imageUtils";
import Home from "./pages/Home.jsx";
import Landing from "./pages/Landing.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import CategoryManagement from "./pages/admin/categories/CategoryManagement.jsx";
import ProductManagement from "./pages/admin/products/ProductManagement.jsx";
import BrandManagement from "./pages/admin/products/BrandManagement.jsx";
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
import SalesReport from "./pages/admin/SalesReport.jsx";
import OrdersManagement from "./pages/admin/orders/OrdersManagement.jsx";
import ShippingOrders from "./pages/admin/orders/ShippingOrders.jsx";
import Tracking from "./pages/admin/orders/Tracking.jsx";
import Invoices from "./pages/admin/orders/Invoices.jsx";
import Profile from "./pages/admin/Profile.jsx";
import Settings from "./pages/admin/Settings.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import OrderDetail from "./pages/OrderDetail.jsx";
import OrderHistory from "./pages/OrderHistory.jsx";
import OrderSuccess from "./pages/OrderSuccess.jsx";
import OrderTracking from "./pages/OrderTracking.jsx";
import TestCheckout from "./pages/TestCheckout.jsx";
import SearchResults from "./pages/SearchResults.jsx";
import Products from "./pages/Products.jsx";
import AddressLookup from "./pages/AddressLookup.jsx";
import UserProfile from "./pages/Profile.jsx";
import UserOrders from "./pages/Orders.jsx";
import Promotions from "./pages/admin/promotions/Promotions.jsx";
import ReviewManagement from "./pages/admin/reviews";
import HealthCheckPage from "./pages/HealthCheckPage.jsx";
import HealthCheckResultPage from "./pages/HealthCheckResultPage.jsx";
import ImageSearchResults from "./pages/ImageSearchResults.jsx";
import { HealthChecks, HealthCheckDetail, QuestionManagement, ResultManagement } from "./pages/admin/healthChecks";

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
    } catch {
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
    } catch {
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

const formatDiscountAmount = (amount) => {
  if (amount >= 1000) {
    const thousands = amount / 1000;
    // Nếu là số nguyên thì không hiển thị phần thập phân
    if (thousands % 1 === 0) {
      return `${thousands}K`;
    } else {
      // Hiển thị 1 chữ số thập phân
      return `${thousands.toFixed(1)}K`;
    }
  }
  return amount.toString();
};

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const { items: cartItems, remove: removeFromCart } = useCart();
  const { user, logout } = useAuth();
  
  // Production: remove noisy console logs
  
  // Debug log để kiểm tra cartItems (đã tắt)
  // console.log('App.jsx cartItems updated:', cartItems.length, cartItems.map(i => ({ 
  //   id: i.id, 
  //   name: i.name, 
  //   qty: i.qty,
  //   price: i.price,
  //   image: i.image,
  //   fullItem: i
  // })));
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const [cartDropdownTimeout, setCartDropdownTimeout] = useState(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showVoiceSearchModal, setShowVoiceSearchModal] = useState(false);
  const [showImageSearchModal, setShowImageSearchModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [userDropdownTimeout, setUserDropdownTimeout] = useState(null);
  const searchDropdownRef = useRef(null);
  const [rootCategories, setRootCategories] = useState([]);
  // Category mega menu state
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [activeRootCategory, setActiveRootCategory] = useState(null);
  const [activeLevel1Id, setActiveLevel1Id] = useState(null);
  const [categoryDropdownTimeout, setCategoryDropdownTimeout] = useState(null);
  
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

  const [topSearches] = useState(["Omega 3", "Canxi", "Thuốc nhỏ mắt", "Sữa rửa mặt", "Dung dịch vệ sinh", "Men vi sinh", "Kẽm", "Kem chống nắng"]);

  // Xử lý mỗi khi showSearchModal true và searchTerm trống
  useEffect(() => {
    // Giữ nguyên danh sách cố định, không cập nhật từ API
    return;
  }, [showSearchModal, searchTerm]);

  // Không tải sản phẩm động cho dải gợi ý; giữ cố định theo topSearches

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

  // Functions để handle hover với delay
  const handleCartMouseEnter = () => {
    if (cartDropdownTimeout) {
      clearTimeout(cartDropdownTimeout);
      setCartDropdownTimeout(null);
    }
    setShowCartDropdown(true);
  };

  const handleCartMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowCartDropdown(false);
    }, 200); // Delay 200ms để tránh đóng khi di chuyển chuột nhanh
    setCartDropdownTimeout(timeout);
  };

  // Functions để handle user dropdown
  const handleUserMouseEnter = () => {
    if (userDropdownTimeout) {
      clearTimeout(userDropdownTimeout);
      setUserDropdownTimeout(null);
    }
    setShowUserDropdown(true);
  };

  const handleUserMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowUserDropdown(false);
    }, 200);
    setUserDropdownTimeout(timeout);
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Đăng xuất?',
      text: 'Bạn có chắc chắn muốn đăng xuất?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Đăng xuất',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
      }
    });
  };

  // Đăng ký global function để hiển thị cart dropdown
  useEffect(() => {
    window.showCartDropdown = () => {
      setShowCartDropdown(true);
      // Tự động ẩn sau 3 giây
      setTimeout(() => {
        setShowCartDropdown(false);
      }, 3000);
    };

    return () => {
      window.showCartDropdown = null;
      if (cartDropdownTimeout) {
        clearTimeout(cartDropdownTimeout);
      }
    };
  }, [cartDropdownTimeout]);

  // Load level 0 categories for navigation
  useEffect(() => {
    async function loadRootCategories() {
      try {
        const res = await axios.get("/api/categories/tree");
        const data = Array.isArray(res.data) ? res.data : [];
        const roots = data.filter(c => (c.level ?? 0) === 0);
        setRootCategories(roots);
      } catch (e) {
        console.error("Failed to load navigation categories", e);
        setRootCategories([]);
      }
    }
    loadRootCategories();
  }, []);

  // Handlers for category mega menu
  const handleRootCategoryEnter = (cat) => {
    if (categoryDropdownTimeout) {
      clearTimeout(categoryDropdownTimeout);
      setCategoryDropdownTimeout(null);
    }
    setActiveRootCategory(cat);
    const firstL1 = cat?.children && cat.children.length > 0 ? cat.children[0] : null;
    setActiveLevel1Id(firstL1?._id || null);
    setShowCategoryDropdown(true);
  };

  const handleRootCategoryLeave = () => {
    const t = setTimeout(() => {
      setShowCategoryDropdown(false);
      setActiveRootCategory(null);
      setActiveLevel1Id(null);
    }, 150);
    setCategoryDropdownTimeout(t);
  };

  const handleDropdownEnter = () => {
    if (categoryDropdownTimeout) {
      clearTimeout(categoryDropdownTimeout);
      setCategoryDropdownTimeout(null);
    }
  };

  const handleDropdownLeave = () => {
    const t = setTimeout(() => {
      setShowCategoryDropdown(false);
      setActiveRootCategory(null);
      setActiveLevel1Id(null);
    }, 150);
    setCategoryDropdownTimeout(t);
  };

  const handleVoiceSearchClick = () => {
    setShowVoiceSearchModal(true);
  };

  const handleVoiceSearch = (transcript) => {
    saveToHistory(transcript);
    window.location.href = `/search?q=${encodeURIComponent(transcript)}`;
  };

  const handleImageSearchClick = () => {
    setShowImageSearchModal(true);
  };

  const handleImageSearch = (searchQuery) => {
    saveToHistory(searchQuery);
    window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
      `}</style>
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
                        onClick={handleVoiceSearchClick}
                        style={{ 
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "transparent",
                          border: "none",
                          borderRadius: "50%",
                          padding: 8,
                          height: 40,
                          width: 40,
                          cursor: "pointer",
                          transition: "all 0.2s",
                          color: "#3b82f6"
                        }}
                        title="Tìm với giọng nói"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#eff6ff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                          <path 
                            d="M12 2C10.34 2 9 3.34 9 5V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V5C15 3.34 13.66 2 12 2Z" 
                            fill="currentColor"
                          />
                          <path 
                            d="M12 17C9.24 17 7 14.76 7 12H5C5 15.53 7.61 18.43 11 18.92V22H13V18.92C16.39 18.43 19 15.53 19 12H17C17 14.76 14.76 17 12 17Z" 
                            fill="currentColor"
                          />
                        </svg>
                      </button>
                      
                      <button 
                        type="button"
                        onClick={handleImageSearchClick}
                        style={{ 
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "transparent",
                          border: "none",
                          borderRadius: "50%",
                          padding: 8,
                          height: 40,
                          width: 40,
                          cursor: "pointer",
                          transition: "all 0.2s",
                          color: "#3b82f6"
                        }}
                        title="Tìm với hình ảnh"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#eff6ff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" width="22" height="22">
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
                                  style={{ flex: 1, fontSize: 16, color: "#3b82f6", cursor: "pointer" }}
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
                                        window.location.href = `/p/${product.slug || product.id}`;
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
                                        src={getImageUrl(product.image, "/default-product.svg")} 
                                        alt={product.name} 
                                        style={{ 
                                          width: 60, 
                                          height: 60, 
                                          borderRadius: 8, 
                                          objectFit: "cover" 
                                        }}
                                        onError={(e) => handleImageError(e, "/default-product.svg")}
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
                                              {product.discountType === 'amount' && product.discountValue
                                                ? `-${formatDiscountAmount(product.discountValue)}`
                                                : `-${product.discount}%`}
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
                                {topSearches.map((term) => (
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
                          </>
                        )}
                      </div>
                    </div>
                    </>
                  )}
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 180, flexShrink: 0 }}>
                  {user ? (
                    <div style={{ position: "relative" }}>
                      <div
                        key={`user-${user._id || 'unknown'}`}
                        onMouseEnter={handleUserMouseEnter}
                        onMouseLeave={handleUserMouseLeave}
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
                          fontSize: 14,
                          cursor: "pointer"
                        }}
                      >
                        <span style={{ fontSize: 16 }}>👤</span>
                        <span>{user.fullName || user.phone}</span>
                      </div>
                      
                      {/* User Dropdown */}
                      {showUserDropdown && (
                        <div 
                          onMouseEnter={handleUserMouseEnter}
                          onMouseLeave={handleUserMouseLeave}
                          style={{
                            position: "absolute",
                            top: "100%",
                            right: 0,
                            background: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: 8,
                            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                            width: 250,
                            zIndex: 1000,
                            marginTop: 16,
                            animation: "fadeIn 0.2s ease-in-out"
                          }}
                        >
                          <div style={{ padding: 16, borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 18 }}>👤</span>
                            <span style={{ fontWeight: 600, color: "#374151" }}>Tài khoản</span>
                          </div>
                          
                          <div style={{ padding: 8 }}>
                            <Link 
                              to="/profile" 
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "8px 12px",
                                color: "#374151",
                                textDecoration: "none",
                                borderRadius: 6,
                                transition: "background 0.2s"
                              }}
                              onMouseEnter={(e) => e.target.style.background = "#f3f4f6"}
                              onMouseLeave={(e) => e.target.style.background = "transparent"}
                            >
                              <span>👤</span>
                              <span>Thông tin cá nhân</span>
                            </Link>
                            
                            <Link 
                              to="/orders" 
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "8px 12px",
                                color: "#374151",
                                textDecoration: "none",
                                borderRadius: 6,
                                transition: "background 0.2s"
                              }}
                              onMouseEnter={(e) => e.target.style.background = "#f3f4f6"}
                              onMouseLeave={(e) => e.target.style.background = "transparent"}
                            >
                              <span>📋</span>
                              <span>Đơn hàng của tôi</span>
                            </Link>
                            
                            <button
                              onClick={handleLogout}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "8px 12px",
                                color: "#ef4444",
                                background: "none",
                                border: "none",
                                borderRadius: 6,
                                cursor: "pointer",
                                width: "100%",
                                textAlign: "left",
                                transition: "background 0.2s"
                              }}
                              onMouseEnter={(e) => e.target.style.background = "#fef2f2"}
                              onMouseLeave={(e) => e.target.style.background = "transparent"}
                            >
                              <span>🚪</span>
                              <span>Đăng xuất</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAuthModal(true)}
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
                        fontSize: 14,
                        border: "none",
                        cursor: "pointer"
                      }}
                    >
                      <span style={{ fontSize: 16 }}>👤</span>
                      <span>Đăng nhập</span>
                    </button>
                  )}
                  <div style={{ position: "relative" }}>
                    <Link
                      to="/cart"
                      onMouseEnter={handleCartMouseEnter}
                      onMouseLeave={handleCartMouseLeave}
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
                        <span 
                          key={`cart-badge-${cartItems.length}`}
                          style={{ 
                            background: "#ef4444", 
                            color: "white", 
                            borderRadius: "50%", 
                            width: 20, 
                            height: 20, 
                            fontSize: 12, 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center" 
                          }}
                        >
                          {cartItems.length}
                        </span>
                      )}
                    </Link>
                    
                    {/* Cart Dropdown */}
                    {showCartDropdown && (
                      <div 
                        onMouseEnter={handleCartMouseEnter}
                        onMouseLeave={handleCartMouseLeave}
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
                          marginTop: 8,
                          animation: "fadeIn 0.2s ease-in-out"
                        }}
                      >
                        <div style={{ padding: 16, borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 18 }}>🛒</span>
                          <span style={{ fontWeight: 600, color: "#374151" }}>Giỏ hàng</span>
                        </div>
                        
                        {cartItems.length === 0 ? (
                          <div style={{ padding: 20, textAlign: "center", color: "#6b7280" }}>
                            Giỏ hàng trống
                          </div>
                        ) : (
                          <>
                            <div style={{ maxHeight: 300, overflowY: "auto" }}>
                              {cartItems.map((item) => {
                                // console.log('Rendering cart item in dropdown:', { 
                                //   id: item.id, 
                                //   name: item.name, 
                                //   qty: item.qty,
                                //   price: item.price,
                                //   image: item.image
                                // });
                                return (
                                <div key={item.id} style={{ 
                                  display: "flex", 
                                  alignItems: "center", 
                                  padding: 12, 
                                  borderBottom: "1px solid #f3f4f6",
                                  backgroundColor: "#ffffff",
                                  minHeight: "60px"
                                }}>
                                  <img 
                                    src={getImageUrl(item.image, "/vite.svg")} 
                                    alt={item.name} 
                                    style={{ 
                                      width: 50, 
                                      height: 50, 
                                      objectFit: "cover", 
                                      borderRadius: 6, 
                                      marginRight: 12 
                                    }}
                                    onError={(e) => handleImageError(e, "/vite.svg")}
                                  />
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ 
                                      fontSize: 14, 
                                      fontWeight: 600, 
                                      marginBottom: 4,
                                      color: "#1f2937",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      lineHeight: "1.2"
                                    }}>
                                      {item.name || "Tên sản phẩm không xác định"}
                                    </div>
                                    {item.finalPrice !== undefined && item.finalPrice < item.price && (item.discount > 0 || item.originalPrice > item.finalPrice) ? (
                                      <div style={{ marginBottom: 4 }}>
                                        <div style={{ 
                                          color: "#3b82f6", 
                                          fontWeight: 600, 
                                          fontSize: 14 
                                        }}>
                                          {item.finalPrice.toLocaleString()}₫
                                        </div>
                                        <div style={{ 
                                          color: "#9ca3af", 
                                          fontSize: 11,
                                          textDecoration: "line-through"
                                        }}>
                                          {(item.originalPrice || item.price).toLocaleString()}₫
                                        </div>
                                      </div>
                                    ) : (
                                      <div style={{ 
                                        color: "#2e7d32", 
                                        fontWeight: 600, 
                                        fontSize: 14,
                                        marginBottom: 4
                                      }}>
                                        {item.price.toLocaleString()}₫
                                      </div>
                                    )}
                                    <div style={{ 
                                      color: "#6b7280", 
                                      fontSize: 12 
                                    }}>
                                      x{item.qty} Hộp
                                    </div>
                                  </div>
                                  <button 
                                    onClick={() => {
                                      removeFromCart(item.id);
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
                                );
                              })}
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
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center' }}>
                <ul style={{ display: 'flex', gap: 0, listStyle: 'none', padding: 0, margin: 0, alignItems: 'center', justifyContent: 'center', maxWidth: 1200, width: '100%' }}>
                  {(topSearches || []).slice(0,8).map(term => (
                    <li key={term} style={{ margin: 0, padding: '0 8px' }}>
                      <a href={`/search?q=${encodeURIComponent(term)}`} style={{ color: 'white', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', textDecoration: 'none' }}>
                        {term}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Navigation categories */}
          <div style={{ background: "white" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px", position: "relative" }}>
              <nav onMouseEnter={handleDropdownEnter} onMouseLeave={handleRootCategoryLeave} style={{ display: "flex", gap: 0, padding: "6px 0 0 0", justifyContent: "center" }}>
                {(rootCategories && rootCategories.length > 0 ? rootCategories : []).map((category) => (
                  <Link key={category._id} to={`/catalog?category=${category.slug}`} onMouseEnter={() => handleRootCategoryEnter(category)} style={{ 
                    color: "#374151", 
                    textDecoration: "none", 
                    fontWeight: 500, 
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "10px 14px",
                    transition: "all 0.2s",
                    fontSize: 14,
                    position: "relative",
                    borderBottom: "3px solid transparent"
                  }}>
                    <span>{category.name}</span>
                    {(category.children && category.children.length > 0) && (
                      <span style={{ fontSize: 12, marginLeft: 4 }}>▼</span>
                    )}
                  </Link>
                ))}
          </nav>
              {/* Category Mega Dropdown */}
              {showCategoryDropdown && activeRootCategory && (
                <div onMouseEnter={handleDropdownEnter} onMouseLeave={handleDropdownLeave} style={{ position: "absolute", top: "100%", left: 20, right: 20, background: "white", border: "1px solid #e5e7eb", borderRadius: 8, boxShadow: "0 20px 25px rgba(0,0,0,0.1)", zIndex: 1000, marginTop: 8 }}>
                  <div style={{ display: "flex", minHeight: 260 }}>
                    {/* Level 1 column */}
                    <div style={{ width: 280, borderRight: "1px solid #f0f0f0", padding: 14 }}>
                      {(activeRootCategory.children || []).map((c) => (
                        <div key={c._id} onMouseEnter={() => setActiveLevel1Id(c._id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 8, cursor: "pointer", background: activeLevel1Id === c._id ? "#f3f4f6" : "transparent", color: "#374151", fontSize: 16, fontWeight: 500 }}>
                          {/* Category Icon/Image */}
                          {c.iconUrl && c.iconUrl.trim() ? (
                            <img 
                              src={c.iconUrl.startsWith('http') ? c.iconUrl : `http://localhost:5000${c.iconUrl}`}
                              alt={c.name}
                              style={{
                                width: 40,
                                height: 40,
                                objectFit: 'cover',
                                borderRadius: 8,
                                flexShrink: 0
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div style={{
                              width: 40,
                              height: 40,
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              borderRadius: 8,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: 18,
                              fontWeight: 'bold',
                              flexShrink: 0
                            }}>
                              {c.name.charAt(0)}
                            </div>
                          )}
                          <Link to={`/catalog?category=${c.slug}`} style={{ color: "inherit", textDecoration: "none", flex: 1 }}>{c.name}</Link>
                          <span style={{ fontSize: 12, color: "#9ca3af" }}>›</span>
                        </div>
                      ))}
                    </div>
                    {/* Level 2 grid */}
                    <div style={{ flex: 1, padding: 16 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 }}>
                        {(activeRootCategory.children || [])
                          .find((c) => c._id === activeLevel1Id)?.children?.map((c2) => (
                            <Link key={c2._id} to={`/catalog?category=${c2.slug}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, border: "1px solid #e5e7eb", borderRadius: 10, color: "#374151", textDecoration: "none", background: "#fafafa" }}>
                              {/* Level 2 Category Icon/Image */}
                              {c2.iconUrl && c2.iconUrl.trim() ? (
                                <img 
                                  src={c2.iconUrl.startsWith('http') ? c2.iconUrl : `http://localhost:5000${c2.iconUrl}`}
                                  alt={c2.name}
                                  style={{
                                    width: 36,
                                    height: 36,
                                    objectFit: 'cover',
                                    borderRadius: 8,
                                    flexShrink: 0
                                  }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'inline-block';
                                  }}
                                />
                              ) : null}
                              <span style={{ 
                                width: 36, 
                                height: 36, 
                                borderRadius: 8, 
                                background: c2.iconUrl && c2.iconUrl.trim() ? "transparent" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
                                display: c2.iconUrl && c2.iconUrl.trim() ? "none" : "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontSize: 16,
                                fontWeight: "bold",
                                flexShrink: 0
                              }}>
                                {c2.name.charAt(0)}
                              </span>
                              <span style={{ fontSize: 16, fontWeight: 500 }}>{c2.name}</span>
                            </Link>
                          )) || (
                            <div style={{ color: "#9ca3af" }}>Chọn danh mục cấp 1 để xem danh mục con</div>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/track-order" element={<OrderTracking />} />
        <Route path="/orders" element={<UserOrders />} />
        <Route path="/orders/:orderId" element={<OrderDetail />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/test-checkout" element={<TestCheckout />} />
        <Route path="/search" element={<Products />} />
        <Route path="/image-search-results" element={<ImageSearchResults />} />
        <Route path="/tra-cuu/dia-chinh-moi" element={<AddressLookup />} />
        <Route path="/health-check/:slug" element={<HealthCheckPage />} />
        <Route path="/health-check/:slug/result" element={<HealthCheckResultPage />} />
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
          <Route path="brands" element={
            <ProtectedRoute requiredPermission="read_products">
              <BrandManagement />
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
          <Route path="sales-report" element={
            <ProtectedRoute requiredPermission="read_inventory">
              <SalesReport />
            </ProtectedRoute>
          } />
          <Route path="orders" element={
            <ProtectedRoute requiredPermission="read_inventory">
              <OrdersManagement />
            </ProtectedRoute>
          } />
          <Route path="orders/shipping" element={
            <ProtectedRoute requiredPermission="read_inventory">
              <ShippingOrders />
            </ProtectedRoute>
          } />
          <Route path="orders/tracking" element={
            <ProtectedRoute requiredPermission="read_inventory">
              <Tracking />
            </ProtectedRoute>
          } />
          <Route path="orders/invoices" element={
            <ProtectedRoute requiredPermission="read_inventory">
              <Invoices />
            </ProtectedRoute>
          } />
          <Route path="coupons" element={
            <ProtectedRoute requiredPermission="read_products">
              <Promotions />
            </ProtectedRoute>
          } />
          <Route path="reviews" element={
            <ProtectedRoute requiredPermission="read_products">
              <ReviewManagement />
            </ProtectedRoute>
          } />
          <Route path="health-checks" element={<HealthChecks />} />
          <Route path="health-checks/new" element={<HealthCheckDetail />} />
          <Route path="health-checks/:id" element={<HealthCheckDetail />} />
          <Route path="health-checks/:id/questions" element={<QuestionManagement />} />
          <Route path="health-checks/:id/results" element={<ResultManagement />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      
      {/* Footer - Only show on user pages, not admin */}
      {!location.pathname.startsWith('/admin') && <Footer />}
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
      
      {/* Voice Search Modal */}
      <VoiceSearchModal 
        isOpen={showVoiceSearchModal}
        onClose={() => setShowVoiceSearchModal(false)}
        onSearch={handleVoiceSearch}
      />
      
      {/* Image Search Modal */}
      <ImageSearchModal 
        isOpen={showImageSearchModal}
        onClose={() => setShowImageSearchModal(false)}
        onSearch={handleImageSearch}
      />
    </div>
  );
}

export default App;
