import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import SelectPurchaseModal from '../components/SelectPurchaseModal.jsx';

export default function Products() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'bestselling',
    searchTerm: query
  });

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Nếu có search term, sử dụng search API
      if (filters.searchTerm && filters.searchTerm.trim()) {
        const params = new URLSearchParams();
        params.append('query', filters.searchTerm);
        if (filters.category) params.append('category', filters.category);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filters.sortBy) params.append('sortBy', filters.sortBy);
        params.append('page', '1');
        params.append('limit', '50');
        
        const response = await axios.get(`/api/search?${params}`);
        setProducts(response.data.products || []);
      } else {
        // Nếu không có search term, sử dụng products API
        const params = new URLSearchParams();
        if (filters.category) params.append('category', filters.category);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filters.sortBy) params.append('sortBy', filters.sortBy);
        
        const response = await axios.get(`/api/products?${params}`);
        setProducts(response.data.items || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data.items || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const getSortOptions = () => [
    { value: 'bestselling', label: 'Bán chạy' },
    { value: 'price_asc', label: 'Giá thấp' },
    { value: 'price_desc', label: 'Giá cao' },
    { value: 'name', label: 'Tên A-Z' },
    { value: 'discount', label: 'Giảm giá nhiều' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Header */}
      <div style={{ background: 'white', padding: '20px 0', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#1f2937' }}>
            {query ? `Kết quả tìm kiếm cho "${query}"` : 'Danh sách sản phẩm'}
          </h1>
          <p style={{ margin: '8px 0 0', color: '#6b7280', fontSize: 16 }}>
            Tìm thấy {products.length} sản phẩm
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px', display: 'flex', gap: 24 }}>
        {/* Filters Sidebar */}
        <div style={{ width: 280, flexShrink: 0 }}>
          <div style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700, color: '#1f2937' }}>
              Bộ lọc nâng cao
            </h3>
            
            {/* Search */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                Tìm kiếm
              </label>
              <input
                type="text"
                placeholder="Tìm sản phẩm..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            {/* Category Filter */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 12, fontWeight: 600, color: '#374151' }}>
                Loại sản phẩm
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="category"
                    value=""
                    checked={filters.category === ''}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    style={{ margin: 0 }}
                  />
                  <span style={{ fontSize: 14, color: '#374151' }}>Tất cả</span>
                </label>
                {categories.slice(0, 5).map(category => (
                  <label key={category._id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="category"
                      value={category.slug}
                      checked={filters.category === category.slug}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      style={{ margin: 0 }}
                    />
                    <span style={{ fontSize: 14, color: '#374151' }}>{category.name}</span>
                  </label>
                ))}
                {categories.length > 5 && (
                  <button style={{ 
                    color: '#3b82f6', 
                    background: 'none', 
                    border: 'none', 
                    fontSize: 14, 
                    cursor: 'pointer',
                    textAlign: 'left',
                    padding: 0
                  }}>
                    Xem thêm
                  </button>
                )}
              </div>
            </div>

            {/* Price Range */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 12, fontWeight: 600, color: '#374151' }}>
                Giá bán
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input
                  type="number"
                  placeholder="Dưới 100.000₫"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 14,
                    outline: 'none'
                  }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="number"
                    placeholder="Từ"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: 14,
                      outline: 'none'
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Đến"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: 14,
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Sort */}
            <div>
              <label style={{ display: 'block', marginBottom: 12, fontWeight: 600, color: '#374151' }}>
                Sắp xếp
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 14,
                  background: 'white',
                  outline: 'none'
                }}
              >
                {getSortOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1 }}>
          {/* Sort Bar */}
          <div style={{ 
            background: 'white', 
            padding: '16px 24px', 
            borderRadius: 12, 
            marginBottom: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontWeight: 600, color: '#374151' }}>Sắp xếp theo:</span>
              <div style={{ display: 'flex', gap: 8 }}>
                {getSortOptions().map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleFilterChange('sortBy', option.value)}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid #d1d5db',
                      background: filters.sortBy === option.value ? '#3b82f6' : 'white',
                      color: filters.sortBy === option.value ? 'white' : '#374151',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 500,
                      transition: 'all 0.2s'
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                background: 'white',
                borderRadius: 6,
                cursor: 'pointer'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                  <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                  <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                  <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
              <button style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                background: 'white',
                borderRadius: 6,
                cursor: 'pointer'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <line x1="8" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2"/>
                  <line x1="8" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2"/>
                  <line x1="8" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2"/>
                  <line x1="3" y1="6" x2="3.01" y2="6" stroke="currentColor" strokeWidth="2"/>
                  <line x1="3" y1="12" x2="3.01" y2="12" stroke="currentColor" strokeWidth="2"/>
                  <line x1="3" y1="18" x2="3.01" y2="18" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Note */}
          <div style={{ 
            background: '#fef3c7', 
            border: '1px solid #f59e0b', 
            borderRadius: 8, 
            padding: '12px 16px', 
            marginBottom: 20,
            fontSize: 14,
            color: '#92400e'
          }}>
            <strong>Lưu ý:</strong> Thuốc kê đơn và một số sản phẩm sẽ cần tư vấn từ dược sĩ
          </div>

          {/* Products Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
              <div style={{ fontSize: 18 }}>Đang tải sản phẩm...</div>
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <div style={{ fontSize: 18, color: '#6b7280', marginBottom: 8 }}>
                Không tìm thấy sản phẩm nào
              </div>
              <div style={{ color: '#9ca3af' }}>
                Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm từ khóa khác
              </div>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: 20
            }}>
              {products.map(product => (
                <div
                  key={product._id}
                  style={{
                    background: 'white',
                    borderRadius: 12,
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <img
                      src={product.imageUrls?.[0] || '/default-product.svg'}
                      alt={product.name}
                      style={{
                        width: '100%',
                        height: 200,
                        objectFit: 'cover',
                        backgroundColor: '#f3f4f6'
                      }}
                      onError={(e) => {
                        e.target.src = '/default-product.svg';
                      }}
                    />
                    {product.discount > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        background: '#dc2626',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 700
                      }}>
                        -{product.discount}%
                      </div>
                    )}
                  </div>
                  
                  <div style={{ padding: 20 }}>
                    <h3 style={{
                      margin: '0 0 12px',
                      fontSize: 16,
                      fontWeight: 600,
                      color: '#1f2937',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: '44px'
                    }}>
                      {product.name}
                    </h3>
                    
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 20, fontWeight: 700, color: '#dc2626' }}>
                          {formatPrice(product.price)}₫
                        </span>
                        <span style={{ fontSize: 14, color: '#6b7280' }}>
                          / {product.unit || 'Hộp'}
                        </span>
                      </div>
                      {product.discount > 0 && (
                        <div style={{ fontSize: 14, color: '#9ca3af' }}>
                          <span style={{ textDecoration: 'line-through' }}>
                            {formatPrice(Math.round(product.price / (1 - product.discount / 100)))}₫
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>
                      {product.categoryId?.name || 'Khác'}
                    </div>
                    
                    <button
                      onClick={() => handleProductSelect(product)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#2563eb'}
                      onMouseLeave={(e) => e.target.style.background = '#3b82f6'}
                    >
                      Chọn mua
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Selection Modal */}
      {selectedProduct && (
        <SelectPurchaseModal
          product={selectedProduct}
          open={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}
