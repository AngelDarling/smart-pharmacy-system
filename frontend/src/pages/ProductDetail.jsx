import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client.js";
import useCart from "../hooks/useCart.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import { getImageUrl, handleImageError } from "../utils/imageUtils";
import Swal from "sweetalert2";

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [categoryBreadcrumb, setCategoryBreadcrumb] = useState([]);
  const [activeTab, setActiveTab] = useState('description');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: "",
    guestName: "",
    guestEmail: "",
    guestPhone: ""
  });
  const { add } = useCart();
  const { user } = useAuth();

  // Load reviews and rating
  const loadReviews = async (productId) => {
    try {
      const [reviewsRes, ratingRes] = await Promise.all([
        api.get(`/reviews/product/${productId}?limit=50`),
        api.get(`/reviews/product/${productId}/rating`)
      ]);
      setReviews(reviewsRes.data.items || []);
      setAverageRating(ratingRes.data.averageRating || 0);
      setTotalReviews(ratingRes.data.totalReviews || 0);
      setRatingDistribution(ratingRes.data.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviews([]);
      setAverageRating(0);
      setTotalReviews(0);
    }
  };

  useEffect(() => {
    // Scroll to top when product changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Fetch product details
    api.get(`/products/slug/${slug}`).then((res) => {
      setProduct(res.data);
      setSelectedImage(0);
      setQuantity(1); // Reset quantity to 1
      
      // Load reviews and rating
      if (res.data._id) {
        loadReviews(res.data._id);
      }
      
      // Build category breadcrumb
      if (res.data.categoryId) {
        buildCategoryBreadcrumb(res.data.categoryId);
        
        // Fetch related products (same category)
        const categorySlug = res.data.categoryId.slug || res.data.categorySlug;
        if (categorySlug) {
          api.get(`/products?category=${categorySlug}&limit=8`).then((relRes) => {
            const related = (relRes.data.items || []).filter(p => p._id !== res.data._id).slice(0, 6);
            setRelatedProducts(related);
          });
        }
      } else {
        setCategoryBreadcrumb([]);
      }
    });
  }, [slug]);

  const buildCategoryBreadcrumb = async (category) => {
    try {
      console.log('Building breadcrumb for category:', category);
      // Fetch full category tree to build breadcrumb
      const res = await api.get('/categories/tree');
      const categories = res.data || [];
      console.log('Category tree:', categories);
      
      // Find category and its parents
      const breadcrumb = [];
      const findCategoryPath = (cats, targetId, path = []) => {
        for (const cat of cats) {
          if (cat._id === targetId) {
            breadcrumb.push(...path, cat);
            console.log('Found category path:', breadcrumb);
            return true;
          }
          if (cat.children && cat.children.length > 0) {
            if (findCategoryPath(cat.children, targetId, [...path, cat])) {
              return true;
            }
          }
        }
        return false;
      };
      
      const found = findCategoryPath(categories, category._id);
      console.log('Category found:', found, 'Breadcrumb:', breadcrumb);
      setCategoryBreadcrumb(breadcrumb);
    } catch (error) {
      console.error('Error building breadcrumb:', error);
      // Fallback to just the current category
      setCategoryBreadcrumb([category]);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const handleAddToCart = () => {
    add(product, quantity);
    // Scroll to top to show cart dropdown
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.showCartDropdown) {
      window.showCartDropdown();
    }
  };

  if (!product) {
    return (
      <div style={{ 
        minHeight: '50vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: 18,
        color: '#6b7280'
      }}>
        Đang tải...
      </div>
    );
  }

  const images = product.imageUrls && product.imageUrls.length > 0 
    ? product.imageUrls 
    : ['/default-product.svg'];

  // Mock FAQs (có thể thay bằng data từ database)
  const faqs = [
    {
      question: `${product.name} phù hợp với loại da nào?`,
      answer: product.attributes?.skinType || 'Sản phẩm này được thiết kế đặc biệt cho làn da bị mụn. Tuy nhiên, với các thành phần nhẹ nhàng và tự nhiên, nó có thể thích hợp cho mọi loại da.'
    },
    {
      question: `Thành phần chính có từ gạo và diếp cá trong ${product.name} có gì đặc biệt?`,
      answer: 'Gạo và diếp cá là hai thành phần tự nhiên mà đã được sử dụng từ lâu trong việc cải thiện độ mịn màng và sáng của da. Gạo, thông qua quá trình chiết xuất, cung cấp nhiều vitamin và khoáng chất giúp làm mềm và nuôi dưỡng làn da. Diếp cá tiên phong trong việc giảm viêm và ngăn ngừa mụn.'
    },
    {
      question: `${product.name} có gây khô da không?`,
      answer: `${product.name} có khả năng làm sạch sâu nhưng không gây khô da. Điều này là nhờ vào chiết xuất từ gạo, giúp cung cấp độ ẩm và làm mềm da.`
    },
    {
      question: `${product.name} có thể sử dụng với các sản phẩm chăm sóc da khác không?`,
      answer: `${product.name} có thể sử dụng với các sản phẩm chăm sóc da khác. Bạn chỉ cần đảm bảo rửa sạch mặt sau khi sử dụng, sau đó có thể áp dụng các sản phẩm khác như toner, serum, hoặc kem dưỡng.`
    },
    {
      question: `Có nên sử dụng ${product.name} mỗi ngày không?`,
      answer: 'Có, bạn có thể sử dụng sản phẩm này mỗi ngày, cả buổi sáng và buổi tối để đạt hiệu quả tốt nhất trong việc làm sạch và cải thiện làn da của bạn.'
    }
  ];

  // Format date helper
  const formatReviewDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 30) return `${diffDays} ngày trước`;
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} tháng trước`;
    }
    const years = Math.floor(diffDays / 365);
    return `${years} năm trước`;
  };

  // Get user display name from review
  const getReviewerName = (review) => {
    if (review.userId) {
      return review.userId.fullName || review.userId.name || 'Người dùng';
    }
    return review.guestName || 'Khách';
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', paddingBottom: 40, marginTop: 'auto' }}>
      {/* Breadcrumb */}
      <div style={{ background: 'white', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#6b7280', flexWrap: 'wrap' }}>
            <Link to="/" style={{ color: '#3b82f6', textDecoration: 'none' }}>Trang chủ</Link>
            {categoryBreadcrumb.length > 0 && (
              <>
                {categoryBreadcrumb.map((cat) => (
                  <React.Fragment key={cat._id}>
                    <span>/</span>
                    <Link 
                      to={`/catalog?category=${cat.slug}`} 
                      style={{ 
                        color: '#3b82f6', 
                        textDecoration: 'none' 
                      }}
                    >
                      {cat.name}
                    </Link>
                  </React.Fragment>
                ))}
              </>
            )}
            <span>/</span>
            <span style={{ color: '#1f2937', fontWeight: 600 }}>{product.name}</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
        {/* Main Product Section */}
        <div style={{ 
          background: 'white', 
          borderRadius: 12, 
          padding: 30, 
          marginBottom: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', gap: 40 }}>
            {/* Product Images */}
            <div style={{ width: 450, flexShrink: 0 }}>
              {/* Main Image */}
              <div style={{ 
                width: '100%', 
                height: 450, 
                background: 'white',
                borderRadius: 12,
                overflow: 'hidden',
                marginBottom: 16,
                border: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img
                  src={getImageUrl(images[selectedImage], '/default-product.svg')}
                  alt={product.name}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                  onError={(e) => handleImageError(e, '/default-product.svg')}
                />
              </div>
              
              {/* Thumbnail Images */}
              {images.length > 1 && (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {images.map((img, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      style={{
                        width: 90,
                        height: 90,
                        background: 'white',
                        borderRadius: 8,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: selectedImage === index ? '3px solid #3b82f6' : '1px solid #e5e7eb',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedImage !== index) {
                          e.currentTarget.style.borderColor = '#3b82f6';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedImage !== index) {
                          e.currentTarget.style.borderColor = '#e5e7eb';
                        }
                      }}
                    >
                      <img
                        src={getImageUrl(img, '/default-product.svg')}
                        alt={`${product.name} ${index + 1}`}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain'
                        }}
                        onError={(e) => handleImageError(e, '/default-product.svg')}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div style={{ flex: 1 }}>
              <h1 style={{ 
                margin: '0 0 16px', 
                fontSize: 28, 
                fontWeight: 700, 
                color: '#1f2937',
                lineHeight: 1.3
              }}>
                {product.name}
              </h1>

              {/* Rating & Stock */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 16, 
                marginBottom: 20,
                paddingBottom: 20,
                borderBottom: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {[1, 2, 3, 4, 5].map(star => {
                      const filled = averageRating >= star;
                      const halfFilled = averageRating >= star - 0.5 && averageRating < star;
                      return (
                        <span key={star} style={{ fontSize: 18, lineHeight: 1 }}>
                          {filled ? (
                            <span style={{ color: '#fbbf24' }}>★</span>
                          ) : halfFilled ? (
                            <span style={{ color: '#fbbf24', opacity: 0.5 }}>★</span>
                          ) : (
                            <span style={{ color: '#d1d5db' }}>☆</span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                  {averageRating > 0 && (
                    <span style={{ fontSize: 14, color: '#6b7280', fontWeight: 600 }}>
                      {averageRating.toFixed(1)}
                    </span>
                  )}
                  <span style={{ fontSize: 14, color: '#6b7280' }}>
                    ({totalReviews} đánh giá)
                  </span>
                </div>
                <span style={{ color: '#d1d5db' }}>|</span>
                <div style={{ 
                  fontSize: 14, 
                  color: product.totalStock > 0 ? '#059669' : '#dc2626',
                  fontWeight: 600
                }}>
                  {product.totalStock > 0 ? `Còn hàng (${product.totalStock})` : 'Hết hàng'}
                </div>
              </div>

              {/* Price */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ 
                  fontSize: 36, 
                  fontWeight: 700, 
                  color: '#dc2626',
                  marginBottom: 8
                }}>
                  {formatPrice(product.price)}₫
                  <span style={{ fontSize: 18, color: '#6b7280', fontWeight: 400, marginLeft: 8 }}>
                    / {product.unit || 'Hộp'}
                  </span>
                </div>
                {product.discount > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ 
                      fontSize: 20, 
                      color: '#9ca3af', 
                      textDecoration: 'line-through' 
                    }}>
                      {formatPrice(Math.round(product.price / (1 - product.discount / 100)))}₫
                    </span>
                    <span style={{ 
                      background: '#dc2626', 
                      color: 'white', 
                      padding: '6px 14px', 
                      borderRadius: 20,
                      fontSize: 14,
                      fontWeight: 600
                    }}>
                      -{product.discount}%
                    </span>
                  </div>
                )}
              </div>

              {/* Product Specs */}
              <div style={{ 
                background: '#f8f9fa', 
                borderRadius: 8,
                padding: 20,
                marginBottom: 24
              }}>
                <h3 style={{ 
                  fontSize: 18, 
                  fontWeight: 600, 
                  color: '#1f2937',
                  marginBottom: 16,
                  marginTop: 0
                }}>
                  Thông số kỹ thuật
                </h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '140px 1fr',
                  gap: '12px 20px',
                  fontSize: 15,
                  color: '#374151'
                }}>
                  <div style={{ fontWeight: 600 }}>Mã sản phẩm:</div>
                  <div>{product.sku || 'N/A'}</div>
                  
                  <div style={{ fontWeight: 600 }}>Thương hiệu:</div>
                  <div>{product.brandId?.name || 'N/A'}</div>
                  
                  <div style={{ fontWeight: 600 }}>Danh mục:</div>
                  <div>{product.categoryId?.name || 'N/A'}</div>
                  
                  <div style={{ fontWeight: 600 }}>Đơn vị:</div>
                  <div>{product.unit || 'Hộp'}</div>

                  {product.barcode && (
                    <>
                      <div style={{ fontWeight: 600 }}>Mã vạch:</div>
                      <div>{product.barcode}</div>
                    </>
                  )}
                </div>
              </div>

              {/* Quantity & Add to Cart */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: 12, fontWeight: 600, color: '#374151' }}>Số lượng:</span>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: 8 }}>
                    <button
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      disabled={quantity <= 1}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '10px 16px',
                        cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                        fontSize: 18,
                        color: quantity <= 1 ? '#d1d5db' : '#374151',
                        fontWeight: 600
                      }}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value || '1', 10);
                        const maxStock = product.totalStock || 0;
                        setQuantity(Math.max(1, Math.min(value, maxStock)));
                      }}
                      min="1"
                      max={product.totalStock || 1}
                      style={{
                        width: 60,
                        textAlign: 'center',
                        border: 'none',
                        outline: 'none',
                        fontSize: 16,
                        color: '#1f2937',
                        fontWeight: 600
                      }}
                    />
                    <button
                      onClick={() => setQuantity(prev => Math.min(prev + 1, product.totalStock || 1))}
                      disabled={quantity >= (product.totalStock || 0)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '10px 16px',
                        cursor: quantity >= (product.totalStock || 0) ? 'not-allowed' : 'pointer',
                        fontSize: 18,
                        color: quantity >= (product.totalStock || 0) ? '#d1d5db' : '#374151',
                        fontWeight: 600
                      }}
                    >
                      +
                    </button>
                  </div>
                  {quantity >= (product.totalStock || 0) && product.totalStock > 0 && (
                    <span style={{ 
                      fontSize: 13, 
                      color: '#dc2626',
                      marginLeft: 8
                    }}>
                      (Đã đạt tối đa)
                    </span>
                  )}
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!product.totalStock || product.totalStock <= 0}
                  style={{
                    flex: 1,
                    background: product.totalStock > 0 ? '#3b82f6' : '#9ca3af',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    padding: '14px 24px',
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: product.totalStock > 0 ? 'pointer' : 'not-allowed',
                    transition: 'background-color 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                  onMouseEnter={(e) => {
                    if (product.totalStock > 0) {
                      e.target.style.background = '#2563eb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (product.totalStock > 0) {
                      e.target.style.background = '#3b82f6';
                    }
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 2L9 6M15 2L15 6M6 8L18 8M6 12L18 12M4 6C4 5.44772 4.44772 5 5 5H19C19.5523 5 20 5.44772 20 6V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V6Z"/>
                  </svg>
                  Thêm vào giỏ hàng
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div style={{ 
          background: 'white', 
          borderRadius: 12, 
          marginBottom: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          {/* Tabs Header */}
          <div style={{ 
            display: 'flex', 
            borderBottom: '2px solid #f3f4f6',
            overflowX: 'auto'
          }}>
            {[
              { key: 'description', label: 'Mô tả sản phẩm' },
              { key: 'usage', label: 'Cách sử dụng' },
              { key: 'storage', label: 'Bảo quản' },
              { key: 'ingredients', label: 'Thành phần' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '18px 28px',
                  cursor: 'pointer',
                  fontSize: 15,
                  fontWeight: 600,
                  color: activeTab === tab.key ? '#3b82f6' : '#6b7280',
                  borderBottom: activeTab === tab.key ? '3px solid #3b82f6' : '3px solid transparent',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.key) {
                    e.target.style.color = '#374151';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.key) {
                    e.target.style.color = '#6b7280';
                  }
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ padding: 30, fontSize: 15, color: '#374151', lineHeight: 1.8 }}>
            {activeTab === 'description' && (
              <div>
                {product.description || 'Sản phẩm đang cập nhật mô tả chi tiết.'}
              </div>
            )}
            {activeTab === 'usage' && (
              <div>
                {product.attributes?.usage || product.usage || 'Vui lòng tham khảo hướng dẫn sử dụng trên bao bì sản phẩm hoặc tư vấn dược sĩ.'}
              </div>
            )}
            {activeTab === 'storage' && (
              <div>
                {product.attributes?.storage || 'Bảo quản nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp. Để xa tầm tay trẻ em.'}
              </div>
            )}
            {activeTab === 'ingredients' && (
              <div>
                {product.ingredients || product.attributes?.ingredients || 'Đang cập nhật thông tin thành phần.'}
              </div>
            )}
          </div>
        </div>

        {/* FAQs Section */}
        <div style={{ 
          background: 'white', 
          borderRadius: 12, 
          padding: 30,
          marginBottom: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            fontSize: 24, 
            fontWeight: 700, 
            color: '#1f2937',
            marginBottom: 24,
            marginTop: 0
          }}>
            Câu hỏi thường gặp
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {faqs.map((faq, index) => (
              <div 
                key={index}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  overflow: 'hidden',
                  transition: 'all 0.2s'
                }}
              >
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  style={{
                    width: '100%',
                    background: expandedFAQ === index ? '#f8f9fa' : 'white',
                    border: 'none',
                    padding: '18px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: 15,
                    fontWeight: 600,
                    color: '#1f2937',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (expandedFAQ !== index) {
                      e.currentTarget.style.background = '#f8f9fa';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (expandedFAQ !== index) {
                      e.currentTarget.style.background = 'white';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: '#3b82f6',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 700,
                      flexShrink: 0
                    }}>
                      ?
                    </div>
                    <span>{faq.question}</span>
                  </div>
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                    style={{
                      transform: expandedFAQ === index ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                      flexShrink: 0
                    }}
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {expandedFAQ === index && (
                  <div style={{
                    padding: '0 20px 20px 56px',
                    fontSize: 15,
                    color: '#6b7280',
                    lineHeight: 1.7,
                    background: '#f8f9fa'
                  }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Reviews Section */}
        <div style={{ 
          background: 'white', 
          borderRadius: 12, 
          padding: 30,
          marginBottom: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: 24
          }}>
            <h2 style={{ 
              fontSize: 24, 
              fontWeight: 700, 
              color: '#1f2937',
              margin: 0
            }}>
              Đánh giá sản phẩm
              <span style={{ color: '#6b7280', fontWeight: 400, fontSize: 18, marginLeft: 8 }}>
                ({totalReviews} đánh giá)
              </span>
            </h2>
            <button
              onClick={() => setShowReviewModal(true)}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '12px 24px',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#2563eb'}
              onMouseLeave={(e) => e.target.style.background = '#3b82f6'}
            >
              Gửi đánh giá
            </button>
          </div>

          {/* Rating Summary */}
          <div style={{ 
            background: '#f8f9fa', 
            borderRadius: 8, 
            padding: 24,
            marginBottom: 24
          }}>
            <div style={{ display: 'flex', gap: 40 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: 48, 
                  fontWeight: 700, 
                  color: '#1f2937',
                  lineHeight: 1
                }}>
                  {averageRating.toFixed(1)}
                  <svg 
                    width="40" 
                    height="40" 
                    viewBox="0 0 20 20" 
                    fill="#fbbf24"
                    style={{ marginLeft: 8, verticalAlign: 'middle' }}
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div style={{ color: '#6b7280', fontSize: 14, marginTop: 8 }}>
                  Trung bình
                </div>
              </div>
              <div style={{ flex: 1 }}>
                {[5, 4, 3, 2, 1].map(star => {
                  const count = ratingDistribution[star] || 0;
                  const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  return (
                    <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {[...Array(star)].map((_, i) => (
                          <svg key={i} width="16" height="16" viewBox="0 0 20 20" fill="#fbbf24">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <div style={{ flex: 1, height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${percentage}%`, 
                          height: '100%', 
                          background: '#fbbf24',
                          transition: 'width 0.3s'
                        }} />
                      </div>
                      <span style={{ fontSize: 14, color: '#6b7280', width: 30, textAlign: 'right' }}>
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {reviews.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px',
                color: '#6b7280'
              }}>
                Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!
              </div>
            ) : (
              reviews.map(review => (
                <div key={review._id} style={{ 
                  paddingBottom: 20, 
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      fontWeight: 700,
                      flexShrink: 0
                    }}>
                      {getInitials(getReviewerName(review))}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 12, 
                        marginBottom: 8 
                      }}>
                        <span style={{ fontWeight: 600, color: '#1f2937', fontSize: 16 }}>
                          {getReviewerName(review)}
                        </span>
                        <div style={{ display: 'flex', gap: 2 }}>
                          {[...Array(review.rating)].map((_, i) => (
                            <svg key={i} width="16" height="16" viewBox="0 0 20 20" fill="#fbbf24">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span style={{ fontSize: 14, color: '#9ca3af' }}>
                          {formatReviewDate(review.createdAt)}
                        </span>
                      </div>
                      <p style={{ 
                        margin: 0, 
                        color: '#374151', 
                        fontSize: 15,
                        lineHeight: 1.6,
                        marginBottom: review.adminReply ? 12 : 0
                      }}>
                        {review.comment}
                      </p>
                      {review.adminReply && (
                        <div style={{
                          marginTop: 12,
                          padding: 12,
                          background: '#f0f9ff',
                          borderRadius: 8,
                          borderLeft: '3px solid #3b82f6'
                        }}>
                          <div style={{ 
                            fontSize: 13, 
                            fontWeight: 600, 
                            color: '#3b82f6', 
                            marginBottom: 6 
                          }}>
                            Phản hồi từ cửa hàng:
                          </div>
                          <div style={{ 
                            fontSize: 14, 
                            color: '#374151',
                            lineHeight: 1.6
                          }}>
                            {review.adminReply}
                          </div>
                          {review.adminReplyAt && (
                            <div style={{ 
                              fontSize: 12, 
                              color: '#6b7280', 
                              marginTop: 8 
                            }}>
                              {formatReviewDate(review.adminReplyAt)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 style={{ 
              fontSize: 24, 
              fontWeight: 700, 
              color: '#1f2937',
              marginBottom: 20
            }}>
              Sản phẩm liên quan
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
              gap: 20 
            }}>
              {relatedProducts.map(rp => (
                <Link 
                  key={rp._id} 
                  to={`/p/${rp.slug}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    background: 'white',
                    borderRadius: 12,
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  }}
                  >
                    <div style={{ 
                      height: 200, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      background: '#f8f9fa',
                      padding: 16
                    }}>
                      <img
                        src={getImageUrl(rp.imageUrls?.[0], '/default-product.svg')}
                        alt={rp.name}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain'
                        }}
                        onError={(e) => handleImageError(e, '/default-product.svg')}
                      />
                    </div>
                    <div style={{ padding: 16 }}>
                      <h3 style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: '#1f2937',
                        margin: '0 0 8px',
                        lineHeight: 1.4,
                        minHeight: 42,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {rp.name}
                      </h3>
                      <div style={{ 
                        fontSize: 18, 
                        fontWeight: 700, 
                        color: '#dc2626' 
                      }}>
                        {formatPrice(rp.price)}₫
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20
          }}
          onClick={() => {
            setShowReviewModal(false);
            setReviewForm({
              rating: 0,
              comment: "",
              guestName: "",
              guestEmail: "",
              guestPhone: ""
            });
          }}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: 12,
              padding: 30,
              maxWidth: 600,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: 24
            }}>
              <h3 style={{ 
                fontSize: 24, 
                fontWeight: 700, 
                color: '#1f2937',
                margin: 0
              }}>
                Đánh giá sản phẩm
              </h3>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewForm({
                    rating: 0,
                    comment: "",
                    guestName: "",
                    guestEmail: "",
                    guestPhone: ""
                  });
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 28,
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: 0,
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: 16, 
              marginBottom: 24,
              padding: 16,
              background: '#f8f9fa',
              borderRadius: 8
            }}>
              <img
                src={getImageUrl(product.imageUrls?.[0], '/default-product.svg')}
                alt={product.name}
                style={{
                  width: 60,
                  height: 60,
                  objectFit: 'contain',
                  borderRadius: 8
                }}
                onError={(e) => handleImageError(e, '/default-product.svg')}
              />
              <div>
                <div style={{ 
                  fontWeight: 600, 
                  color: '#1f2937',
                  fontSize: 15,
                  marginBottom: 4
                }}>
                  {product.name}
                </div>
                <div style={{ fontSize: 14, color: '#6b7280' }}>
                  {formatPrice(product.price)}₫
                </div>
              </div>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              
              // Validation
              if (!reviewForm.rating || reviewForm.rating === 0) {
                Swal.fire({
                  icon: "warning",
                  title: "Thiếu thông tin",
                  text: "Vui lòng chọn số sao đánh giá",
                  confirmButtonColor: "#3b82f6"
                });
                return;
              }
              
              if (!reviewForm.comment || !reviewForm.comment.trim()) {
                Swal.fire({
                  icon: "warning",
                  title: "Thiếu thông tin",
                  text: "Vui lòng nhập nội dung đánh giá",
                  confirmButtonColor: "#3b82f6"
                });
                return;
              }
              
              // Nếu chưa đăng nhập, kiểm tra thông tin guest
              if (!user) {
                if (!reviewForm.guestName || !reviewForm.guestName.trim()) {
                  Swal.fire({
                    icon: "warning",
                    title: "Thiếu thông tin",
                    text: "Vui lòng nhập họ và tên",
                    confirmButtonColor: "#3b82f6"
                  });
                  return;
                }
                if (!reviewForm.guestPhone || !reviewForm.guestPhone.trim()) {
                  Swal.fire({
                    icon: "warning",
                    title: "Thiếu thông tin",
                    text: "Vui lòng nhập số điện thoại",
                    confirmButtonColor: "#3b82f6"
                  });
                  return;
                }
              }
              
              try {
                const payload = {
                  rating: reviewForm.rating,
                  comment: reviewForm.comment.trim(),
                  ...(user ? {} : {
                    guestName: reviewForm.guestName.trim(),
                    guestEmail: reviewForm.guestEmail.trim() || null,
                    guestPhone: reviewForm.guestPhone.trim()
                  })
                };
                
                await api.post(`/reviews/product/${product._id}`, payload);
                
                Swal.fire({
                  icon: "success",
                  title: "Thành công",
                  text: "Đánh giá của bạn đã được gửi!",
                  confirmButtonColor: "#10b981",
                  timer: 2000,
                  showConfirmButton: false
                });
                
                // Reset form
                setReviewForm({
                  rating: 0,
                  comment: "",
                  guestName: "",
                  guestEmail: "",
                  guestPhone: ""
                });
                
                // Reload reviews
                await loadReviews(product._id);
                
                setShowReviewModal(false);
              } catch (error) {
                Swal.fire({
                  icon: "error",
                  title: "Lỗi",
                  text: error.response?.data?.message || "Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.",
                  confirmButtonColor: "#ef4444"
                });
              }
            }}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: 8, 
                  fontWeight: 600,
                  color: '#374151'
                }}>
                  Chọn đánh giá <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: 8, fontSize: 36 }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: reviewForm.rating >= star ? '#fbbf24' : '#d1d5db',
                        padding: 0,
                        fontSize: 36,
                        transition: 'color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (reviewForm.rating < star) {
                          e.target.style.color = '#fbbf24';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (reviewForm.rating < star) {
                          e.target.style.color = '#d1d5db';
                        }
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <div style={{ 
                  marginTop: 8, 
                  fontSize: 14, 
                  color: '#f59e0b',
                  fontWeight: 600
                }}>
                  {reviewForm.rating === 0 && 'Chưa chọn'}
                  {reviewForm.rating === 1 && 'Rất tệ'}
                  {reviewForm.rating === 2 && 'Tệ'}
                  {reviewForm.rating === 3 && 'Bình thường'}
                  {reviewForm.rating === 4 && 'Tốt'}
                  {reviewForm.rating === 5 && 'Tuyệt vời'}
                </div>
              </div>

              {!user && (
                <>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: 8, 
                      fontWeight: 600,
                      color: '#374151'
                    }}>
                      Họ và tên <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={reviewForm.guestName}
                      onChange={(e) => setReviewForm({ ...reviewForm, guestName: e.target.value })}
                      placeholder="Nhập họ và tên"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: 8,
                        fontSize: 15,
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: 8, 
                      fontWeight: 600,
                      color: '#374151'
                    }}>
                      Số điện thoại <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="tel"
                      value={reviewForm.guestPhone}
                      onChange={(e) => setReviewForm({ ...reviewForm, guestPhone: e.target.value })}
                      placeholder="Nhập số điện thoại"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: 8,
                        fontSize: 15,
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: 8, 
                      fontWeight: 600,
                      color: '#374151'
                    }}>
                      Email (Không bắt buộc)
                    </label>
                    <input
                      type="email"
                      value={reviewForm.guestEmail}
                      onChange={(e) => setReviewForm({ ...reviewForm, guestEmail: e.target.value })}
                      placeholder="Nhập email (Không bắt buộc)"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: 8,
                        fontSize: 15,
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>
                </>
              )}

              <div style={{ marginBottom: 24 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: 8, 
                  fontWeight: 600,
                  color: '#374151'
                }}>
                  Nội dung đánh giá <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Nhập nội dung đánh giá (Vui lòng gõ tiếng Việt có dấu)..."
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 15,
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '14px',
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#2563eb'}
                onMouseLeave={(e) => e.target.style.background = '#3b82f6'}
              >
                Gửi đánh giá
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
