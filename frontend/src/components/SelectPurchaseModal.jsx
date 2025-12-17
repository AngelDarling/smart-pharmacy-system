import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useCart from "../hooks/useCart.js";
import { getImageUrl, handleImageError } from "../utils/imageUtils";
import api from "../api/client.js";

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price);
};

const formatDiscountAmount = (amount) => {
  if (amount >= 1000) {
    const thousands = amount / 1000;
    if (thousands % 1 === 0) {
      return `${thousands}K`;
    } else {
      return `${thousands.toFixed(1)}K`;
    }
  }
  return amount.toString();
};

const capitalizeFirstLetter = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Global function để trigger cart dropdown
window.showCartDropdown = null;

export default function SelectPurchaseModal({ product, open, onClose }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [directCoupon, setDirectCoupon] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(product?.price || 0);
  const [currentDiscount, setCurrentDiscount] = useState(0);
  const navigate = useNavigate();

  // Fetch coupon dynamically based on quantity
  useEffect(() => {
    if (!open || !product || !product.slug) return;

    const fetchCoupon = async () => {
      try {
        const orderTotal = product.price * qty;
        const res = await api.get(`/coupons/direct-apply/${product.slug}?orderTotal=${orderTotal}`);

        if (res.data.success && res.data.coupon) {
          const coupon = res.data.coupon;
          setDirectCoupon(coupon);

          // Calculate new price
          let discountAmount = 0;
          if (coupon.discountType === 'percent') {
            discountAmount = Math.round(product.price * coupon.discountValue / 100);
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
              discountAmount = coupon.maxDiscount;
            }
          } else {
            discountAmount = coupon.discountValue;
          }

          setCurrentPrice(product.price - discountAmount);
          setCurrentDiscount(coupon.discountValue);
        } else {
          setDirectCoupon(null);
          setCurrentPrice(product.price);
          setCurrentDiscount(0);
        }
      } catch (error) {
        setDirectCoupon(null);
        setCurrentPrice(product.price);
        setCurrentDiscount(0);
      }
    };

    fetchCoupon();
  }, [open, product, qty]);

  if (!open || !product) return null;

  function addToCart() {
    console.log('addToCart called:', { product: product._id, name: product.name, qty });

    // Create product with current price
    const productToAdd = {
      ...product,
      finalPrice: currentPrice,
      originalPrice: product.price,
      discount: currentDiscount,
      discountType: directCoupon?.discountType,
      discountValue: currentDiscount
    };

    add(productToAdd, qty);

    // Scroll lên đầu trang
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Hiển thị dropdown giỏ hàng
    if (window.showCartDropdown) {
      window.showCartDropdown();
    }

    // Đóng modal ngay lập tức sau khi thêm
    onClose?.();
  }

  function buyNow() {
    console.log('buyNow called:', { product: product._id, name: product.name, qty });

    // Create product with current price
    const productToAdd = {
      ...product,
      finalPrice: currentPrice,
      originalPrice: product.price,
      discount: currentDiscount,
      discountType: directCoupon?.discountType,
      discountValue: currentDiscount
    };

    add(productToAdd, qty);
    onClose?.();
    // Scroll to top before navigating
    window.scrollTo({ top: 0, behavior: 'instant' });
    navigate("/cart");
    // Ensure scroll at top after navigation
    setTimeout(() => {
      try { window.scrollTo({ top: 0, behavior: 'instant' }); } catch { }
    }, 0);
  }

  const hasDiscount = currentDiscount > 0;
  const displayPrice = currentPrice;
  const displayOriginalPrice = hasDiscount ? product.price : null;
  const unit = capitalizeFirstLetter(product.unit || 'cái');
  const maxQty = product.totalStock || 999;

  // Calculate totals
  const subtotal = displayPrice * qty;
  const savings = hasDiscount ? (displayOriginalPrice - displayPrice) * qty : 0;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: 20
    }}>
      <div style={{
        width: "100%",
        maxWidth: 800,
        background: "#fff",
        padding: 28,
        position: "relative",
        borderRadius: 16,
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
      }}>
        <button
          onClick={onClose}
          aria-label="Đóng"
          title="Đóng"
          style={{
            position: "absolute",
            right: 16,
            top: 16,
            border: "none",
            background: "transparent",
            fontSize: 28,
            cursor: "pointer",
            color: "#666",
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#f3f4f6";
            e.target.style.color = "#333";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "transparent";
            e.target.style.color = "#666";
          }}
        >
          ×
        </button>

        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
          {/* Product Image */}
          <div style={{
            width: 240,
            height: 240,
            flexShrink: 0,
            borderRadius: 12,
            overflow: "hidden",
            background: "#f8f9fa",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <img
              src={getImageUrl(product.imageUrls?.[0], "/default-product.svg")}
              alt={product.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                padding: 8
              }}
              onError={(e) => handleImageError(e, "/default-product.svg")}
            />
          </div>

          {/* Product Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Product Name */}
            <h2 style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#1f2937",
              margin: "0 0 12px 0",
              lineHeight: 1.4
            }}>
              {product.name}
            </h2>

            {/* Price Section */}
            <div style={{ marginBottom: 20 }}>
              {hasDiscount ? (
                <>
                  {/* Discount Badge */}
                  <div style={{ marginBottom: 8 }}>
                    <span style={{
                      display: "inline-block",
                      background: "#ef4444",
                      color: "white",
                      padding: "4px 10px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700
                    }}>
                      {directCoupon?.discountType === 'amount'
                        ? `-${formatDiscountAmount(directCoupon.discountValue)}`
                        : `-${currentDiscount}%`}
                    </span>
                  </div>

                  {/* Final Price */}
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                    <span style={{
                      color: "#3b82f6",
                      fontWeight: 700,
                      fontSize: 28
                    }}>
                      {formatPrice(displayPrice)}₫
                    </span>
                    <span style={{
                      fontSize: 16,
                      color: "#3b82f6",
                      fontWeight: 400
                    }}>
                      / {unit}
                    </span>
                  </div>

                  {/* Original Price */}
                  <div style={{ fontSize: 14, color: "#9ca3af", textDecoration: "line-through" }}>
                    {formatPrice(displayOriginalPrice)}₫
                  </div>
                </>
              ) : (
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{
                    color: "#3b82f6",
                    fontWeight: 700,
                    fontSize: 28
                  }}>
                    {formatPrice(displayPrice)}₫
                  </span>
                  <span style={{
                    fontSize: 16,
                    color: "#3b82f6",
                    fontWeight: 400
                  }}>
                    / {unit}
                  </span>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div style={{ marginBottom: 24 }}>
              <div style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#374151",
                marginBottom: 8
              }}>
                Số lượng
              </div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 12
              }}>
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  style={{
                    width: 40,
                    height: 40,
                    border: "1px solid #d1d5db",
                    background: qty <= 1 ? "#f3f4f6" : "white",
                    borderRadius: 8,
                    fontSize: 18,
                    fontWeight: 600,
                    color: qty <= 1 ? "#9ca3af" : "#374151",
                    cursor: qty <= 1 ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    if (qty > 1) {
                      e.target.style.borderColor = "#3b82f6";
                      e.target.style.color = "#3b82f6";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (qty > 1) {
                      e.target.style.borderColor = "#d1d5db";
                      e.target.style.color = "#374151";
                    }
                  }}
                >
                  −
                </button>
                <input
                  value={qty}
                  onChange={(e) => {
                    const value = Math.max(1, Math.min(maxQty, parseInt(e.target.value || 1, 10)));
                    setQty(value);
                  }}
                  style={{
                    width: 70,
                    height: 40,
                    textAlign: "center",
                    padding: "0 8px",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#374151"
                  }}
                />
                <button
                  onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                  disabled={qty >= maxQty}
                  style={{
                    width: 40,
                    height: 40,
                    border: "1px solid #d1d5db",
                    background: qty >= maxQty ? "#f3f4f6" : "white",
                    borderRadius: 8,
                    fontSize: 18,
                    fontWeight: 600,
                    color: qty >= maxQty ? "#9ca3af" : "#374151",
                    cursor: qty >= maxQty ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    if (qty < maxQty) {
                      e.target.style.borderColor = "#3b82f6";
                      e.target.style.color = "#3b82f6";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (qty < maxQty) {
                      e.target.style.borderColor = "#d1d5db";
                      e.target.style.color = "#374151";
                    }
                  }}
                >
                  +
                </button>
                {qty >= maxQty && (
                  <span style={{ fontSize: 12, color: "#ef4444", marginLeft: 8 }}>
                    Đã đạt tối đa
                  </span>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div style={{
              marginTop: 24,
              paddingTop: 20,
              borderTop: "1px solid #e5e7eb"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12
              }}>
                <span style={{
                  fontSize: 15,
                  color: "#6b7280",
                  fontWeight: 500
                }}>
                  Tạm tính
                </span>
                <span style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#1f2937"
                }}>
                  {formatPrice(subtotal)}₫
                </span>
              </div>

              {hasDiscount && savings > 0 && (
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <span style={{
                    fontSize: 15,
                    color: "#6b7280",
                    fontWeight: 500
                  }}>
                    Tiết kiệm được
                  </span>
                  <span style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#10b981"
                  }}>
                    {formatPrice(savings)}₫
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button
                onClick={buyNow}
                style={{
                  flex: 1,
                  padding: "14px 24px",
                  background: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => e.target.style.background = "#2563eb"}
                onMouseLeave={(e) => e.target.style.background = "#3b82f6"}
              >
                Mua ngay
              </button>
              <button
                onClick={addToCart}
                style={{
                  flex: 1,
                  padding: "14px 24px",
                  background: "white",
                  color: "#3b82f6",
                  border: "2px solid #3b82f6",
                  borderRadius: 10,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#eff6ff";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "white";
                }}
              >
                Thêm vào giỏ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


