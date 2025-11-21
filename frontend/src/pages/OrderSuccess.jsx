import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import api from '../api/client';

const CheckCircleIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const PackageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

export default function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        // Get orderId and code from location state or query params
        let orderId = location.state?.orderId || searchParams.get('orderId');
        const code = location.state?.code || searchParams.get('code');
        const status = searchParams.get('status');
        const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
        const vnp_TxnRef = searchParams.get('vnp_TxnRef');

        // If no orderId but has vnp_TxnRef, extract orderId from it
        if (!orderId && vnp_TxnRef) {
          orderId = vnp_TxnRef.split('_')[0]; // Extract orderId from format: orderId_timestamp
          console.log('Extracted orderId from vnp_TxnRef:', orderId);
        }

        if (!orderId && !code) {
          navigate('/');
          return;
        }

        // If we have orderId, fetch full order details
        if (orderId) {
          // If returning from MoMo, check payment status first to ensure DB is updated
          if (searchParams.get('partnerCode') || searchParams.get('resultCode')) {
            try {
              await api.get(`/payment/momo/status/${orderId}`);
            } catch (err) {
              console.error('Error checking MoMo payment status:', err);
            }
          }

          // If returning from VNPay with success, update order status manually
          // This is needed because IPN cannot reach localhost
          if (vnp_ResponseCode === '00' && orderId) {
            try {
              console.log('VNPay payment successful, updating order status...');
              // Call backend to verify and update order status
              await api.post(`/payment/vnpay/verify-return`, {
                orderId,
                vnp_ResponseCode,
                vnp_TransactionNo: searchParams.get('vnp_TransactionNo'),
                vnp_TxnRef: searchParams.get('vnp_TxnRef')
              });
            } catch (err) {
              console.error('Error updating VNPay order status:', err);
            }
          }

          const res = await api.get(`/orders/${orderId}`);
          setOrder(res.data);
        } else {
          // If only code, create minimal order object
          setOrder({ code, status: status || 'pending' });
        }
      } catch (error) {
        console.error('Error loading order:', error);
        // If error, still show success with code if available
        const code = location.state?.code || searchParams.get('code');
        if (code) {
          setOrder({ code });
        }
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [location, searchParams, navigate]);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingCard}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  const isMoMoPayment = order?.paymentMethod === 'momo';
  const isVNPayPayment = order?.paymentMethod === 'vnpay';
  const isPaymentSuccess = searchParams.get('status') === 'success' || order?.paymentStatus === 'paid';
  const isCancelled = order?.status === 'cancelled' || order?.paymentStatus === 'failed';

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Success Icon */}
        <div style={{
          ...styles.iconContainer,
          backgroundColor: isPaymentSuccess ? '#dcfce7' : isCancelled ? '#fee2e2' : '#fef3c7'
        }}>
          <div style={{
            color: isPaymentSuccess ? '#16a34a' : isCancelled ? '#dc2626' : '#f59e0b'
          }}>
            {isPaymentSuccess ? <CheckCircleIcon /> : isCancelled ? (
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            ) : <PackageIcon />}
          </div>
        </div>

        {/* Title */}
        <h1 style={styles.title}>
          {isPaymentSuccess ? 'Đặt hàng thành công!' : isCancelled ? 'Thanh toán thất bại' : 'Đơn hàng đã được tạo!'}
        </h1>

        {/* Description */}
        <p style={styles.description}>
          {isMoMoPayment && isPaymentSuccess && (
            <>Thanh toán MoMo thành công. Đơn hàng của bạn đang được xử lý.</>
          )}
          {isMoMoPayment && isCancelled && (
            <>Giao dịch thanh toán đã bị hủy hoặc thất bại. Đơn hàng đã được cập nhật trạng thái hủy.</>
          )}
          {isMoMoPayment && !isPaymentSuccess && !isCancelled && (
            <>Đơn hàng đã được tạo. Vui lòng hoàn tất thanh toán để chúng tôi xử lý đơn hàng.</>
          )}
          {isVNPayPayment && isPaymentSuccess && (
            <>Thanh toán VNPay thành công. Đơn hàng của bạn đang được xử lý.</>
          )}
          {isVNPayPayment && isCancelled && (
            <>Giao dịch thanh toán đã bị hủy hoặc thất bại. Đơn hàng đã được cập nhật trạng thái hủy.</>
          )}
          {isVNPayPayment && !isPaymentSuccess && !isCancelled && (
            <>Đơn hàng đã được tạo. Vui lòng hoàn tất thanh toán để chúng tôi xử lý đơn hàng.</>
          )}
          {!isMoMoPayment && !isVNPayPayment && (
            <>Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ với bạn sớm nhất.</>
          )}
        </p>

        {/* Order Info */}
        {order && (
          <div style={styles.orderInfo}>
            {order.code && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Mã đơn hàng:</span>
                <span style={styles.infoValue}>{order.code}</span>
              </div>
            )}

            {searchParams.get('transId') && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Mã giao dịch MoMo:</span>
                <span style={styles.infoValue}>{searchParams.get('transId')}</span>
              </div>
            )}

            {searchParams.get('vnp_TransactionNo') && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Mã giao dịch VNPay:</span>
                <span style={styles.infoValue}>{searchParams.get('vnp_TransactionNo')}</span>
              </div>
            )}

            {order.totals?.grand && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Tổng tiền:</span>
                <span style={{ ...styles.infoValue, color: '#dc2626', fontWeight: '700' }}>
                  {order.totals.grand.toLocaleString('vi-VN')}₫
                </span>
              </div>
            )}

            {order.paymentMethod && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Phương thức thanh toán:</span>
                <span style={styles.infoValue}>
                  {order.paymentMethod === 'momo' ? 'MoMo' :
                    order.paymentMethod === 'vnpay' ? 'VNPay' :
                      order.paymentMethod === 'cod' ? 'COD' :
                        order.paymentMethod?.toUpperCase()}
                </span>
              </div>
            )}

            {(isMoMoPayment || isVNPayPayment) && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Trạng thái thanh toán:</span>
                <span style={{
                  ...styles.badge,
                  backgroundColor: isPaymentSuccess ? '#dcfce7' : isCancelled ? '#fee2e2' : '#fef3c7',
                  color: isPaymentSuccess ? '#16a34a' : isCancelled ? '#dc2626' : '#f59e0b'
                }}>
                  {isPaymentSuccess ? 'Đã thanh toán' : isCancelled ? 'Đã hủy' : 'Chờ thanh toán'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={styles.actions}>
          <button
            onClick={() => navigate('/')}
            style={styles.primaryButton}
          >
            Về trang chủ
          </button>
          {order?.code && (
            <button
              onClick={() => window.open(`/track-order?code=${encodeURIComponent(order.code)}`, '_blank')}
              style={styles.secondaryButton}
            >
              Theo dõi đơn hàng
            </button>
          )}
        </div>

        {/* Additional Info */}
        {order?.shippingAddress && !isCancelled && (
          <div style={styles.infoBox}>
            {order.shippingAddress.email && (
              <p style={styles.infoBoxText}>
                📧 Chúng tôi đã gửi email xác nhận đến <strong>{order.shippingAddress.email}</strong>
              </p>
            )}
            {order.shippingAddress.address && (
              <p style={styles.infoBoxText}>
                📦 Đơn hàng sẽ được giao đến: <strong>{order.shippingAddress.address}</strong>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '48px 32px',
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    textAlign: 'center'
  },
  loadingCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '48px 32px',
    maxWidth: '400px',
    width: '100%',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    textAlign: 'center'
  },
  iconContainer: {
    width: '96px',
    height: '96px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '12px'
  },
  description: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '32px',
    lineHeight: '1.6'
  },
  orderInfo: {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '32px',
    textAlign: 'left'
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #e5e7eb'
  },
  infoLabel: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500'
  },
  infoValue: {
    fontSize: '14px',
    color: '#1f2937',
    fontWeight: '600'
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '24px'
  },
  primaryButton: {
    padding: '14px 24px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  secondaryButton: {
    padding: '14px 24px',
    backgroundColor: 'white',
    color: '#2563eb',
    border: '2px solid #2563eb',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'left'
  },
  infoBoxText: {
    fontSize: '14px',
    color: '#1e40af',
    margin: '8px 0',
    lineHeight: '1.5'
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 16px'
  },
  loadingText: {
    fontSize: '16px',
    color: '#6b7280'
  }
};
