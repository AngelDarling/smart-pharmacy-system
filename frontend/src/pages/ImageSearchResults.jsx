import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { getImageUrl, handleImageError } from '../utils/imageUtils';
import ImageSearchModal from '../components/ImageSearchModal.jsx';
import VoiceSearchModal from '../components/VoiceSearchModal.jsx';
import useCart from '../hooks/useCart.js';

export default function ImageSearchResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const { add } = useCart();
  const [searchResults, setSearchResults] = useState([]); // Mảng kết quả cho mỗi ảnh
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState(new Set()); // Track selected products
  const [showMoreSearch, setShowMoreSearch] = useState(false);
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [showVoiceSearch, setShowVoiceSearch] = useState(false);
  const [viewingImage, setViewingImage] = useState(null); // Ảnh đang xem trong modal
  const dropdownRef = useRef(null);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowMoreSearch(false);
      }
    };

    if (showMoreSearch) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreSearch]);

  useEffect(() => {
    // Lấy dữ liệu từ location.state (được truyền từ ImageSearchModal)
    const state = location.state;
    if (state?.searchResults && Array.isArray(state.searchResults) && state.searchResults.length > 0) {
      // Tạo preview URLs cho tất cả các ảnh
      const resultsWithPreview = state.searchResults.map(result => ({
        ...result,
        previewUrl: URL.createObjectURL(result.imageFile)
      }));
      setSearchResults(resultsWithPreview);
      setLoading(false);
    } else if (state?.imageFile && state?.products) {
      // Backward compatibility: nếu chỉ có 1 ảnh (format cũ)
      const previewUrl = URL.createObjectURL(state.imageFile);
      setSearchResults([{
        imageFile: state.imageFile,
        imageIndex: 1,
        keywords: state.keywords || '',
        products: state.products || [],
        success: true,
        previewUrl
      }]);
      setLoading(false);
    } else {
      // Nếu không có state, quay về trang chủ
      navigate('/');
    }

    // Cleanup preview URLs khi unmount
    return () => {
      if (state?.searchResults) {
        state.searchResults.forEach(result => {
          if (result.previewUrl) {
            URL.revokeObjectURL(result.previewUrl);
          }
        });
      } else if (state?.imageFile) {
        const previewUrl = URL.createObjectURL(state.imageFile);
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [location.state, navigate]);

  const handleViewImage = (previewUrl) => {
    if (previewUrl) {
      // Hiển thị ảnh trong modal trong trang
      setViewingImage(previewUrl);
    }
  };

  const handleCloseImageModal = () => {
    setViewingImage(null);
  };

  const handleProductToggle = (productId) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleBuyNow = () => {
    // Chỉ thực hiện khi có sản phẩm được chọn
    if (selectedProducts.size === 0) {
      return;
    }

    // Thêm các sản phẩm đã chọn vào giỏ hàng từ tất cả các kết quả
    searchResults.forEach(result => {
      if (result.products && result.products.length > 0) {
        result.products.forEach(product => {
          const productId = String(product._id || product.id);
          if (selectedProducts.has(productId)) {
            add(product, 1);
          }
        });
      }
    });

    // Chuyển đến trang giỏ hàng
    navigate('/cart');
  };

  const handleMoreSearchClick = () => {
    setShowMoreSearch(!showMoreSearch);
  };

  const handleImageSearchClick = () => {
    setShowImageSearch(true);
    setShowMoreSearch(false);
  };

  const handleVoiceSearchClick = () => {
    setShowVoiceSearch(true);
    setShowMoreSearch(false);
  };

  const handleImageSearch = (searchTerm) => {
    // Navigate to search results
    navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
  };

  const handleVoiceSearch = (searchTerm) => {
    // Navigate to search results
    navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '60vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: 50, 
            height: 50, 
            border: '4px solid #e5e7eb', 
            borderTop: '4px solid #3b82f6', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#6b7280' }}>Đang tải kết quả...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f9fafb',
      paddingTop: 16
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <Link 
            to="/" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 6, 
              color: '#3b82f6', 
              textDecoration: 'none',
              marginBottom: 12,
              fontSize: 13
            }}
          >
            <span>←</span>
            <span>Quay lại</span>
          </Link>
          <h1 style={{ 
            fontSize: 22, 
            fontWeight: 700, 
            color: '#1f2937', 
            margin: 0 
          }}>
            Kết quả tìm kiếm bằng ảnh
          </h1>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 360px', 
          gap: 16,
          marginBottom: 40
        }}>
          {/* Main Content */}
          <div>
            {/* Hiển thị kết quả cho từng ảnh */}
            {searchResults.map((result, resultIndex) => (
              <div key={resultIndex} style={{ marginBottom: resultIndex < searchResults.length - 1 ? 24 : 0 }}>
                {/* Khung chung cho hình ảnh, từ khóa và kết quả */}
                <div style={{ 
                  background: 'white',
                  borderRadius: 12,
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  {/* Image Summary và Keywords - Header của khung */}
                  <div style={{
                    padding: 12,
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    {result.previewUrl && (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8
                      }}>
                        <div style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 12
                        }}>
                          <div style={{
                            width: 80,
                            height: 80,
                            borderRadius: 6,
                            overflow: 'hidden',
                            border: '1px solid #e5e7eb',
                            position: 'relative',
                            cursor: 'pointer',
                            flexShrink: 0
                          }}
                          onClick={() => handleViewImage(result.previewUrl)}
                          >
                            <img
                              src={result.previewUrl}
                              alt={`Uploaded ${result.imageIndex}`}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewImage(result.previewUrl);
                              }}
                              style={{
                                position: 'absolute',
                                bottom: 4,
                                left: 4,
                                padding: '4px 8px',
                                background: 'rgba(0, 0, 0, 0.6)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 4,
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                              }}
                              onMouseEnter={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.8)'}
                              onMouseLeave={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.6)'}
                            >
                              Xem ảnh
                            </button>
                          </div>
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4
                          }}>
                            <div style={{ 
                              fontSize: 12, 
                              color: '#3b82f6', 
                              fontWeight: 600
                            }}>
                              Hình {result.imageIndex}
                            </div>
                            <div style={{ 
                              fontSize: 14, 
                              color: '#1f2937', 
                              fontWeight: 600
                            }}>
                              {result.success 
                                ? `Tìm được ${result.products?.length || 0} sản phẩm phù hợp`
                                : `Lỗi: ${result.error || 'Không thể tìm kiếm'}`}
                            </div>
                          </div>
                        </div>
                        {result.keywords && (
                          <div style={{ 
                            fontSize: 12, 
                            fontWeight: 600, 
                            color: '#ef4444',
                            marginTop: 4
                          }}>
                            {resultIndex + 1}. {result.keywords}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Products List cho mỗi ảnh */}
                  {result.success && result.products && result.products.length > 0 ? (
                    <div>
                      <div style={{ 
                        background: 'transparent'
                      }}>
                      {result.products.map((product, index) => (
                    <div
                      key={product._id || product.id}
                      style={{
                        background: 'transparent',
                        padding: 12,
                        display: 'flex',
                        gap: 12,
                        alignItems: 'center',
                        cursor: 'pointer',
                        borderBottom: index < result.products.length - 1 ? '1px solid #e5e7eb' : 'none',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f9fafb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                      onClick={() => navigate(`/p/${product.slug}`)}
                    >
                      {/* Checkbox - Circular */}
                      <div style={{ 
                        position: 'relative', 
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 20,
                        height: 20
                      }}>
                        <input
                          type="checkbox"
                          checked={selectedProducts.has(String(product._id || product.id))}
                          onChange={() => handleProductToggle(String(product._id || product.id))}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            width: 20,
                            height: 20,
                            cursor: 'pointer',
                            accentColor: '#3b82f6',
                            borderRadius: '50%',
                            appearance: 'none',
                            WebkitAppearance: 'none',
                            MozAppearance: 'none',
                            border: selectedProducts.has(String(product._id || product.id)) 
                              ? '2px solid #3b82f6' 
                              : '2px solid #d1d5db',
                            background: selectedProducts.has(String(product._id || product.id))
                              ? '#3b82f6'
                              : 'white',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            margin: 0,
                            padding: 0,
                            transition: 'all 0.2s'
                          }}
                        />
                        {selectedProducts.has(String(product._id || product.id)) && (
                          <svg
                            style={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              width: 14,
                              height: 14,
                              pointerEvents: 'none',
                              zIndex: 1
                            }}
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M20 6L9 17L4 12"
                              stroke="white"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              fill="none"
                            />
                          </svg>
                        )}
                      </div>

                      {/* Product Image */}
                      <div style={{
                        width: 70,
                        height: 70,
                        borderRadius: 8,
                        overflow: 'hidden',
                        background: '#f3f4f6',
                        flexShrink: 0,
                        position: 'relative'
                      }}>
                        <img
                          src={getImageUrl(product.imageUrls?.[0] || product.imageUrl)}
                          alt={product.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain'
                          }}
                          onError={handleImageError}
                        />
                        {/* Discount Badge */}
                        {product.discount > 0 && (
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            background: '#ef4444',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '0 0 8px 0',
                            fontSize: 9,
                            fontWeight: 700,
                            zIndex: 1
                          }}>
                            {product.discountType === 'amount' && product.discountValue
                              ? `-${(product.discountValue / 1000).toFixed(0)}K`
                              : `-${product.discount}%`}
                          </div>
                        )}
                      </div>

                      {/* Product Info - Name và Price cùng hàng */}
                      <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                        {/* Product Name */}
                        <h3 style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: '#1f2937',
                          margin: 0,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: '1.4',
                          flex: 1,
                          minWidth: 0
                        }}>
                          {product.name}
                        </h3>
                        
                        {/* Price Info - Align sang phải */}
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'flex-end',
                          gap: 2,
                          flexShrink: 0
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{
                              fontSize: 15,
                              fontWeight: 700,
                              color: '#3b82f6'
                            }}>
                              {(product.finalPrice || product.price)?.toLocaleString('vi-VN')}₫
                            </span>
                          </div>
                          {(product.compareAtPrice || product.originalPrice) && 
                           (product.compareAtPrice || product.originalPrice) > (product.finalPrice || product.price) && (
                            <span style={{
                              fontSize: 12,
                              color: '#9ca3af',
                              textDecoration: 'line-through'
                            }}>
                              {(product.compareAtPrice || product.originalPrice).toLocaleString('vi-VN')}₫
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Unit selector placeholder */}
                      <div style={{
                        padding: '6px 10px',
                        border: '1px solid #e5e7eb',
                        borderRadius: 4,
                        fontSize: 12,
                        color: '#6b7280',
                        minWidth: 60,
                        textAlign: 'center',
                        flexShrink: 0
                      }}>
                        Hộp
                        </div>
                      </div>
                      ))}
                    </div>
                  </div>
                  ) : result.success ? (
                    <div style={{
                      padding: 40,
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                      <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1f2937', marginBottom: 8 }}>
                        Không tìm thấy sản phẩm
                      </h3>
                      <p style={{ color: '#6b7280', marginBottom: 20 }}>
                        Không có sản phẩm nào phù hợp với hình ảnh này.
                      </p>
                    </div>
                  ) : (
                    <div style={{
                      padding: 20,
                      textAlign: 'center',
                      borderTop: '1px solid #e5e7eb'
                    }}>
                      <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: '#ef4444', marginBottom: 8 }}>
                        Lỗi tìm kiếm
                      </h3>
                      <p style={{ color: '#6b7280', fontSize: 14 }}>
                        {result.error || 'Không thể tìm kiếm với hình ảnh này'}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Separator giữa các khung (trừ khung cuối) */}
                {resultIndex < searchResults.length - 1 && (
                  <div style={{
                    height: 1,
                    background: '#e5e7eb',
                    margin: '24px 0'
                  }}></div>
                )}
              </div>
            ))}
            
            {/* Khoảng cách trước footer */}
            <div style={{ marginTop: 40, marginBottom: 20 }}></div>
          </div>

          {/* Sidebar - Sticky */}
          <div>
            <div style={{
              background: 'white',
              borderRadius: 8,
              padding: 18,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              position: 'sticky',
              top: 20,
              alignSelf: 'flex-start'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 16
              }}>
                <span style={{ fontSize: 22 }}>💡</span>
                <h3 style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#1f2937',
                  margin: 0
                }}>
                  Mẹo để tìm kiếm hình ảnh chính xác nhất
                </h3>
              </div>
              
              {/* Tips section với nền vàng nhạt */}
              <div style={{
                background: '#fef9e7',
                borderRadius: 6,
                padding: 16,
                marginBottom: 16
              }}>
                <ul style={{
                  margin: 0,
                  paddingLeft: 22,
                  fontSize: 14,
                  color: '#374151',
                  lineHeight: 1.7
                }}>
                  <li>Hình ảnh phải là sản phẩm hoặc đơn thuốc</li>
                  <li>Ảnh chụp hoặc ảnh tải lên phải rõ nét và rõ tên sản phẩm</li>
                  <li>Sử dụng góc chụp phù hợp, không bị mờ, chói lóa</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  onClick={handleBuyNow}
                  disabled={selectedProducts.size === 0}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: selectedProducts.size > 0 ? '#3b82f6' : '#f3f4f6',
                    color: selectedProducts.size > 0 ? 'white' : '#9ca3af',
                    border: 'none',
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: selectedProducts.size > 0 ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedProducts.size > 0) {
                      e.target.style.background = '#2563eb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedProducts.size > 0) {
                      e.target.style.background = '#3b82f6';
                    }
                  }}
                >
                  Mua hàng {selectedProducts.size > 0 && `(${selectedProducts.size})`}
                </button>

                <div style={{ position: 'relative' }} ref={dropdownRef}>
                  <button
                    onClick={handleMoreSearchClick}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: '#dbeafe',
                      color: '#3b82f6',
                      border: 'none',
                      borderRadius: 20,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#bfdbfe';
                      e.target.style.color = '#2563eb';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#dbeafe';
                      e.target.style.color = '#3b82f6';
                    }}
                  >
                    Tìm kiếm thêm
                    <span style={{ fontSize: 10 }}>{showMoreSearch ? '▲' : '▼'}</span>
                  </button>

                  {/* Dropdown Menu */}
                  {showMoreSearch && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: 6,
                      background: 'white',
                      borderRadius: 6,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      overflow: 'hidden',
                      zIndex: 100
                    }}>
                      <button
                        onClick={handleImageSearchClick}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: 'white',
                          border: 'none',
                          textAlign: 'left',
                          fontSize: 13,
                          color: '#1f2937',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                        onMouseLeave={(e) => e.target.style.background = 'white'}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" width="18" height="18" style={{ color: '#3b82f6' }}>
                          <path fill="currentColor" d="M10 5.833A4.179 4.179 0 0 0 5.834 10 4.179 4.179 0 0 0 10 14.167 4.179 4.179 0 0 0 14.167 10 4.179 4.179 0 0 0 10 5.833ZM10 7.5c1.391 0 2.5 1.11 2.5 2.5s-1.109 2.5-2.5 2.5c-1.39 0-2.5-1.108-2.5-2.5S8.61 7.5 10 7.5ZM5 1.667A3.344 3.344 0 0 0 1.667 5v1.667a.833.833 0 0 0 1.667 0V5c0-.937.729-1.667 1.666-1.667h1.667a.833.833 0 1 0 0-1.666H5ZM2.5 12.5a.833.833 0 0 0-.833.833V15c0 1.833 1.5 3.333 3.333 3.333h1.667a.833.833 0 1 0 0-1.666H5c-.937 0-1.666-.73-1.666-1.667v-1.667A.833.833 0 0 0 2.5 12.5Zm15 0a.833.833 0 0 0-.833.833V15c0 .938-.73 1.667-1.667 1.667h-1.666a.833.833 0 1 0 0 1.666H15c1.833 0 3.334-1.5 3.334-3.333v-1.667a.833.833 0 0 0-.834-.833ZM13.334 1.667a.833.833 0 1 0 0 1.666H15c.938 0 1.667.73 1.667 1.667v1.667a.833.833 0 1 0 1.667 0V5c0-1.832-1.501-3.333-3.334-3.333h-1.666Z"></path>
                        </svg>
                        <span>Tìm với hình ảnh</span>
                      </button>
                      <button
                        onClick={handleVoiceSearchClick}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: 'white',
                          border: 'none',
                          textAlign: 'left',
                          fontSize: 13,
                          color: '#1f2937',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          transition: 'background 0.2s',
                          borderTop: '1px solid #e5e7eb'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                        onMouseLeave={(e) => e.target.style.background = 'white'}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ color: '#3b82f6' }}>
                          <path 
                            d="M12 2C10.34 2 9 3.34 9 5V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V5C15 3.34 13.66 2 12 2Z" 
                            fill="currentColor"
                          />
                          <path 
                            d="M12 17C9.24 17 7 14.76 7 12H5C5 15.53 7.61 18.43 11 18.92V22H13V18.92C16.39 18.43 19 15.53 19 12H17C17 14.76 14.76 17 12 17Z" 
                            fill="currentColor"
                          />
                        </svg>
                        <span>Tìm với giọng nói</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ImageSearchModal
        isOpen={showImageSearch}
        onClose={() => setShowImageSearch(false)}
        onSearch={handleImageSearch}
      />

      <VoiceSearchModal
        isOpen={showVoiceSearch}
        onClose={() => setShowVoiceSearch(false)}
        onSearch={handleVoiceSearch}
      />

      {/* Image View Modal */}
      {viewingImage && (
        <div
          onClick={handleCloseImageModal}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              background: 'white',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 20px 25px rgba(0,0,0,0.3)'
            }}
          >
            <img
              src={viewingImage}
              alt="Full size"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                maxWidth: '90vw',
                maxHeight: '90vh',
                display: 'block'
              }}
            />
            <button
              onClick={handleCloseImageModal}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: 36,
                height: 36,
                fontSize: 24,
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.8)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.6)'}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

