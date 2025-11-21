import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';

// Status translations
const STATUS_LABELS = {
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  shipping: 'Đang giao hàng',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy'
};

const PAYMENT_STATUS_LABELS = {
  pending: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  failed: 'Thanh toán thất bại'
};

const PAYMENT_METHOD_LABELS = {
  cod: 'Thanh toán khi nhận hàng',
  momo: 'Ví MoMo',
  vnpay: 'VNPay',
  bank_transfer: 'Chuyển khoản ngân hàng'
};

// Status colors
const STATUS_COLORS = {
  pending: { bg: '#fef3c7', text: '#f59e0b', border: '#fbbf24' },
  processing: { bg: '#dbeafe', text: '#3b82f6', border: '#60a5fa' },
  shipping: { bg: '#e0e7ff', text: '#6366f1', border: '#818cf8' },
  completed: { bg: '#dcfce7', text: '#16a34a', border: '#4ade80' },
  cancelled: { bg: '#fee2e2', text: '#dc2626', border: '#f87171' }
};

const PackageIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const TruckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const XCircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const getStatusIcon = (status) => {
  switch (status) {
    case 'completed': return <CheckCircleIcon />;
    case 'shipping': return <TruckIcon />;
    case 'cancelled': return <XCircleIcon />;
    default: return <PackageIcon />;
  }
};

