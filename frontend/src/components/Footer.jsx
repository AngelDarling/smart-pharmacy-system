import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Chatbot from './Chatbot.jsx';

export default function Footer() {
  const [showChatbot, setShowChatbot] = useState(false);
  const handleLinkClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer style={{
      background: 'white',
      padding: '40px 0 20px',
      borderTop: '1px solid #e5e7eb',
      marginTop: 'auto'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        {/* Main Footer Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 40,
          marginBottom: 30
        }}>

          {/* VỀ CHÚNG TÔI */}
          <div>
            <h3 style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#1f2937',
              marginBottom: 20,
              textTransform: 'uppercase'
            }}>
              VỀ CHÚNG TÔI
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Link to="/about" onClick={handleLinkClick} style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 14 }}>
                Giới thiệu
              </Link>
              <Link to="/license" onClick={handleLinkClick} style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 14 }}>
                Giấy phép kinh doanh
              </Link>
              <Link to="/privacy" onClick={handleLinkClick} style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 14 }}>
                Chính sách bảo mật
              </Link>
              <Link to="/return-policy" onClick={handleLinkClick} style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 14 }}>
                Chính sách đổi trả
              </Link>
              <Link to="/terms" onClick={handleLinkClick} style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 14 }}>
                Điều khoản sử dụng
              </Link>
              <Link to="/shipping" onClick={handleLinkClick} style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 14 }}>
                Chính sách giao hàng
              </Link>
              <Link to="/warranty" onClick={handleLinkClick} style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 14 }}>
                Chính sách bảo hành
              </Link>
            </div>
          </div>

          {/* DANH MỤC SẢN PHẨM */}
          <div>
            <h3 style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#1f2937',
              marginBottom: 20,
              textTransform: 'uppercase'
            }}>
              DANH MỤC SẢN PHẨM
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Link to="/catalog?category=thuc-pham-chuc-nang" onClick={handleLinkClick} style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 14 }}>
                Thực phẩm chức năng
              </Link>
              <Link to="/catalog?category=duoc-my-pham" onClick={handleLinkClick} style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 14 }}>
                Dược mỹ phẩm
              </Link>
              <Link to="/catalog?category=thuoc" onClick={handleLinkClick} style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 14 }}>
                Thuốc
              </Link>
              <Link to="/catalog?category=cham-soc-ca-nhan" onClick={handleLinkClick} style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 14 }}>
                Chăm sóc cá nhân
              </Link>
              <Link to="/catalog?category=thiet-bi-y-te" onClick={handleLinkClick} style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 14 }}>
                Thiết bị y tế
              </Link>
              <Link to="/catalog?category=thuc-pham-bao-ve-suc-khoe" onClick={handleLinkClick} style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 14 }}>
                Thực phẩm bảo vệ sức khỏe
              </Link>
              <Link to="/catalog" onClick={handleLinkClick} style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 14 }}>
                Tất cả sản phẩm
              </Link>
            </div>
          </div>

          {/* HỖ TRỢ KHÁCH HÀNG */}
          <div>
            <h3 style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#1f2937',
              marginBottom: 20,
              textTransform: 'uppercase'
            }}>
              HỖ TRỢ KHÁCH HÀNG
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Link to="/help" onClick={handleLinkClick} style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 14 }}>
                Hướng dẫn mua hàng
              </Link>
              <Link to="/faq" onClick={handleLinkClick} style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 14 }}>
                Câu hỏi thường gặp
              </Link>
              <Link to="/contact" onClick={handleLinkClick} style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 14 }}>
                Liên hệ
              </Link>
              <Link to="/track-order" onClick={handleLinkClick} style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 14 }}>
                Tra cứu đơn hàng
              </Link>
              <Link to="/health-advice" onClick={handleLinkClick} style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 14 }}>
                Tư vấn sức khỏe
              </Link>
              <Link to="/drug-lookup" onClick={handleLinkClick} style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 14 }}>
                Tra cứu thuốc
              </Link>
              <Link to="/health-news" onClick={handleLinkClick} style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 14 }}>
                Tin tức sức khỏe
              </Link>
            </div>
          </div>

          {/* LIÊN HỆ & THÔNG TIN */}
          <div>
            <h3 style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#1f2937',
              marginBottom: 20,
              textTransform: 'uppercase'
            }}>
              TỔNG ĐÀI (8:00-22:00)
            </h3>
            <div style={{ marginBottom: 30 }}>
              <div style={{ marginBottom: 8 }}>
                <span style={{ color: '#6b7280', fontSize: 14 }}>Tư vấn mua hàng </span>
                <div>
                  <a href="tel:18006928" style={{ color: '#3b82f6', textDecoration: 'underline', fontWeight: 600, fontSize: 14 }}>
                    1800 6928 (Nhánh 1)
                  </a>
                </div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <span style={{ color: '#6b7280', fontSize: 14 }}>Hỗ trợ kỹ thuật </span>
                <div>
                  <a href="tel:18006929" style={{ color: '#3b82f6', textDecoration: 'underline', fontWeight: 600, fontSize: 14 }}>
                    1800 6929 (Nhánh 2)
                  </a>
                </div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <span style={{ color: '#6b7280', fontSize: 14 }}>Khiếu nại </span>
                <div>
                  <a href="tel:18006930" style={{ color: '#3b82f6', textDecoration: 'underline', fontWeight: 600, fontSize: 14 }}>
                    1800 6930 (Nhánh 3)
                  </a>
                </div>
              </div>
            </div>

            <h3 style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#1f2937',
              marginBottom: 15,
              textTransform: 'uppercase'
            }}>
              KẾT NỐI VỚI CHÚNG TÔI
            </h3>
            <div style={{ display: 'flex', gap: 15, marginBottom: 30 }}>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{
                display: 'block',
                width: 40,
                height: 40,
                transition: 'transform 0.2s'
              }}>
                <img
                  src="/facebook_logo_3152b9bb16.svg"
                  alt="Facebook"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </a>
              <a href="https://zalo.me" target="_blank" rel="noopener noreferrer" style={{
                display: 'block',
                width: 40,
                height: 40,
                transition: 'transform 0.2s'
              }}>
                <img
                  src="/Logo_Zalo_979d41d52b.svg"
                  alt="Zalo"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </a>
            </div>

            <h3 style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#1f2937',
              marginBottom: 15,
              textTransform: 'uppercase'
            }}>
              HỖ TRỢ THANH TOÁN
            </h3>
            <div style={{
              display: 'flex',
              gap: 12,
              marginBottom: 20,
              flexWrap: 'wrap'
            }}>
              <img
                src="/momo-logo.png"
                alt="MoMo"
                style={{
                  height: 40,
                  width: 'auto',
                  borderRadius: 6,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              />
              <img
                src="/vnpay-logo.png"
                alt="VNPay"
                style={{
                  height: 40,
                  width: 'auto',
                  borderRadius: 6,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div style={{
          borderTop: '1px solid #e5e7eb',
          paddingTop: 20,
          textAlign: 'center'
        }}>
          <div style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}>
            © 2024 Smart Pharmacy System - Hệ thống quản lý nhà thuốc thông minh
          </div>
          <div style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}>
            Địa chỉ: 123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh
          </div>
          <div style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}>
            Số điện thoại:
            <a href="tel:02873023456" onClick={handleLinkClick} style={{ color: '#3b82f6', textDecoration: 'underline', marginLeft: 5 }}>
              (028) 7302 3456
            </a>
            {' '} - Email:
            <a href="mailto:contact@smartpharmacy.com" onClick={handleLinkClick} style={{ color: '#3b82f6', textDecoration: 'underline', marginLeft: 5 }}>
              contact@smartpharmacy.com
            </a>
          </div>
          <div style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.6 }}>
            Người chịu trách nhiệm nội dung: Admin System
          </div>
        </div>
      </div>

      {/* Floating Chatbot Button */}
      <div style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1000
      }}>
        <button style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: showChatbot
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : '#3b82f6',
          border: 'none',
          color: 'white',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: showChatbot
            ? '0 6px 20px rgba(102, 126, 234, 0.5)'
            : '0 4px 12px rgba(59, 130, 246, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          transition: 'all 0.3s ease',
          transform: showChatbot ? 'scale(1.1)' : 'scale(1)'
        }}
          onMouseEnter={(e) => {
            if (!showChatbot) {
              e.target.style.transform = 'scale(1.1)';
              e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!showChatbot) {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
            }
          }}
          onClick={() => setShowChatbot(!showChatbot)}
          title={showChatbot ? 'Đóng chatbot' : 'Mở AI tư vấn'}
        >
          <div style={{ fontSize: 20 }}>{showChatbot ? '🤖' : '💬'}</div>
          <div style={{ fontSize: 8 }}>{showChatbot ? 'ĐÓNG' : 'AI TƯ VẤN'}</div>
        </button>
      </div>

      {/* Chatbot Component */}
      <Chatbot isOpen={showChatbot} onClose={() => setShowChatbot(false)} />
    </footer>
  );
}
