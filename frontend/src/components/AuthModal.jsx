import { useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import Swal from "sweetalert2";

export default function AuthModal({ isOpen, onClose }) {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userData = await login(formData.phone, formData.password);
      console.log('Login successful, user data:', userData);
      Swal.fire({
        title: 'Đăng nhập thành công!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      onClose();
    } catch (error) {
      Swal.fire({
        title: 'Lỗi đăng nhập',
        text: error.message || 'Số điện thoại hoặc mật khẩu không đúng',
        icon: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (!agreeToTerms) {
      Swal.fire({
        title: 'Lỗi',
        text: 'Bạn phải đồng ý với điều khoản dịch vụ để đăng ký',
        icon: 'error'
      });
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        title: 'Lỗi',
        text: 'Mật khẩu xác nhận không khớp',
        icon: 'error'
      });
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      Swal.fire({
        title: 'Lỗi',
        text: 'Mật khẩu phải có ít nhất 6 ký tự',
        icon: 'error'
      });
      setIsLoading(false);
      return;
    }

    try {
      await register(formData);
      Swal.fire({
        title: 'Đăng ký thành công!',
        text: 'Bạn có thể đăng nhập ngay bây giờ',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      setIsLogin(true);
      setFormData({
        fullName: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: ""
      });
    } catch (error) {
      Swal.fire({
        title: 'Lỗi đăng ký',
        text: error.message || 'Có lỗi xảy ra khi đăng ký',
        icon: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const showTermsModal = () => {
    Swal.fire({
      title: 'Điều khoản dịch vụ',
      html: `
        <div style="text-align: left; max-height: 400px; overflow-y: auto;">
          <h4>I. Nguyên tắc chung</h4>
          <p>Website/ứng dụng thương mại điện tử bán hàng do Công ty Cổ phần dược phẩm FPT Long Châu vận hành. Đối tượng phục vụ là khách hàng trên 63 tỉnh thành Việt Nam.</p>
          
          <h4>II. Quy định chung</h4>
          <p>Sản phẩm được kinh doanh phải đáp ứng đầy đủ các quy định của pháp luật, không bán hàng nhái, hàng không rõ nguồn gốc.</p>
          
          <h4>III. Quy trình giao dịch</h4>
          <p>Khách hàng có thể tìm kiếm, chọn sản phẩm, điền thông tin mua hàng và thanh toán theo các phương thức được hỗ trợ.</p>
          
          <h4>IV. Bảo vệ thông tin cá nhân</h4>
          <p>Chúng tôi cam kết bảo mật thông tin cá nhân của khách hàng theo quy định pháp luật. Thông tin chỉ được sử dụng cho mục đích cung cấp dịch vụ và chăm sóc khách hàng.</p>
          
          <h4>V. Quyền và nghĩa vụ</h4>
          <p>Khách hàng có quyền được bảo vệ thông tin cá nhân và có nghĩa vụ cung cấp thông tin chính xác khi sử dụng dịch vụ.</p>
        </div>
      `,
      width: 600,
      confirmButtonText: 'Tôi đã đọc và đồng ý',
      confirmButtonColor: '#667eea'
    });
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        background: "white",
        borderRadius: 12,
        padding: 32,
        width: 400,
        maxWidth: "90vw",
        position: "relative"
      }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            right: 16,
            top: 16,
            background: "none",
            border: "none",
            fontSize: 24,
            cursor: "pointer",
            color: "#666"
          }}
        >
          ×
        </button>

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h2 style={{ margin: 0, color: "#1f2937", fontSize: 24, fontWeight: 600 }}>
            {isLogin ? "Đăng nhập" : "Đăng ký"}
          </h2>
          <p style={{ color: "#6b7280", margin: "8px 0 0 0" }}>
            {isLogin 
              ? "Vui lòng đăng nhập để hưởng những đặc quyền dành cho thành viên"
              : "Tạo tài khoản để mua sắm thuận tiện hơn"
            }
          </p>
        </div>

        {!isLogin && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#374151" }}>
              Họ và tên *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #d1d5db",
                borderRadius: 8,
                fontSize: 14,
                boxSizing: "border-box"
              }}
              placeholder="Nhập họ và tên"
            />
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#374151" }}>
            Số điện thoại *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
            style={{
              width: "100%",
              padding: "12px 16px",
              border: "1px solid #d1d5db",
              borderRadius: 8,
              fontSize: 14,
              boxSizing: "border-box"
            }}
            placeholder="Nhập số điện thoại"
          />
        </div>

        {!isLogin && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#374151" }}>
              Email <span style={{ color: "#6b7280", fontWeight: 400 }}>(không bắt buộc)</span>
            </label>
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
              placeholder="Nhập email (không bắt buộc)"
            />
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#374151" }}>
            Mật khẩu *
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            style={{
              width: "100%",
              padding: "12px 16px",
              border: "1px solid #d1d5db",
              borderRadius: 8,
              fontSize: 14,
              boxSizing: "border-box"
            }}
            placeholder="Nhập mật khẩu"
          />
        </div>

        {!isLogin && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#374151" }}>
              Xác nhận mật khẩu *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #d1d5db",
                borderRadius: 8,
                fontSize: 14,
                boxSizing: "border-box"
              }}
              placeholder="Nhập lại mật khẩu"
            />
          </div>
        )}

        {!isLogin && (
          <div style={{ marginBottom: 24, fontSize: 12, color: "#6b7280" }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <input 
                type="checkbox" 
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                style={{ marginTop: 2 }} 
              />
              <span>
                Tôi đồng ý với{" "}
                <button
                  type="button"
                  onClick={showTermsModal}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#667eea",
                    textDecoration: "underline",
                    cursor: "pointer",
                    padding: 0
                  }}
                >
                  điều khoản dịch vụ
                </button>{" "}
                và{" "}
                <button
                  type="button"
                  onClick={showTermsModal}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#667eea",
                    textDecoration: "underline",
                    cursor: "pointer",
                    padding: 0
                  }}
                >
                  chính sách bảo mật
                </button>
              </span>
            </label>
          </div>
        )}

        <button
          onClick={isLogin ? handleLogin : handleRegister}
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "12px",
            background: isLoading ? "#9ca3af" : "#667eea",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            cursor: isLoading ? "not-allowed" : "pointer",
            marginBottom: 16
          }}
        >
          {isLoading ? "Đang xử lý..." : (isLogin ? "Đăng nhập" : "Đăng ký")}
        </button>

        <div style={{ textAlign: "center" }}>
          <span style={{ color: "#6b7280" }}>
            {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
          </span>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setFormData({
                fullName: "",
                phone: "",
                email: "",
                password: "",
                confirmPassword: ""
              });
              setAgreeToTerms(false);
            }}
            style={{
              background: "none",
              border: "none",
              color: "#667eea",
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: 14
            }}
          >
            {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
          </button>
        </div>
      </div>
    </div>
  );
}
