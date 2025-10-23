import { Link, useLocation } from 'react-router-dom';

export default function OrderSuccess() {
  const location = useLocation();
  const code = location.state?.code;
  return (
    <div style={{ maxWidth: 900, margin: '60px auto', padding: '0 20px' }}>
      <div style={{ background:'white', border:'1px solid #e5e7eb', borderRadius:16, padding:'40px 20px', textAlign:'center', boxShadow:'0 10px 25px rgba(0,0,0,0.05)' }}>
        <div style={{ fontSize: 72, marginBottom: 12 }}>✅</div>
        <h1 style={{ margin: 0, fontSize: 32 }}>Đặt hàng thành công!</h1>
        {code && <p style={{ color: '#374151', marginTop: 8 }}>Mã đơn hàng: <strong>{code}</strong></p>}
        <p style={{ color: '#6b7280', marginTop: 8 }}>Cảm ơn bạn đã mua sắm tại Smart Pharmacy. Chúng tôi sẽ liên hệ để giao hàng trong thời gian sớm nhất.</p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', marginTop:24 }}>
          <Link to="/" style={{ background: '#2563eb', color: 'white', padding: '12px 20px', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>Về trang chủ</Link>
          {code && (
            <a href={`/track-order?code=${encodeURIComponent(code)}`} target="_blank" rel="noopener noreferrer" style={{ background: '#10b981', color: 'white', padding: '12px 20px', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>
              Theo dõi đơn hàng
            </a>
          )}
        </div>
      </div>
    </div>
  );
}


