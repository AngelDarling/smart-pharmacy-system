import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function VNPayReturn() {
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy toàn bộ query từ URL do VNPay redirect về
    const query = window.location.search.substring(1);

    // Gọi backend để xác thực chữ ký (hash)
    fetch(`http://localhost:5000/api/payments/vnpay_return?${query}`)
      .then(res => res.json())
      .then(data => {
        console.log('Kết quả từ backend:', data);

        // Nếu thanh toán thành công
        if (data && data.code === '00') {
          navigate(`/payment-result?success=true&code=${data.code}&orderId=${data.orderId || ''}&amount=${data.amount || ''}&message=${encodeURIComponent('Thanh toán thành công!')}`);
        } else {
          // Nếu thất bại
          navigate(`/payment-result?success=false&code=${data.code || '99'}&message=${encodeURIComponent(data.message || 'Thanh toán thất bại')}`);
        }
      })
      .catch(err => {
        console.error('Lỗi khi xác thực thanh toán:', err);
        navigate(`/payment-result?success=false&code=99&message=${encodeURIComponent('Không thể xác thực thanh toán')}`);
      });
  }, [navigate]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      background: '#f9fafb',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        fontSize: 24,
        fontWeight: 600,
        color: '#1a4480',
        marginBottom: 16
      }}>
        Đang xác thực thanh toán...
      </div>
      <div style={{
        width: 40,
        height: 40,
        border: '4px solid #1a4480',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
