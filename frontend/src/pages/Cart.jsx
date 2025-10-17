import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useCart from "../hooks/useCart";

// Biểu tượng thùng rác (Trash Icon)
const TrashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </svg>
);

export default function Cart() {
  const { items, remove, updateQty } = useCart();
  const navigate = useNavigate();

  // State để quản lý các sản phẩm được chọn
  const [selectedItems, setSelectedItems] = useState(() => items.map(item => item.id));

  // Tính toán tổng tiền chỉ dựa trên các sản phẩm đã được chọn
  const selectedTotal = useMemo(() => {
    return items
      .filter(item => selectedItems.includes(item.id))
      .reduce((total, item) => total + item.price * item.qty, 0);
  }, [items, selectedItems]);

  // Xử lý thay đổi số lượng
  function handleQtyChange(id, newQty) {
    if (newQty <= 0) {
      remove(id);
      setSelectedItems(prev => prev.filter(itemId => itemId !== id));
    } else {
      updateQty(id, newQty);
    }
  }

  // Xử lý khi nhấn nút "Mua hàng"
  function handleCheckout() {
    console.log("Checkout with selected items:", selectedItems);
    navigate("/checkout");
  }
  
  // Xử lý chọn/bỏ chọn một sản phẩm
  const handleSelectItem = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  // Xử lý chọn/bỏ chọn tất cả
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(items.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const isAllSelected = selectedItems.length === items.length && items.length > 0;

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: 1200, margin: "24px auto", padding: 16, textAlign: "center" }}>
        <img src="/empty-cart.svg" alt="Giỏ hàng trống" style={{width: 200, height: 200, marginBottom: 24}} />
        <h3>Giỏ hàng của bạn còn trống</h3>
        <p style={{color: '#6b7280', marginBottom: 24}}>Hãy lựa chọn thêm sản phẩm để mua sắm nhé!</p>
        <button onClick={() => navigate('/')} style={styles.checkoutButton}>
          Về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <div style={{ marginBottom: 16 }}>
        <a href="/" style={styles.continueLink}>← Tiếp tục mua sắm</a>
      </div>

      <div style={styles.banner}>
        Miễn phí vận chuyển đối với đơn hàng trên 300.000₫
      </div>

      <div style={styles.cartLayout}>
        {/* Cột bên trái: Danh sách sản phẩm */}
        <div style={styles.productListContainer}>
          <div style={styles.cartHeader}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
              <input 
                type="checkbox" 
                checked={isAllSelected}
                onChange={handleSelectAll}
                style={{width: 18, height: 18}}
              />
              <span>Chọn tất cả ({items.length} sản phẩm)</span>
            </div>
          </div>
          
          <div style={{backgroundColor: 'white', borderRadius: '0 0 8px 8px'}}>
            {/* *** DÒNG TIÊU ĐỀ MỚI THÊM VÀO *** */}
            <div style={styles.gridHeader}>
                <div style={{...styles.headerCell, gridColumn: 'span 2'}}>Sản phẩm</div>
                <div style={styles.headerCell}>Đơn giá</div>
                <div style={styles.headerCell}>Số lượng</div>
                <div style={styles.headerCell}>Thành tiền</div>
                <div style={styles.headerCell}></div>
            </div>

            {/* List các sản phẩm */}
            {items.map(item => (
              <div key={item.id} style={styles.productItem}>
                {/* Checkbox */}
                <div style={styles.cellCenter}>
                   <input 
                     type="checkbox" 
                     checked={selectedItems.includes(item.id)}
                     onChange={() => handleSelectItem(item.id)}
                     style={{width: 18, height: 18}}
                   />
                </div>
                {/* Thông tin sản phẩm */}
                <div style={styles.productInfo}>
                  <img src={item.image || "/default-product.svg"} alt={item.name} style={styles.productImage} />
                  <div>
                    <div style={styles.productName}>{item.name}</div>
                  </div>
                </div>
                {/* Đơn giá */}
                <div style={styles.cellCenter}>
                   <span style={styles.price}>{item.price.toLocaleString('vi-VN')}₫</span>
                </div>
                {/* Số lượng */}
                <div style={styles.cellCenter}>
                  <div style={styles.quantityControl}>
                    <button onClick={() => handleQtyChange(item.id, item.qty - 1)} style={styles.quantityButton}>-</button>
                    <input value={item.qty} style={styles.quantityInput} readOnly/>
                    <button onClick={() => handleQtyChange(item.id, item.qty + 1)} style={styles.quantityButton}>+</button>
                  </div>
                </div>
                {/* Thành tiền */}
                <div style={{...styles.cellCenter, ...styles.totalPrice}}>
                  {(item.price * item.qty).toLocaleString('vi-VN')}₫
                </div>
                {/* Nút xóa */}
                <div style={styles.cellCenter}>
                  <button onClick={() => remove(item.id)} style={styles.deleteButton}>
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cột bên phải: Tóm tắt đơn hàng */}
        <div style={styles.summaryContainer}>
          <div style={styles.summaryCard}>
             <div style={styles.summaryRow}>
               <span>Tạm tính</span>
               <span>{selectedTotal.toLocaleString('vi-VN')}₫</span>
             </div>
             <div style={styles.summaryRow}>
               <span>Giảm giá</span>
               <span>0₫</span>
             </div>
             <div style={{borderTop: '1px dashed #e5e7eb', margin: '12px 0'}}></div>
             <div style={{...styles.summaryRow, fontWeight: 'bold', fontSize: 18}}>
               <span>Tổng cộng</span>
               <span style={{color: '#d92d20'}}>{selectedTotal.toLocaleString('vi-VN')}₫</span>
             </div>
            <button onClick={handleCheckout} style={styles.checkoutButton} disabled={selectedItems.length === 0}>
              Mua hàng ({selectedItems.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tập hợp các style để dễ quản lý
const styles = {
  pageContainer: {
    maxWidth: 1200,
    margin: '24px auto',
    padding: '0 16px',
    fontFamily: 'Inter, sans-serif',
    backgroundColor: '#f6f7f9' // Thêm màu nền cho toàn trang
  },
  continueLink: {
    color: '#0037c1',
    textDecoration: 'none',
    fontWeight: 500
  },
  banner: {
    background: '#e0f2fe',
    color: '#0c4a6e',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: 500
  },
  cartLayout: {
    display: 'flex',
    flexDirection: 'row',
    gap: 24,
    alignItems: 'flex-start'
  },
  productListContainer: {
    flex: 1,
  },
  cartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: 'white',
    borderBottom: '1px solid #f0f0f0',
    borderRadius: '8px 8px 0 0',
    fontWeight: 500
  },
  deleteAllButton: {
    background: 'none',
    border: 'none',
    color: '#6b7280',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 4
  },
  // *** STYLE CHO DÒNG TIÊU ĐỀ ***
  gridHeader: {
    display: 'grid',
    gridTemplateColumns: '50px 2fr 1fr 1fr 1fr 50px',
    padding: '12px 16px',
    backgroundColor: '#f8f9fa',
    color: '#6b7280',
    fontSize: 13,
    fontWeight: 500,
    borderBottom: '1px solid #f0f0f0'
  },
  headerCell: {
    textAlign: 'center'
  },
  productItem: {
    display: 'grid',
    gridTemplateColumns: '50px 2fr 1fr 1.2fr 1fr 50px', // Điều chỉnh lại độ rộng cột số lượng
    alignItems: 'center',
    padding: '16px',
    borderBottom: '1px solid #f0f0f0'
  },
  cellCenter: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center'
  },
  productInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    textAlign: 'left' // Chữ tên sản phẩm căn trái
  },
  productImage: {
    width: 64,
    height: 64,
    objectFit: 'cover',
    borderRadius: 8,
    border: '1px solid #e5e7eb'
  },
  productName: {
    fontWeight: 600,
    fontSize: 14,
    lineHeight: 1.4
  },
  price: {
    fontSize: 14,
  },
  totalPrice: {
    fontWeight: 'bold',
    color: '#0037c1',
    fontSize: 15
  },
  quantityControl: {
    display: 'flex',
    alignItems: 'center', // Căn giữa các item theo chiều dọc
    border: '1px solid #d1d5db',
    borderRadius: 6
  },
  quantityButton: {
    width: 28,
    height: 28,
    border: 'none',
    backgroundColor: '#fff', // Đảm bảo nền trắng
    color: '#374151',
    cursor: 'pointer',
    fontSize: 16,
    padding: 0, // Reset padding
    display: 'flex', // Sử dụng flex để căn giữa
    alignItems: 'center',
    justifyContent: 'center',
    // Thêm bo tròn cho nút đầu và cuối
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5
  },
  quantityButtonPlus: { // Style riêng cho nút + để bo tròn góc phải
    width: 28,
    height: 28,
    border: 'none',
    backgroundColor: '#fff',
    color: '#374151',
    cursor: 'pointer',
    fontSize: 16,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5
  },
  quantityInput: {
    width: 40, // Tăng nhẹ độ rộng
    height: 28,
    textAlign: 'center',
    border: 'none',
    borderLeft: '1px solid #d1d5db',
    borderRight: '1px solid #d1d5db',
    fontSize: 14,
    padding: '0 4px', // Thêm padding ngang, bỏ padding dọc
    boxSizing: 'border-box', // Chìa khóa để sửa lỗi!
    backgroundColor: '#fff',
    color: '#000',
    outline: 'none' // Bỏ viền xanh khi click
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer'
  },
  summaryContainer: {
    width: 350,
    position: 'sticky',
    top: 20
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 12,
    fontSize: 14
  },
  checkoutButton: {
    width: '100%',
    padding: '12px 24px',
    fontSize: 16,
    background: '#d92d20',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  }
};