export default function OrderTracking() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [code, setCode] = useState(searchParams.get('code') || '');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  async function lookup(c) {
    if (!c) return;
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/orders/public/by-code/${encodeURIComponent(c)}`);
      setOrder(res.data);
    } catch (e) {
      setOrder(null);
      setError('Không tìm thấy đơn hàng. Vui lòng kiểm tra lại mã.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (code) lookup(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusColor = order ? STATUS_COLORS[order.status] || STATUS_COLORS.pending : null;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Theo dõi đơn hàng</h1>
        <p style={styles.subtitle}>Nhập mã đơn hàng để xem trạng thái giao hàng</p>
      </div>

      <div style={styles.searchBox}>
        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setSearchParams({ code: e.target.value.toUpperCase() });
          }}
          placeholder="Nhập mã đơn hàng (VD: ORD123456789)"
          style={styles.input}
        />
        <button
          onClick={() => lookup(code)}
          disabled={!code || loading}
          style={{
            ...styles.button,
            opacity: !code || loading ? 0.5 : 1,
            cursor: !code || loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Đang tra cứu...' : 'Tra cứu'}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {order && (
        <div style={styles.orderCard}>
          {/* Order Header */}
          <div style={styles.orderHeader}>
            <div style={styles.orderHeaderLeft}>
              <div style={styles.iconWrapper}>
                {getStatusIcon(order.status)}
              </div>
              <div>
                <div style={styles.orderCode}>Đơn hàng {order.code}</div>
                <div style={styles.orderDate}>
                  Đặt ngày {new Date(order.createdAt).toLocaleString('vi-VN')}
                </div>
              </div>
            </div>
            <div
              style={{
                ...styles.statusBadge,
                backgroundColor: statusColor.bg,
                color: statusColor.text,
                border: `2px solid ${statusColor.border}`
              }}
            >
              {STATUS_LABELS[order.status] || order.status}
            </div>
          </div>

          {/* Timeline */}
          <div style={styles.timeline}>
            <div style={styles.timelineTitle}>Tiến trình đơn hàng</div>
            <div style={styles.timelineSteps}>
              {['pending', 'processing', 'shipping', 'completed'].map((step, idx) => {
                const isActive = ['pending', 'processing', 'shipping', 'completed'].indexOf(order.status) >= idx;
                const isCancelled = order.status === 'cancelled';
                return (
                  <div key={step} style={styles.timelineStep}>
                    <div
                      style={{
                        ...styles.timelineDot,
                        backgroundColor: isActive && !isCancelled ? '#2563eb' : '#e5e7eb',
                        border: `3px solid ${isActive && !isCancelled ? '#2563eb' : '#d1d5db'}`
                      }}
                    />
                    {idx < 3 && (
                      <div
                        style={{
                          ...styles.timelineLine,
                          backgroundColor: isActive && !isCancelled ? '#2563eb' : '#e5e7eb'
                        }}
                      />
                    )}
                    <div style={styles.timelineLabel}>{STATUS_LABELS[step]}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Details */}
          <div style={styles.detailsGrid}>
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>Phương thức thanh toán</div>
              <div style={styles.detailValue}>
                {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
              </div>
            </div>
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>Trạng thái thanh toán</div>
              <div style={styles.detailValue}>
                {PAYMENT_STATUS_LABELS[order.paymentStatus] || order.paymentStatus}
              </div>
            </div>
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>Địa chỉ giao hàng</div>
              <div style={styles.detailValue}>
                {order.shippingAddress?.address || 'Chưa có thông tin'}
              </div>
            </div>
          </div>

          {/* Products */}
          <div style={styles.productsSection}>
            <div style={styles.productsTitle}>Sản phẩm ({order.items?.length || 0})</div>
            <div style={styles.productsList}>
              {(order.items || []).map((item, idx) => (
                <div key={idx} style={styles.productItem}>
                  <div style={styles.productImageWrapper}>
                    <img
                      src={item.imageSnapshot || '/placeholder-product.png'}
                      alt={item.nameSnapshot}
                      style={styles.productImage}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"%3E%3Crect fill="%23f3f4f6" width="80" height="80"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%239ca3af"%3E📦%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                  <div style={styles.productInfo}>
                    <div style={styles.productName}>{item.nameSnapshot}</div>
                    <div style={styles.productMeta}>
                      <span style={styles.productQuantity}>Số lượng: {item.quantity}</span>
                      <span style={styles.productUnitPrice}>
                        {(item.priceSnapshot || 0).toLocaleString('vi-VN')}₫/sp
                      </span>
                    </div>
                  </div>
                  <div style={styles.productPrice}>
                    {((item.priceSnapshot || 0) * item.quantity).toLocaleString('vi-VN')}₫
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div style={styles.totalSection}>
            <div style={styles.subtotalCard}>
              <div style={styles.subtotalIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 2v4m6-4v4M4 8h16M4 8v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8M4 8h16" />
                </svg>
              </div>
              <div style={styles.subtotalContent}>
                <span style={styles.subtotalLabel}>Tạm tính</span>
                <span style={styles.subtotalValue}>{(order.totals?.items || 0).toLocaleString('vi-VN')}₫</span>
              </div>
            </div>

            {order.totals?.discount > 0 && (
              <div style={styles.discountRow}>
                <div style={styles.discountIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3m.08 4h.01" />
                  </svg>
                </div>
                <span style={styles.discountLabel}>Giảm giá</span>
                <span style={styles.discountValue}>
                  -{(order.totals.discount || 0).toLocaleString('vi-VN')}₫
                </span>
              </div>
            )}

            <div style={styles.shippingCard}>
              <div style={styles.shippingIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <div style={styles.shippingContent}>
                <span style={styles.shippingLabel}>Phí vận chuyển</span>
                <span style={styles.shippingValue}>
                  {order.totals?.shipping === 0 ? 'Miễn phí' : `${(order.totals?.shipping || 0).toLocaleString('vi-VN')}₫`}
                </span>
              </div>
            </div>

            <div style={styles.grandTotal}>
              <span style={styles.grandTotalLabel}>Tổng cộng</span>
              <span style={styles.grandTotalValue}>{(order.totals?.grand || 0).toLocaleString('vi-VN')}₫</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    padding: '40px 20px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '16px',
    color: '#6b7280'
  },
  searchBox: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    marginBottom: '32px',
    maxWidth: '600px',
    margin: '0 auto 32px'
  },
  input: {
    flex: 1,
    padding: '14px 18px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  button: {
    padding: '14px 32px',
    borderRadius: '12px',
    border: 'none',
    background: '#2563eb',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.2s'
  },
  error: {
    textAlign: 'center',
    color: '#dc2626',
    backgroundColor: '#fee2e2',
    padding: '12px 20px',
    borderRadius: '8px',
    marginBottom: '20px',
    maxWidth: '600px',
    margin: '0 auto 20px'
  },
  orderCard: {
    maxWidth: '900px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden'
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
    borderBottom: '1px solid #f3f4f6'
  },
  orderHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  iconWrapper: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#2563eb'
  },
  orderCode: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1f2937'
  },
  orderDate: {
    fontSize: '14px',
    color: '#6b7280',
    marginTop: '4px'
  },
  statusBadge: {
    padding: '8px 20px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600'
  },
  timeline: {
    padding: '32px 24px',
    backgroundColor: '#f8fafc'
  },
  timelineTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '24px'
  },
  timelineSteps: {
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative'
  },
  timelineStep: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative'
  },
  timelineDot: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    zIndex: 1
  },
  timelineLine: {
    position: 'absolute',
    top: '10px',
    left: '50%',
    width: '100%',
    height: '4px',
    zIndex: 0
  },
  timelineLabel: {
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '12px',
    textAlign: 'center'
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    padding: '24px',
    borderBottom: '1px solid #f3f4f6'
  },
  detailItem: {},
  detailLabel: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '4px'
  },
  detailValue: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1f2937'
  },
  productsSection: {
    padding: '24px',
    borderBottom: '1px solid #f3f4f6'
  },
  productsTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '16px'
  },
  productsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  productItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    backgroundColor: '#ffffff',
    border: '2px solid #f3f4f6',
    borderRadius: '12px',
    transition: 'all 0.2s'
  },
  productImageWrapper: {
    width: '80px',
    height: '80px',
    flexShrink: 0,
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
    border: '1px solid #e5e7eb'
  },
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  productInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  productName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
    lineHeight: '1.4'
  },
  productMeta: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center'
  },
  productQuantity: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500'
  },
  productUnitPrice: {
    fontSize: '14px',
    color: '#9ca3af',
    fontWeight: '400'
  },
  productPrice: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#2563eb',
    flexShrink: 0
  },
  totalSection: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  subtotalCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    backgroundColor: '#eff6ff',
    borderRadius: '12px',
    border: '2px solid #dbeafe'
  },
  subtotalIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    backgroundColor: '#2563eb',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  subtotalContent: {
    flex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  subtotalLabel: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e40af'
  },
  subtotalValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e40af'
  },
  discountRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: '#f0fdf4',
    borderRadius: '10px',
    border: '1px solid #bbf7d0'
  },
  discountIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: '#16a34a',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  discountLabel: {
    flex: 1,
    fontSize: '15px',
    fontWeight: '500',
    color: '#166534'
  },
  discountValue: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#16a34a'
  },
  shippingCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    backgroundColor: '#fef3c7',
    borderRadius: '12px',
    border: '2px solid #fde68a'
  },
  shippingIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    backgroundColor: '#f59e0b',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  shippingContent: {
    flex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  shippingLabel: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#92400e'
  },
  shippingValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#92400e'
  },
  grandTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    marginTop: '8px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '2px solid #e5e7eb'
  },
  grandTotalLabel: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1f2937'
  },
  grandTotalValue: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#1f2937'
  }
};

