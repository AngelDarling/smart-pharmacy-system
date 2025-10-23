import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';

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

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: 20 }}>Theo dõi đơn hàng</h1>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
        <input
          value={code}
          onChange={(e)=>{ setCode(e.target.value.toUpperCase()); setSearchParams({ code: e.target.value.toUpperCase() }); }}
          placeholder="Nhập mã đơn hàng (ví dụ: ORD123456)"
          style={{ width: 360, padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: 8 }}
        />
        <button onClick={()=> lookup(code)} disabled={!code || loading} style={{ padding: '12px 16px', borderRadius: 8, border: 'none', background: '#2563eb', color: 'white', fontWeight: 600 }}>
          {loading ? 'Đang tra cứu...' : 'Tra cứu'}
        </button>
      </div>

      {error && <div style={{ textAlign:'center', color:'#dc2626', marginTop: 8 }}>{error}</div>}

      {order && (
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ color:'#6b7280' }}>Mã đơn</div>
              <div style={{ fontWeight:700 }}>{order.code}</div>
            </div>
            <div>
              <div style={{ color:'#6b7280' }}>Trạng thái</div>
              <div style={{ fontWeight:700, textTransform:'capitalize' }}>{order.status}</div>
            </div>
            <div>
              <div style={{ color:'#6b7280' }}>Thời gian đặt</div>
              <div style={{ fontWeight:700 }}>{new Date(order.createdAt).toLocaleString('vi-VN')}</div>
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            <div style={{ fontWeight:600, marginBottom: 8 }}>Sản phẩm</div>
            {(order.items||[]).map((it, idx)=> (
              <div key={idx} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #f3f4f6' }}>
                <div>{it.nameSnapshot}</div>
                <div>x{it.quantity}</div>
                <div>{(it.priceSnapshot||0).toLocaleString('vi-VN')}₫</div>
              </div>
            ))}
          </div>

          <div style={{ textAlign:'right', marginTop: 12, fontWeight:700 }}>Tổng tiền: {(order.totals?.grand||0).toLocaleString('vi-VN')}₫</div>
        </div>
      )}
    </div>
  );
}


