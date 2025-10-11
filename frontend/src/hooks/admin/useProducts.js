/**
 * Custom hook for managing products
 * Handles CRUD operations for product management with variants
 */

import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import Swal from 'sweetalert2';
import api from '../../api/client.js';

const API_BASE_URL = 'http://localhost:5000/api';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // Fetch products with filters
  const fetchProducts = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      
      // Add pagination
      queryParams.append('page', filters.page || pagination.current);
      queryParams.append('limit', filters.limit || pagination.pageSize);
      
      // Add filters
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.productType) queryParams.append('productType', filters.productType);
      if (filters.categoryId) queryParams.append('categoryId', filters.categoryId);
      if (filters.brandId) queryParams.append('brandId', filters.brandId);
      if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
      
      const response = await fetch(`${API_BASE_URL}/products?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      console.log('Products API response:', data);
      // Handle both array and object response formats
      const products = Array.isArray(data) ? data : (data.products || data.items || []);
      setProducts(products);
      setPagination(prev => ({
        ...prev,
        current: data.page || 1,
        total: data.total || 0
      }));
    } catch (err) {
      setError(err.message);
      message.error('Lỗi khi tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize]);

  // Create new product
  const createProduct = async (productData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/products', productData);
      const newProduct = response.data;
      setProducts(prev => [newProduct, ...prev]);
      
      // Show success message with SweetAlert2
      Swal.fire({
        title: 'Thành công!',
        text: 'Tạo sản phẩm thành công!',
        icon: 'success',
        timer: 5000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        customClass: {
          popup: 'swal2-popup-custom'
        }
      });
      
      return newProduct;
    } catch (err) {
      setError(err.message);
      message.error(err.response?.data?.message || err.message || 'Lỗi khi tạo sản phẩm');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update product
  const updateProduct = async (id, productData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put(`/products/${id}`, productData);
      const updatedProduct = response.data;
      setProducts(prev => 
        prev.map(product => product._id === id ? updatedProduct : product)
      );
      
      // Show success message with SweetAlert2
      Swal.fire({
        title: 'Thành công!',
        text: 'Cập nhật sản phẩm thành công!',
        icon: 'success',
        timer: 5000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        customClass: {
          popup: 'swal2-popup-custom'
        }
      });
      
      return updatedProduct;
    } catch (err) {
      setError(err.message);
      message.error(err.response?.data?.message || err.message || 'Lỗi khi cập nhật sản phẩm');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const deleteProduct = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      await api.delete(`/products/${id}`);
      setProducts(prev => prev.filter(product => product._id !== id));
      
      // Show success message with SweetAlert2
      Swal.fire({
        title: 'Xóa thành công!',
        text: 'Xóa sản phẩm thành công!',
        icon: 'success',
        timer: 5000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        customClass: {
          popup: 'swal2-popup-custom'
        }
      });
    } catch (err) {
      setError(err.message);
      message.error(err.response?.data?.message || err.message || 'Lỗi khi xóa sản phẩm');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get product by ID
  const getProductById = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      
      const product = await response.json();
      return product;
    } catch (err) {
      setError(err.message);
      message.error('Lỗi khi tải thông tin sản phẩm');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get brands for select options
  const fetchBrands = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/brands`);
      if (!response.ok) {
        throw new Error('Failed to fetch brands');
      }
      return await response.json();
    } catch (err) {
      message.error('Lỗi khi tải danh sách thương hiệu');
      return [];
    }
  };

  // Get attributes for select options
  const fetchAttributes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/attributes`);
      if (!response.ok) {
        throw new Error('Failed to fetch attributes');
      }
      return await response.json();
    } catch (err) {
      message.error('Lỗi khi tải danh sách thuộc tính');
      return [];
    }
  };

  // Get active substances for drug products
  const fetchActiveSubstances = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/active-substances`);
      if (!response.ok) {
        throw new Error('Failed to fetch active substances');
      }
      return await response.json();
    } catch (err) {
      message.error('Lỗi khi tải danh sách hoạt chất');
      return [];
    }
  };

  // Handle pagination change
  const handlePaginationChange = (page, pageSize) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }));
    fetchProducts({ page, limit: pageSize });
  };

  // Handle table change (sorting, filtering)
  const handleTableChange = (pagination, filters, sorter) => {
    const newFilters = {
      ...filters,
      page: pagination.current,
      limit: pagination.pageSize
    };
    
    if (sorter.field) {
      newFilters.sortBy = sorter.order === 'ascend' ? sorter.field : `-${sorter.field}`;
    }
    
    fetchProducts(newFilters);
  };

  // Update product stock
  const updateProductStock = async (id, stockData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put(`/products/${id}/stock`, stockData);
      const updatedProduct = response.data;
      setProducts(prev => 
        prev.map(product => product._id === id ? updatedProduct : product)
      );
      
      // Show success message with SweetAlert2
      Swal.fire({
        title: 'Cập nhật thành công!',
        text: 'Cập nhật tồn kho thành công!',
        icon: 'success',
        timer: 5000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        customClass: {
          popup: 'swal2-popup-custom'
        }
      });
      
      return updatedProduct;
    } catch (err) {
      setError(err.message);
      message.error(err.response?.data?.message || err.message || 'Lỗi khi cập nhật tồn kho');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update product status
  const updateProductStatus = async (id, status) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put(`/products/${id}/status`, { isActive: status });
      const updatedProduct = response.data;
      setProducts(prev => 
        prev.map(product => product._id === id ? updatedProduct : product)
      );
      
      // Show success message with SweetAlert2
      Swal.fire({
        title: 'Cập nhật thành công!',
        text: `Sản phẩm đã ${status ? 'kích hoạt' : 'tạm dừng'} thành công!`,
        icon: 'success',
        timer: 5000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        customClass: {
          popup: 'swal2-popup-custom'
        }
      });
      
      return updatedProduct;
    } catch (err) {
      setError(err.message);
      message.error(err.response?.data?.message || err.message || 'Lỗi khi cập nhật trạng thái');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Bulk update products
  const bulkUpdateProducts = async (productIds, updateData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put('/products/bulk-update', {
        productIds,
        updateData
      });
      
      // Refresh products list
      await fetchProducts();
      
      // Show success message with SweetAlert2
      Swal.fire({
        title: 'Cập nhật thành công!',
        text: `Đã cập nhật ${productIds.length} sản phẩm thành công!`,
        icon: 'success',
        timer: 5000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        customClass: {
          popup: 'swal2-popup-custom'
        }
      });
      
      return response.data;
    } catch (err) {
      setError(err.message);
      message.error(err.response?.data?.message || err.message || 'Lỗi khi cập nhật hàng loạt');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    pagination,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    fetchBrands,
    fetchAttributes,
    fetchActiveSubstances,
    updateProductStock,
    updateProductStatus,
    bulkUpdateProducts,
    handlePaginationChange,
    handleTableChange
  };
};
