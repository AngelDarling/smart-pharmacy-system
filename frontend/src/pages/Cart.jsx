import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useCart from "../hooks/useCart";
import { getImageUrl, handleImageError } from "../utils/imageUtils";
import Swal from "sweetalert2";
import api from "../api/client.js";

// Biểu tượng thùng rác (Trash Icon)
const TrashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </svg>
);

export default function Cart() {
  const { items, remove, updateQty, clear } = useCart();
  const navigate = useNavigate();

  // State để quản lý các sản phẩm được chọn
  const [selectedItems, setSelectedItems] = useState(() => items.map(item => item.id));
  
  // State để lưu direct coupons cho mỗi sản phẩm
  const [directCoupons, setDirectCoupons] = useState({});

  // State để track các sản phẩm đang được kiểm tra stock
  const [checkingStock, setCheckingStock] = useState(new Set());

  // Cập nhật selectedItems khi items thay đổi
  useEffect(() => {
    setSelectedItems(items.map(item => item.id));
  }, [items]);

  // Fetch direct coupons cho các sản phẩm có giảm giá
  useEffect(() => {
    const fetchDirectCoupons = async () => {
      const couponsMap = {};
      
      // Lọc các sản phẩm có giảm giá và có slug
      const discountedItems = items.filter(item => 
        item.slug && 
        item.finalPrice !== undefined && 
        item.finalPrice < item.price && 
        (item.discount > 0 || item.originalPrice > item.finalPrice)
      );

      // Fetch coupon cho từng sản phẩm
      await Promise.all(
        discountedItems.map(async (item) => {
          try {
            const res = await api.get(`/coupons/direct-apply/${item.slug}`);
            if (res.data.success && res.data.coupon) {
              couponsMap[item.id] = res.data.coupon;
            }
          } catch (error) {
            // Ignore errors
          }
        })
      );

      setDirectCoupons(couponsMap);
    };

    if (items.length > 0) {
      fetchDirectCoupons();
    }
  }, [items]);

  // Tính toán tổng tiền chỉ dựa trên các sản phẩm đã được chọn
  const selectedTotal = useMemo(() => {
    return items
      .filter(item => selectedItems.includes(item.id))
      .reduce((total, item) => {
        // Sử dụng finalPrice nếu có, ngược lại dùng price
        const itemPrice = item.finalPrice !== undefined ? item.finalPrice : item.price;
        return total + itemPrice * item.qty;
      }, 0);
  }, [items, selectedItems]);

  // Xử lý thay đổi số lượng
  async function handleQtyChange(id, newQty) {
    if (newQty <= 0) {
      remove(id);
      // selectedItems sẽ được cập nhật tự động qua useEffect
      return;
    }

    // Tìm item trong giỏ hàng
    const item = items.find(i => i.id === id);
    if (!item) return;

    // Nếu đang tăng số lượng, kiểm tra stock từ database
    if (newQty > item.qty) {
      // Kiểm tra nếu đang kiểm tra stock cho sản phẩm này
      if (checkingStock.has(id)) {
        return; // Đang kiểm tra, không cho phép click thêm
      }

      // Chỉ kiểm tra stock nếu có slug
      if (!item.slug) {
        // Nếu không có slug, không thể kiểm tra stock, cho phép tăng (fallback)
        updateQty(id, newQty);
        return;
      }

      // Đánh dấu đang kiểm tra stock
      setCheckingStock(prev => new Set(prev).add(id));

      try {
        // Lấy thông tin stock mới nhất từ database bằng slug
        const res = await api.get(`/products/slug/${item.slug}`);
        const stock = res.data.totalStock || 0;

        // Kiểm tra nếu số lượng mới vượt quá stock
        if (newQty > stock) {
          Swal.fire({
            title: 'Không đủ hàng',
            text: `Sản phẩm "${item.name}" chỉ còn ${stock} sản phẩm trong kho.`,
            icon: 'warning',
            confirmButtonColor: '#3b82f6',
            confirmButtonText: 'Đóng'
          });
          // Giới hạn số lượng ở mức stock hiện có
          if (stock > 0) {
            updateQty(id, stock);
          }
          setCheckingStock(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
          });
          return;
        }

        // Xóa khỏi set checkingStock
        setCheckingStock(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      } catch (error) {
        console.error('Error fetching product stock:', error);
        // Nếu lỗi khi fetch stock, hiển thị thông báo và không cho phép tăng
        Swal.fire({
          title: 'Lỗi',
          text: 'Không thể kiểm tra số lượng tồn kho. Vui lòng thử lại sau.',
          icon: 'error',
          confirmButtonColor: '#3b82f6',
          confirmButtonText: 'Đóng'
        });
        // Xóa khỏi set checkingStock
        setCheckingStock(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        return;
      }
    }

    // Nếu giảm số lượng hoặc tăng nhưng không vượt quá stock, cập nhật bình thường
    updateQty(id, newQty);
  }

  // Xử lý xóa sản phẩm
  async function handleRemove(id) {
    const item = items.find(i => i.id === id);
    const result = await Swal.fire({
      title: 'Xóa sản phẩm?',
      text: `Bạn có chắc chắn muốn xóa "${item?.name || 'sản phẩm này'}" khỏi giỏ hàng?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      reverseButtons: true
    });
    
    if (result.isConfirmed) {
      remove(id);
      Swal.fire({
        title: 'Đã xóa!',
        text: 'Sản phẩm đã được xóa khỏi giỏ hàng.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    }
  }

  // Xử lý khi nhấn nút "Mua hàng"
  function handleCheckout() {
    if (selectedItems.length === 0) {
      Swal.fire({
        title: 'Chưa chọn sản phẩm',
        text: 'Vui lòng chọn ít nhất một sản phẩm để tiếp tục.',
        icon: 'warning',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }
    
    // Lưu selectedItems vào localStorage để Checkout có thể đọc
    localStorage.setItem('checkoutSelectedItems', JSON.stringify(selectedItems));
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

  // Xử lý khi click vào ảnh hoặc tên sản phẩm để chuyển đến trang chi tiết
  const handleProductClick = (item) => {
    if (item.slug) {
      navigate(`/p/${item.slug}`);
    }
  };

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: 1200, margin: "24px auto", padding: 16, textAlign: "center" }}>
        <img src="/empty-cart.png" alt="Giỏ hàng trống" style={{width: 150, height: 150, marginBottom: 5}} />
        <h3>Giỏ hàng của bạn còn trống</h3>
        <p style={{color: '#6b7280', marginBottom: 24}}>Hãy lựa chọn thêm sản phẩm để mua sắm nhé!</p>
        <button onClick={() => navigate('/')} style={styles.checkoutButton}>
          Về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div style={{...styles.pageContainer, marginTop: 'auto'}}>
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
            <button 
              onClick={async () => {
                const result = await Swal.fire({
                  title: 'Xóa tất cả sản phẩm?',
                  text: 'Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng?',
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonColor: '#ef4444',
                  cancelButtonColor: '#6b7280',
                  confirmButtonText: 'Xóa tất cả',
                  cancelButtonText: 'Hủy',
                  reverseButtons: true
                });
                
                if (result.isConfirmed) {
                  clear();
                  Swal.fire({
                    title: 'Đã xóa!',
                    text: 'Tất cả sản phẩm đã được xóa khỏi giỏ hàng.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                  });
                }
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Xóa tất cả
            </button>
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
                  <img 
                    src={getImageUrl(item.image, "/default-product.svg")} 
                    alt={item.name} 
                    style={{...styles.productImage, cursor: 'pointer'}}
                    onError={(e) => handleImageError(e, "/default-product.svg")}
                    onClick={() => handleProductClick(item)}
                  />
                  <div style={{ flex: 1 }}>
                    <div 
                      style={{...styles.productName, cursor: 'pointer'}}
                      onClick={() => handleProductClick(item)}
                    >
                      {item.name}
                    </div>
                    {/* Hiển thị thông tin mã giảm giá trực tiếp nếu có */}
                    {directCoupons[item.id] && (() => {
                      const coupon = directCoupons[item.id];
                      const formatPrice = (price) => {
                        return new Intl.NumberFormat('vi-VN').format(price);
                      };
                      return (
                        <div style={{
                          marginTop: 8,
                          padding: '8px 12px',
                          backgroundColor: '#fef3f2',
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8
                        }}>
                          <div style={{ flexShrink: 0 }}>
                            <img 
                              src={getImageUrl('/uploads/introduce/fast-delivery.png')}
                              alt="Mã giảm giá"
                              style={{
                                width: 24,
                                height: 24,
                                objectFit: 'contain'
                              }}
                              onError={(e) => {
                                // Fallback SVG icon nếu không load được ảnh
                                e.target.style.display = 'none';
                                const parent = e.target.parentElement;
                                if (parent && !parent.querySelector('svg')) {
                                  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                                  svg.setAttribute('width', '24');
                                  svg.setAttribute('height', '24');
                                  svg.setAttribute('viewBox', '0 0 24 24');
                                  svg.setAttribute('fill', 'none');
                                  svg.setAttribute('stroke', '#ef4444');
                                  svg.setAttribute('stroke-width', '2');
                                  svg.style.flexShrink = '0';
                                  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                                  path.setAttribute('d', 'M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM8 12h8');
                                  svg.appendChild(path);
                                  parent.appendChild(svg);
                                }
                              }}
                            />
                          </div>
                          <div style={{ flex: 1, fontSize: 12, color: '#1f2937', lineHeight: 1.4 }}>
                            {coupon.description || (
                              <>
                                Giảm ngay {coupon.discountType === 'percent' 
                                  ? `${coupon.discountValue}%` 
                                  : `${formatPrice(coupon.discountValue)}₫`}
                                {coupon.endDate && (
                                  <span style={{ color: '#6b7280' }}>
                                    {' '}áp dụng đến {new Date(coupon.endDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
                {/* Đơn giá */}
                <div style={styles.cellCenter}>
                  {item.finalPrice !== undefined && item.finalPrice < item.price && (item.discount > 0 || item.originalPrice > item.finalPrice) ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <span style={{ ...styles.price, color: '#3b82f6', fontWeight: 600 }}>
                        {item.finalPrice.toLocaleString('vi-VN')}₫
                      </span>
                      <span style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'line-through' }}>
                        {(item.originalPrice || item.price).toLocaleString('vi-VN')}₫
                      </span>
                    </div>
                  ) : (
                    <span style={styles.price}>{item.price.toLocaleString('vi-VN')}₫</span>
                  )}
                </div>
                {/* Số lượng */}
                <div style={styles.cellCenter}>
                  <div style={styles.quantityControl}>
                    <button 
                      onClick={() => handleQtyChange(item.id, item.qty - 1)} 
                      style={styles.quantityButton}
                      disabled={checkingStock.has(item.id)}
                    >
                      -
                    </button>
                    <input value={item.qty} style={styles.quantityInput} readOnly/>
                    <button 
                      onClick={() => handleQtyChange(item.id, item.qty + 1)} 
                      style={{
                        ...styles.quantityButton,
                        cursor: checkingStock.has(item.id) ? 'not-allowed' : 'pointer',
                        opacity: checkingStock.has(item.id) ? 0.6 : 1
                      }}
                      disabled={checkingStock.has(item.id)}
                    >
                      {checkingStock.has(item.id) ? '...' : '+'}
                    </button>
                  </div>
                </div>
                {/* Thành tiền */}
                <div style={{...styles.cellCenter, ...styles.totalPrice}}>
                  {(() => {
                    const hasDiscount = item.finalPrice !== undefined && item.finalPrice < item.price && (item.discount > 0 || item.originalPrice > item.finalPrice);
                    const itemPrice = hasDiscount ? item.finalPrice : item.price;
                    return (itemPrice * item.qty).toLocaleString('vi-VN') + '₫';
                  })()}
                </div>
                {/* Nút xóa */}
                <div style={styles.cellCenter}>
                  <button onClick={() => handleRemove(item.id)} style={styles.deleteButton}>
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