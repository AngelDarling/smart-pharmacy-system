import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SelectPurchaseModal from '../components/SelectPurchaseModal.jsx';

// Import product page components
import Breadcrumb from '../components/products/Breadcrumb.jsx';
import PageHeader from '../components/products/PageHeader.jsx';
import SubcategoriesGrid from '../components/products/SubcategoriesGrid.jsx';
import FiltersSidebar from '../components/products/FiltersSidebar.jsx';
import SortBar from '../components/products/SortBar.jsx';
import ProductsGrid from '../components/products/ProductsGrid.jsx';
import ProductsList from '../components/products/ProductsList.jsx';
import RecentlyViewedSection from '../components/products/RecentlyViewedSection.jsx';

export default function Products() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';

  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const productsRef = useRef([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
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
        return sorted;
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
      } else if (typeof direction === 'number') {
        newCurrent = direction;
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

  // Load recently viewed products from localStorage and validate them
  useEffect(() => {
    const saved = localStorage.getItem('recentlyViewed');
    if (saved) {
      try {
        const savedProducts = JSON.parse(saved);

        // Validate products against database
        const validateProducts = async () => {
          const validatedProducts = [];

          for (const product of savedProducts) {
            try {
              // Check if product still exists
              const response = await axios.get(`/api/products/slug/${product.slug}`);
              if (response.data) {
                // Product exists, add to valid list
                validatedProducts.push({
                  ...response.data,
                  discount: (response.data.discount && response.data.discount > 0) ? response.data.discount : 0
                });
              }
            } catch (error) {
              // Product doesn't exist (404) or error - skip it
              console.log(`Product ${product.slug} no longer exists, removing from recently viewed`);
            }
          }

          // Update state and localStorage with only valid products
          setRecentlyViewed(validatedProducts);
          localStorage.setItem('recentlyViewed', JSON.stringify(validatedProducts));
        };

        validateProducts();
      } catch (error) {
        console.error('Error parsing recently viewed products:', error);
        // Clear invalid data
        localStorage.removeItem('recentlyViewed');
      }
    }
  }, []);

  // Save product to recently viewed
  const addToRecentlyViewed = (product) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(p => p._id !== product._id);
      const updated = [product, ...filtered].slice(0, 10);
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
      return updated;
    });
  };

  // Handle scroll navigation
  const handleRecentlyViewedScroll = (direction) => {
    const itemsPerPage = 6;
    const totalPages = Math.ceil(recentlyViewed.length / itemsPerPage);

    if (direction === 'prev' && recentlyViewedScrollIndex > 0) {
      setRecentlyViewedScrollIndex(recentlyViewedScrollIndex - 1);
    } else if (direction === 'next' && recentlyViewedScrollIndex < totalPages - 1) {
      setRecentlyViewedScrollIndex(recentlyViewedScrollIndex + 1);
    }
  };

  // Fetch products (backend pagination)
  const fetchProducts = useCallback(async (opts = { reset: true, nextPage: 1 }) => {
    const { reset } = opts;
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

      let skip = 0;
      let pageLimit = initialLimit;

      if (reset) {
        skip = 0;
        pageLimit = initialLimit;
      } else {
        skip = productsRef.current.length;
        pageLimit = loadMoreLimit;
      }

      params.append('skip', String(skip));
      params.append('limit', String(pageLimit));

      console.log(`[Products] Fetching products: skip=${skip}, limit=${pageLimit}, category=${filters.category}, reset=${reset}`);
      const response = await axios.get(`/api/products?${params}`);
      const fetchedProducts = response.data.items || [];
      console.log(`[Products] Received ${fetchedProducts.length} products, total=${response.data.total}`);
      const sortedProducts = sortProducts(fetchedProducts, filters.sortBy);

      setTotal(response.data.total || 0);
      if (reset) {
        setProducts(sortedProducts);
        productsRef.current = sortedProducts;
        setPage(1);
      } else {
        setProducts((prev) => {
          const existingIds = new Set(prev.map(p => p._id || p.id));
          const newProducts = sortedProducts.filter(p => !existingIds.has(p._id || p.id));
          console.log(`[Products] Adding ${newProducts.length} new products (${sortedProducts.length} fetched, ${existingIds.size} existing)`);
          const updated = sortProducts([...prev, ...newProducts], filters.sortBy);
          productsRef.current = updated;
          return updated;
        });
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

      if (filters.category) {
        const findCategory = (cats, slug, path = []) => {
          for (const cat of cats) {
            if (cat.slug === slug) {
              setCurrentCategory(cat);
              setCategoryBreadcrumb([...path, cat]);

              if (cat.level === 0 && cat.children) {
                setSubCategories(cat.children);
                const pagination = {};
                cat.children.forEach(subCat => {
                  pagination[subCat._id] = { current: 0, total: Math.ceil((subCat.children?.length || 0) / 5) };
                });
                setSubCategoryPage(pagination);
              } else if (cat.level === 1 && cat.children) {
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
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', marginTop: 'auto' }}>
      <Breadcrumb categoryBreadcrumb={categoryBreadcrumb} query={query} />
      <PageHeader currentCategory={currentCategory} query={query} />

      <SubcategoriesGrid
        isLevel0Category={isLevel0Category}
        isLevel1Category={isLevel1Category}
        subCategories={subCategories}
        subCategoryPage={subCategoryPage}
        hoveredCard={hoveredCard}
        onHoveredCard={setHoveredCard}
        onSubCategoryPageChange={handleSubCategoryPageChange}
        getVisibleSubCategories={getVisibleSubCategories}
      />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px', display: 'flex', gap: 24 }}>
        <FiltersSidebar
          filters={filters}
          categories={categories}
          onFilterChange={handleFilterChange}
        />

        <div style={{ flex: 1 }}>
          <SortBar
            sortBy={filters.sortBy}
            viewMode={viewMode}
            onSortChange={(value) => handleFilterChange('sortBy', value)}
            onViewModeChange={setViewMode}
          />

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
          {viewMode === 'grid' ? (
            <ProductsGrid
              products={products}
              loading={loading}
              onProductClick={handleProductClick}
              onBuyClick={handleBuyClick}
              formatPrice={formatPrice}
              formatDiscountAmount={formatDiscountAmount}
              capitalizeFirstLetter={capitalizeFirstLetter}
            />
          ) : (
            <ProductsList
              products={products}
              loading={loading}
              onProductClick={handleProductClick}
              onBuyClick={handleBuyClick}
              formatPrice={formatPrice}
              formatDiscountAmount={formatDiscountAmount}
              capitalizeFirstLetter={capitalizeFirstLetter}
            />
          )}

          {/* Load more */}
          {products.length < total && (
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <button
                onClick={async () => {
                  setLoadingMore(true);
                  const currentPage = Math.ceil(products.length / initialLimit);
                  const next = currentPage + 1;
                  await fetchProducts({ reset: false, nextPage: next });
                  setPage(next);
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

      <RecentlyViewedSection
        recentlyViewed={recentlyViewed}
        scrollIndex={recentlyViewedScrollIndex}
        onScroll={handleRecentlyViewedScroll}
        onProductClick={handleProductClick}
        onBuyClick={handleBuyClick}
        formatPrice={formatPrice}
        formatDiscountAmount={formatDiscountAmount}
      />

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
