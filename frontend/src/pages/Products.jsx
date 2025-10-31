import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SelectPurchaseModal from '../components/SelectPurchaseModal.jsx';
import { getImageUrl, handleImageError } from '../utils/imageUtils';

export default function Products() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [currentCategory, setCurrentCategory] = useState(null);
  const [categoryBreadcrumb, setCategoryBreadcrumb] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subCategoryPage, setSubCategoryPage] = useState({});
  const [hoveredCard, setHoveredCard] = useState(null);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [recentlyViewedScrollIndex, setRecentlyViewedScrollIndex] = useState(0);
  
  const [filters, setFilters] = useState({
    category: categoryParam,
    minPrice: '',
    maxPrice: '',
    sortBy: 'bestselling',
    searchTerm: query
  });
  const [page, setPage] = useState(1);
  const initialLimit = 12;
  const loadMoreLimit = 8;
  const [total, setTotal] = useState(0);

  // Sort products
  const sortProducts = (productsList, sortBy) => {
    const sorted = [...productsList];
    
    switch (sortBy) {
      case 'price_asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
      case 'discount':
        return sorted.sort((a, b) => (b.discount || 0) - (a.discount || 0));
      case 'bestselling':
      default:
        return sorted; // Keep original order for bestselling
    }
  };

  // Handle subcategory pagination
  const handleSubCategoryPageChange = (subCategoryId, direction) => {
    setSubCategoryPage(prev => {
      const current = prev[subCategoryId]?.current || 0;
      const total = prev[subCategoryId]?.total || 0;
      let newCurrent = current;
      
      if (direction === 'next' && current < total - 1) {
        newCurrent = current + 1;
      } else if (direction === 'prev' && current > 0) {
        newCurrent = current - 1;
      }
      
      return {
        ...prev,
        [subCategoryId]: { ...prev[subCategoryId], current: newCurrent }
      };
    });
  };

  // Get visible subcategories for a category
  const getVisibleSubCategories = (subCategory) => {
    const pagination = subCategoryPage[subCategory._id];
    if (!pagination || !subCategory.children) return [];
    
    const start = pagination.current * 5;
    const end = start + 5;
    return subCategory.children.slice(start, end);
  };

  // Check if current category is level 0 or level 1
  const isLevel0Category = currentCategory && currentCategory.level === 0;
  const isLevel1Category = currentCategory && currentCategory.level === 1;

  // Load recently viewed products from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentlyViewed');
    if (saved) {
      try {
        setRecentlyViewed(JSON.parse(saved));
      } catch (error) {
        console.error('Error parsing recently viewed products:', error);
      }
    }
  }, []);

  // Save product to recently viewed
  const addToRecentlyViewed = (product) => {
    setRecentlyViewed(prev => {
      // Remove if already exists
      const filtered = prev.filter(p => p._id !== product._id);
      // Add to beginning and limit to 10 items
      const updated = [product, ...filtered].slice(0, 10);
      // Save to localStorage
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
      return updated;
    });
  };

  // Calculate pagination for recently viewed
  const itemsPerPage = 6;
  const totalPages = Math.ceil(recentlyViewed.length / itemsPerPage);

  // Handle scroll navigation
  const handleRecentlyViewedScroll = (direction) => {
    if (direction === 'prev' && recentlyViewedScrollIndex > 0) {
      setRecentlyViewedScrollIndex(recentlyViewedScrollIndex - 1);
    } else if (direction === 'next' && recentlyViewedScrollIndex < totalPages - 1) {
      setRecentlyViewedScrollIndex(recentlyViewedScrollIndex + 1);
    }
  };

  // Fetch products (backend pagination)
  const fetchProducts = useCallback(async (opts = { reset: true, nextPage: 1 }) => {
    const { reset, nextPage } = opts;
    if (reset) {
    setLoading(true);
      setPage(1);
    }
    try {
        const params = new URLSearchParams();
        if (filters.category) params.append('category', filters.category);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.searchTerm && filters.searchTerm.trim()) params.append('q', filters.searchTerm.trim());
      params.append('page', String(nextPage));
      const pageLimit = nextPage === 1 ? initialLimit : loadMoreLimit;
      params.append('limit', String(pageLimit));
        
        const response = await axios.get(`/api/products?${params}`);
      const fetchedProducts = response.data.items || [];
      const sortedProducts = sortProducts(fetchedProducts, filters.sortBy);

      setTotal(response.data.total || 0);
      if (reset) {
        setProducts(sortedProducts);
      } else {
        setProducts((prev) => sortProducts([...prev, ...sortedProducts], filters.sortBy));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      if (opts.reset) setLoading(false);
      setLoadingMore(false);
    }
  }, [filters]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get('/api/categories/tree');
      setCategories(response.data || []);
      
      // Build breadcrumb for current category
      if (filters.category) {
        const findCategory = (cats, slug, path = []) => {
          for (const cat of cats) {
            if (cat.slug === slug) {
              setCurrentCategory(cat);
              setCategoryBreadcrumb([...path, cat]);
              
              // If this is a level 0 category, get its subcategories (level 1)
              if (cat.level === 0 && cat.children) {
                setSubCategories(cat.children);
                // Initialize pagination for each subcategory
                const pagination = {};
                cat.children.forEach(subCat => {
                  pagination[subCat._id] = { current: 0, total: Math.ceil((subCat.children?.length || 0) / 5) };
                });
                setSubCategoryPage(pagination);
              } 
              // If this is a level 1 category, get its subcategories (level 2)
              else if (cat.level === 1 && cat.children) {
                setSubCategories(cat.children);
                setSubCategoryPage({});
              } else {
                setSubCategories([]);
                setSubCategoryPage({});
              }
              return true;
            }
            if (cat.children && cat.children.length > 0) {
              if (findCategory(cat.children, slug, [...path, cat])) {
                return true;
              }
            }
          }
          return false;
        };
        findCategory(response.data || [], filters.category);
      } else {
        setCurrentCategory(null);
        setCategoryBreadcrumb([]);
        setSubCategories([]);
        setSubCategoryPage({});
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, [filters.category]);

  // Update filters when URL params change
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      category: categoryParam,
      searchTerm: query
    }));
  }, [categoryParam, query]);

  useEffect(() => {
    fetchProducts({ reset: true, nextPage: 1 });
    fetchCategories();
  }, [filters, fetchProducts, fetchCategories]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleProductClick = (product) => {
    addToRecentlyViewed(product);
    navigate(`/p/${product.slug}`);
  };

  const handleBuyClick = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
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
    <div style={{ minHeight: '100vh', background: '#f3f4f6', marginTop: 'auto' }}>
      {/* Breadcrumb */}
      <div style={{ background: 'transparent', padding: '12px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#6b7280', flexWrap: 'wrap' }}>
            <Link to="/" style={{ color: '#3b82f6', textDecoration: 'none' }}>
              Trang chủ
            </Link>
            {categoryBreadcrumb.length === 0 && !query ? (
              <>
                <span>/</span>
                <span style={{ color: '#1f2937', fontWeight: 600 }}>Danh sách sản phẩm</span>
              </>
            ) : (
              <>
                {categoryBreadcrumb.map((cat, index) => (
                  <React.Fragment key={cat._id}>
                    <span>/</span>
                    <Link 
                      to={`/catalog?category=${cat.slug}`}
                      style={{ 
                        color: index === categoryBreadcrumb.length - 1 ? '#1f2937' : '#3b82f6', 
                        textDecoration: 'none',
                        fontWeight: index === categoryBreadcrumb.length - 1 ? 600 : 400
                      }}
                    >
                      {cat.name}
                    </Link>
                  </React.Fragment>
                ))}
                {query && (
                  <>
                    <span>/</span>
                    <span style={{ color: '#1f2937', fontWeight: 600 }}>Tìm kiếm "{query}"</span>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Header with category name */}
      <div style={{ background: 'transparent', padding: '10px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1f2937' }}>
            {currentCategory ? currentCategory.name : query ? `Kết quả tìm kiếm` : 'Danh sách sản phẩm'}
          </h1>
        </div>
      </div>

      {/* Subcategories Section - Show for level 0 and level 1 categories */}
      {((isLevel0Category || isLevel1Category) && subCategories.length > 0) && (
        <div style={{ background: 'transparent', padding: '20px 0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isLevel1Category 
                ? 'repeat(4, 1fr)' 
                : 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: 16,
              marginBottom: 20
            }}>
              {subCategories.map((subCategory) => {
                const visibleSubCategories = getVisibleSubCategories(subCategory);
                const pagination = subCategoryPage[subCategory._id];
                const hasMore = pagination && pagination.total > 1;
                
                return (
                  <div key={subCategory._id} style={{
                    background: 'white',
                    borderRadius: 8,
                    padding: isLevel1Category ? 12 : 16,
                    boxShadow: hoveredCard === subCategory._id 
                      ? '0 4px 12px rgba(0,0,0,0.15)' 
                      : '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'box-shadow 0.2s ease-in-out',
                    cursor: 'pointer',
                    border: 'none',
                    outline: 'none'
                  }}
                  onClick={() => {
                    if (isLevel1Category) {
                      navigate(`/catalog?category=${subCategory.slug}`);
                    }
                  }}
                  onMouseEnter={() => setHoveredCard(subCategory._id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  >
                    {isLevel1Category ? (
                      // Simple layout for level 2 categories
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {/* Icon */}
                        <div style={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: 6, 
                          background: '#f3f4f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {subCategory.iconUrl ? (
                            <img 
                              src={subCategory.iconUrl.startsWith('http') ? subCategory.iconUrl : `http://localhost:5000${subCategory.iconUrl}`}
                              alt={subCategory.name}
                              style={{ width: 24, height: 24, objectFit: 'contain' }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                          ) : null}
                          <div style={{ 
                            display: subCategory.iconUrl ? 'none' : 'block',
                            fontSize: 20,
                            color: '#6b7280'
                          }}>
                            📦
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ 
                            margin: '0 0 4px', 
                            fontSize: 14, 
                            fontWeight: 600, 
                            color: '#1f2937',
                            lineHeight: 1.2
                          }}>
                            {subCategory.name}
                          </h3>
                          <p style={{ 
                            margin: 0, 
                            fontSize: 12, 
                            color: '#6b7280',
                            fontWeight: 500
                          }}>
                            {subCategory.productCount || 0} sản phẩm
                          </p>
                        </div>
                      </div>
                    ) : (
                      // Complex layout for level 1 categories (existing)
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        {/* Icon */}
                        <div style={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: 6, 
                          background: '#f3f4f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {subCategory.iconUrl ? (
                            <img 
                              src={subCategory.iconUrl.startsWith('http') ? subCategory.iconUrl : `http://localhost:5000${subCategory.iconUrl}`}
                              alt={subCategory.name}
                              style={{ width: 28, height: 28, objectFit: 'contain' }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                          ) : null}
                          <div style={{ 
                            display: subCategory.iconUrl ? 'none' : 'block',
                            fontSize: 24,
                            color: '#6b7280'
                          }}>
                            📦
        </div>
      </div>
                        
                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ 
                            margin: '0 0 6px', 
                            fontSize: 17, 
                            fontWeight: 700, 
                            color: '#1f2937',
                            lineHeight: 1.2
                          }}>
                            {subCategory.name}
                          </h3>
                          <p style={{ 
                            margin: '0 0 10px', 
                            fontSize: 15, 
                            color: '#6b7280',
                            fontWeight: 500
                          }}>
                            {subCategory.productCount || 0} sản phẩm
                          </p>
                          
                          {/* Level 2 subcategories */}
                          {visibleSubCategories.length > 0 && (
                            <div style={{ marginBottom: 10 }}>
                              {visibleSubCategories.map((level2Category) => (
                                <button
                                  key={level2Category._id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/catalog?category=${level2Category.slug}`);
                                  }}
                                  style={{
                                    display: 'block',
                                    width: '100%',
                                    textAlign: 'left',
                                    background: 'none',
                                    border: 'none',
                                    outline: 'none',
                                    padding: '3px 0',
                                    fontSize: 14,
                                    color: '#3b82f6',
                                    cursor: 'pointer',
                                    transition: 'color 0.2s ease-in-out',
                                    textDecoration: 'none'
                                  }}
                                  onMouseEnter={(e) => e.target.style.color = '#1d4ed8'}
                                  onMouseLeave={(e) => e.target.style.color = '#3b82f6'}
                                >
                                  {level2Category.name}
                                </button>
                              ))}
                            </div>
                          )}
                          
                          {/* Pagination dots */}
                          {hasMore && (
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'flex-end',
                              gap: 4
                            }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSubCategoryPageChange(subCategory._id, 'prev');
                                }}
                                disabled={pagination.current === 0}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  outline: 'none',
                                  padding: '4px',
                                  cursor: pagination.current === 0 ? 'not-allowed' : 'pointer',
                                  opacity: pagination.current === 0 ? 0.3 : 1,
                                  fontSize: 12
                                }}
                              >
                                ◀
                              </button>
                              {Array.from({ length: pagination.total }, (_, i) => (
                                <button
                                  key={i}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSubCategoryPage(prev => ({
                                      ...prev,
                                      [subCategory._id]: { ...prev[subCategory._id], current: i }
                                    }));
                                  }}
                                  style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    border: 'none',
                                    outline: 'none',
                                    background: i === pagination.current ? '#3b82f6' : '#d1d5db',
                                    cursor: 'pointer',
                                    padding: 0
                                  }}
                                />
                              ))}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSubCategoryPageChange(subCategory._id, 'next');
                                }}
                                disabled={pagination.current === pagination.total - 1}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  outline: 'none',
                                  padding: '4px',
                                  cursor: pagination.current === pagination.total - 1 ? 'not-allowed' : 'pointer',
                                  opacity: pagination.current === pagination.total - 1 ? 0.3 : 1,
                                  fontSize: 12
                                }}
                              >
                                ▶
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px', display: 'flex', gap: 24 }}>
        {/* Filters Sidebar */}
        <div style={{ width: 280, flexShrink: 0 }}>
          <div style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700, color: '#1f2937' }}>
              Bộ lọc nâng cao
            </h3>
            
            {/* Search */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151', fontSize: 14 }}>
                Tìm kiếm
              </label>
              <input
                type="text"
                placeholder="Tìm sản phẩm..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
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
              <label style={{ display: 'block', marginBottom: 12, fontWeight: 600, color: '#374151', fontSize: 14 }}>
                Giá bán
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  onClick={() => {
                    handleFilterChange('minPrice', '');
                    handleFilterChange('maxPrice', '100000');
                  }}
                  style={{
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 15,
                    background: (!filters.minPrice && filters.maxPrice === '100000') ? '#eff6ff' : 'white',
                    color: '#374151',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                    fontWeight: (!filters.minPrice && filters.maxPrice === '100000') ? 600 : 400
                  }}
                  onMouseEnter={(e) => {
                    if (!(!filters.minPrice && filters.maxPrice === '100000')) {
                      e.target.style.background = '#f9fafb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!(!filters.minPrice && filters.maxPrice === '100000')) {
                      e.target.style.background = 'white';
                    }
                  }}
                >
                  Dưới 100.000₫
                </button>
                <button
                  onClick={() => {
                    handleFilterChange('minPrice', '100000');
                    handleFilterChange('maxPrice', '300000');
                  }}
                    style={{
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                    fontSize: 15,
                    background: (filters.minPrice === '100000' && filters.maxPrice === '300000') ? '#eff6ff' : 'white',
                    color: '#374151',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                    fontWeight: (filters.minPrice === '100000' && filters.maxPrice === '300000') ? 600 : 400
                  }}
                  onMouseEnter={(e) => {
                    if (!(filters.minPrice === '100000' && filters.maxPrice === '300000')) {
                      e.target.style.background = '#f9fafb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!(filters.minPrice === '100000' && filters.maxPrice === '300000')) {
                      e.target.style.background = 'white';
                    }
                  }}
                >
                  100.000₫ đến 300.000₫
                </button>
                <button
                  onClick={() => {
                    handleFilterChange('minPrice', '300000');
                    handleFilterChange('maxPrice', '500000');
                  }}
                    style={{
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                    fontSize: 15,
                    background: (filters.minPrice === '300000' && filters.maxPrice === '500000') ? '#eff6ff' : 'white',
                    color: '#374151',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                    fontWeight: (filters.minPrice === '300000' && filters.maxPrice === '500000') ? 600 : 400
                  }}
                  onMouseEnter={(e) => {
                    if (!(filters.minPrice === '300000' && filters.maxPrice === '500000')) {
                      e.target.style.background = '#f9fafb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!(filters.minPrice === '300000' && filters.maxPrice === '500000')) {
                      e.target.style.background = 'white';
                    }
                  }}
                >
                  300.000₫ đến 500.000₫
                </button>
                <button
                  onClick={() => {
                    handleFilterChange('minPrice', '500000');
                    handleFilterChange('maxPrice', '');
                  }}
                style={{
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                    fontSize: 15,
                    background: (filters.minPrice === '500000' && !filters.maxPrice) ? '#eff6ff' : 'white',
                    color: '#374151',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                    fontWeight: (filters.minPrice === '500000' && !filters.maxPrice) ? 600 : 400
                  }}
                  onMouseEnter={(e) => {
                    if (!(filters.minPrice === '500000' && !filters.maxPrice)) {
                      e.target.style.background = '#f9fafb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!(filters.minPrice === '500000' && !filters.maxPrice)) {
                      e.target.style.background = 'white';
                    }
                  }}
                >
                  Trên 500.000₫
                </button>
            </div>
            </div>

          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1 }}>
          {/* Sort Bar */}
          <div style={{ 
            background: 'transparent', 
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
              <button 
                onClick={() => setViewMode('grid')}
                style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                  background: viewMode === 'grid' ? '#3b82f6' : 'white',
                  color: viewMode === 'grid' ? 'white' : '#374151',
                borderRadius: 6,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                title="Hiển thị dạng lưới"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                  <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                  <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                  <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
              <button 
                onClick={() => setViewMode('list')}
                style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                  background: viewMode === 'list' ? '#3b82f6' : 'white',
                  color: viewMode === 'list' ? 'white' : '#374151',
                borderRadius: 6,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                title="Hiển thị dạng danh sách"
              >
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

          {/* Products Grid/List */}
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
          ) : viewMode === 'grid' ? (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gap: 16
            }}>
              {products.map(product => (
                <div
                  key={product._id}
                  onClick={() => handleProductClick(product)}
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
                    <div style={{ padding: 8, backgroundColor: '#ffffff' }}>
                    <img
                        src={getImageUrl(product.imageUrls?.[0], '/default-product.svg')}
                      alt={product.name}
                      style={{
                        width: '100%',
                          height: 184,
                          objectFit: 'contain',
                          display: 'block',
                          borderRadius: 8,
                          backgroundColor: '#ffffff'
                        }}
                        onError={(e) => handleImageError(e, '/default-product.svg')}
                      />
                    </div>
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
                  
                  <div style={{ padding: 16 }}>
                    <h3 style={{
                      margin: '0 0 10px',
                      fontSize: 15,
                      fontWeight: 600,
                      color: '#1f2937',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: '42px'
                    }}>
                      {product.name}
                    </h3>
                    
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'baseline', 
                        gap: 6, 
                        marginBottom: 2,
                        flexWrap: 'wrap'
                      }}>
                        <span style={{ 
                          fontSize: 18, 
                          fontWeight: 700, 
                          color: '#dc2626',
                          lineHeight: 1.2
                        }}>
                          {formatPrice(product.price)}₫
                        </span>
                        <span style={{ fontSize: 13, color: '#6b7280' }}>
                          / {product.unit || 'cái'}
                        </span>
                      </div>
                      {product.discount > 0 && (
                        <div style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.2 }}>
                          <span style={{ textDecoration: 'line-through' }}>
                            {formatPrice(Math.round(product.price / (1 - product.discount / 100)))}₫
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div style={{ 
                      fontSize: 13, 
                      color: '#6b7280',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginBottom: 14
                    }}>
                      {product.categoryId?.name || 'Khác'}
                    </div>
                    
                    <button
                      onClick={(e) => handleBuyClick(e, product)}
                      style={{
                        width: '100%',
                        padding: '11px 16px',
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
          ) : (
            /* List View - 2 items per row */
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', 
              gap: 16 
            }}>
              {products.map(product => (
                <div
                  key={product._id}
                  onClick={() => handleProductClick(product)}
                  style={{
                    background: 'white',
                    borderRadius: 12,
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    display: 'flex',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  }}
                >
                  {/* Product Image */}
                  <div style={{ width: 200, flexShrink: 0, position: 'relative' }}>
                    <div style={{ padding: 8, backgroundColor: '#ffffff' }}>
                      <img
                        src={getImageUrl(product.imageUrls?.[0], '/default-product.svg')}
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: 184,
                          objectFit: 'contain',
                          display: 'block',
                          borderRadius: 8,
                          backgroundColor: '#ffffff'
                        }}
                        onError={(e) => handleImageError(e, '/default-product.svg')}
                      />
                    </div>
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
                  
                  {/* Product Info */}
                  <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{
                        margin: '0 0 10px',
                        fontSize: 18,
                        fontWeight: 600,
                        color: '#1f2937',
                        lineHeight: 1.4
                      }}>
                        {product.name}
                      </h3>
                      
                      <div style={{ 
                        fontSize: 13, 
                        color: '#6b7280', 
                        marginBottom: 12
                      }}>
                        {product.categoryId?.name || 'Khác'}
      </div>
                      
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'baseline', 
                          gap: 8, 
                          marginBottom: 4
                        }}>
                          <span style={{ 
                            fontSize: 24, 
                            fontWeight: 700, 
                            color: '#dc2626'
                          }}>
                            {formatPrice(product.price)}₫
                          </span>
                          <span style={{ fontSize: 14, color: '#6b7280' }}>
                            / {product.unit || 'cái'}
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
                    </div>
                    
                    <button
                      onClick={(e) => handleBuyClick(e, product)}
                      style={{
                        width: 'fit-content',
                        padding: '12px 32px',
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
          {/* Load more */}
          {products.length < total && (
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <button
                onClick={async () => {
                  setLoadingMore(true);
                  const next = page + 1;
                  setPage(next);
                  await fetchProducts({ reset: false, nextPage: next });
                }}
                disabled={loadingMore}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: '1px solid #3b82f6',
                  background: 'white',
                  color: '#1f2937',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                {loadingMore ? 'Đang tải...' : `Xem thêm ${Math.max(0, total - products.length)} sản phẩm còn lại`}
              </button>
              <div style={{ marginTop: 8, color: '#6b7280', fontSize: 13 }}>
                Đã hiển thị {products.length} / {total} sản phẩm
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recently Viewed Products */}
      {recentlyViewed.length > 0 && (
        <div style={{ padding: '40px 0', background: '#f3f4f6' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
            <div style={{ position: 'relative' }}>
              {/* Title */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <h2 style={{ 
                  fontSize: 24, 
                  fontWeight: 700, 
                  color: '#1f2937',
                  margin: 0
                }}>
                  Sản phẩm vừa xem
                </h2>
              </div>

              {/* Navigation buttons */}
              {totalPages > 1 && (
                <>
                  <button
                    onClick={() => handleRecentlyViewedScroll('prev')}
                    disabled={recentlyViewedScrollIndex === 0}
                    style={{
                      position: 'absolute',
                      left: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'white',
                      border: 'none',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                      borderRadius: '50%',
                      width: 52,
                      height: 52,
                      padding: 0,
                      lineHeight: '52px',
                      cursor: recentlyViewedScrollIndex === 0 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2,
                      fontSize: 22,
                      fontWeight: 700,
                      color: '#333',
                      opacity: recentlyViewedScrollIndex === 0 ? 0.5 : 1
                    }}
                  >
                    ‹
                  </button>
                  
                  <button
                    onClick={() => handleRecentlyViewedScroll('next')}
                    disabled={recentlyViewedScrollIndex === totalPages - 1}
                    style={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'white',
                      border: 'none',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                      borderRadius: '50%',
                      width: 52,
                      height: 52,
                      padding: 0,
                      lineHeight: '52px',
                      cursor: recentlyViewedScrollIndex === totalPages - 1 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2,
                      fontSize: 22,
                      fontWeight: 700,
                      color: '#333',
                      opacity: recentlyViewedScrollIndex === totalPages - 1 ? 0.5 : 1
                    }}
                  >
                    ›
                  </button>
                </>
              )}

              {/* Slider viewport */}
              <div style={{ overflow: 'hidden' }}>
                {/* Slider track */}
                <div style={{ 
                  display: 'flex', 
                  width: `${totalPages * 100}%`, 
                  transform: `translateX(-${recentlyViewedScrollIndex * (100 / totalPages)}%)`, 
                  transition: 'transform 400ms ease',
                  gap: 0
                }}>
                  {Array.from({ length: totalPages }, (_, pageIndex) => {
                    const pageProducts = recentlyViewed.slice(
                      pageIndex * itemsPerPage,
                      (pageIndex + 1) * itemsPerPage
                    );
                    
                    return (
                      <div key={pageIndex} style={{ flex: `0 0 ${100/totalPages}%`, padding: '0 2px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 20 }}>
                          {pageProducts.map((product) => (
                            <div 
                              key={product._id} 
                              onClick={() => handleProductClick(product)}
                              style={{ 
                                background: 'white', 
                                borderRadius: 16, 
                                padding: 16, 
                                boxShadow: '0 4px 16px rgba(0,0,0,0.08)', 
                                position: 'relative', 
                                cursor: 'pointer', 
                                transition: 'all 0.3s ease' 
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
                              }}
                            >
                              {product.discount && product.discount > 0 && (
                                <div style={{ position: 'absolute', top: 8, left: 8, background: '#ef4444', color: 'white', padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                                  -{product.discount}%
                                </div>
                              )}
                              <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                                <img 
                                  src={getImageUrl(product.images?.[0], '/default-product.png')} 
                                  alt={product.name} 
                                  style={{ maxWidth: '100%', maxHeight: 180, objectFit: 'contain' }}
                                  onError={handleImageError}
                                />
                              </div>
                              <div style={{ fontSize: 14, fontWeight: 600, minHeight: 44, color: '#0f172a', marginBottom: 10 }}>{product.name}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                <span style={{ color: '#0ea5e9', fontWeight: 800, fontSize: 16 }}>{formatPrice(product.price)}₫</span>
                                {product.originalPrice && product.originalPrice > product.price && (
                                  <span style={{ color: '#9ca3af', textDecoration: 'line-through', fontSize: 13 }}>{formatPrice(product.originalPrice)}₫</span>
                                )}
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBuyClick(e, product);
                                }}
                                style={{ 
                                  marginTop: 10, 
                                  width: '100%', 
                                  background: '#2563eb', 
                                  color: 'white', 
                                  border: 'none', 
                                  padding: '10px 12px', 
                                  borderRadius: 8, 
                                  cursor: 'pointer', 
                                  fontWeight: 600,
                                  transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.background = '#1d4ed8'}
                                onMouseLeave={(e) => e.target.style.background = '#2563eb'}
                              >
                                Chọn mua
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
