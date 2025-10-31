import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/client.js';
import useCart from '../hooks/useCart.js';

export default function VNPayPayment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clear } = useCart();
  const [orderData, setOrderData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Lấy thông tin đơn hàng từ sessionStorage
    const savedOrderData = sessionStorage.getItem('pendingVNPayOrder');
    if (savedOrderData) {
      setOrderData(JSON.parse(savedOrderData));
    } else {
      // Nếu không có dữ liệu, quay về checkout
      navigate('/checkout');
    }
  }, [navigate]);

  const handleSuccess = async () => {
    if (!orderData) return;
    
    setIsProcessing(true);
    try {
      // Tạo đơn hàng với paymentMethod là "vnpay"
      const payload = {
        ...orderData,
        paymentMethod: 'vnpay'
      };
      
      const res = await api.post('/orders', payload);
      const order = res.data;
      
      // Xóa dữ liệu tạm
      sessionStorage.removeItem('pendingVNPayOrder');
      
      // Redirect đến trang thành công
      navigate('/order-success', { 
        state: { 
          orderId: order._id, 
          code: order.code,
          paymentMethod: 'vnpay'
        } 
      });
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    sessionStorage.removeItem('pendingVNPayOrder');
    navigate('/checkout');
  };

  if (!orderData) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: '#f5f5f5'
      }}>
        <div>Đang tải...</div>
      </div>
    );
  }

  const grandTotal = orderData.totals?.grand || 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        maxWidth: '600px',
        width: '100%',
        padding: '40px',
        position: 'relative'
      }}>
        {/* VNPay Logo */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px',
          paddingBottom: '30px',
          borderBottom: '2px solid #e5e7eb'
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#1a4480',
            marginBottom: '10px',
            letterSpacing: '2px'
          }}>
            VNPAY
          </div>
          <div style={{
            fontSize: '14px',
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Cổng thanh toán điện tử
          </div>
        </div>

        {/* Order Info */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            Thông tin thanh toán
          </h2>
          
          <div style={{
            background: '#f9fafb',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '12px',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              <span>Số tiền:</span>
              <span style={{ fontWeight: '600', color: '#1f2937', fontSize: '16px' }}>
                {grandTotal.toLocaleString('vi-VN')}₫
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '12px',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              <span>Nội dung:</span>
              <span style={{ fontWeight: '500', color: '#374151' }}>
                Thanh toán đơn hàng
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              <span>Người nhận:</span>
              <span style={{ fontWeight: '500', color: '#374151' }}>
                {orderData.shippingAddress?.fullName || 'Khách hàng'}
              </span>
            </div>
          </div>

          {/* Fake loading animation */}
          <div style={{
            textAlign: 'center',
            padding: '20px',
            background: '#eff6ff',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'inline-block',
              width: '40px',
              height: '40px',
              border: '4px solid #3b82f6',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '10px'
            }}></div>
            <div style={{ color: '#3b82f6', fontSize: '14px', fontWeight: '500' }}>
              Đang kết nối đến cổng thanh toán...
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleCancel}
            disabled={isProcessing}
            style={{
              flex: 1,
              padding: '14px 24px',
              background: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: isProcessing ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!isProcessing) e.target.style.background = '#e5e7eb';
            }}
            onMouseLeave={(e) => {
              if (!isProcessing) e.target.style.background = '#f3f4f6';
            }}
          >
            Hủy
          </button>
          <button
            onClick={handleSuccess}
            disabled={isProcessing}
            style={{
              flex: 2,
              padding: '14px 24px',
              background: isProcessing ? '#9ca3af' : '#1a4480',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: isProcessing ? 'none' : '0 4px 12px rgba(26, 68, 128, 0.3)'
            }}
            onMouseEnter={(e) => {
              if (!isProcessing) e.target.style.background = '#153a6b';
            }}
            onMouseLeave={(e) => {
              if (!isProcessing) e.target.style.background = '#1a4480';
            }}
          >
            {isProcessing ? 'Đang xử lý...' : 'Thanh toán thành công'}
          </button>
        </div>

        {/* Disclaimer */}
        <div style={{
          marginTop: '30px',
          paddingTop: '20px',
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center',
          fontSize: '12px',
          color: '#9ca3af'
        }}>
          <p style={{ margin: 0 }}>
            Đây là trang giả lập VN Pay để minh họa cho luận văn.
            <br />
            Trong môi trường thực tế, đây sẽ là trang thanh toán của VN Pay.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}


