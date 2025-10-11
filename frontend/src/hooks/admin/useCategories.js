/**
 * Custom hook for managing categories
 * Handles CRUD operations for category management
 */

import { useState, useEffect } from 'react';
import { message } from 'antd';
import Swal from 'sweetalert2';
import api from '../../api/client.js';

const API_BASE_URL = 'http://localhost:5000/api';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching categories from:', `${API_BASE_URL}/categories/tree`);
      const response = await fetch(`${API_BASE_URL}/categories/tree`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }
      
      const data = await response.json();
      // API tree returns array directly with tree structure
      const categories = Array.isArray(data) ? data : [];
      setCategories(categories);
    } catch (err) {
      console.error('Fetch categories error:', err);
      setError(err.message);
      message.error(`Lỗi khi tải danh sách danh mục: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Create new category
  const createCategory = async (categoryData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/categories', categoryData);
      const newCategory = response.data;
      setCategories(prev => [...prev, newCategory]);
      
      // Show success message with SweetAlert2
      Swal.fire({
        title: 'Thành công!',
        text: 'Tạo danh mục thành công!',
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
      
      return newCategory;
    } catch (err) {
      setError(err.message);
      message.error(err.response?.data?.message || err.message || 'Lỗi khi tạo danh mục');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update category
  const updateCategory = async (id, categoryData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put(`/categories/${id}`, categoryData);
      const updatedCategory = response.data;
      setCategories(prev => 
        prev.map(cat => cat._id === id ? updatedCategory : cat)
      );
      
      // Show success message with SweetAlert2
      Swal.fire({
        title: 'Thành công!',
        text: 'Cập nhật danh mục thành công!',
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
      
      return updatedCategory;
    } catch (err) {
      setError(err.message);
      message.error(err.response?.data?.message || err.message || 'Lỗi khi cập nhật danh mục');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get delete info for category
  const getDeleteInfo = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/categories/${id}/delete-info`);
      return response.data;
    } catch (err) {
      setError(err.message);
      message.error(err.response?.data?.message || err.message || 'Lỗi khi lấy thông tin xóa');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete category with cascade
  const deleteCategory = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.delete(`/categories/${id}`);
      const result = response.data;
      
      // Show success message with SweetAlert2
      if (result.deletedCount > 1) {
        Swal.fire({
          title: 'Xóa thành công!',
          text: result.message,
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
      } else {
        Swal.fire({
          title: 'Xóa thành công!',
          text: 'Xóa danh mục thành công!',
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
      }
      
      // Refresh categories to reflect changes
      await fetchCategories();
    } catch (err) {
      setError(err.message);
      message.error(err.response?.data?.message || err.message || 'Lỗi khi xóa danh mục');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Convert flat categories to tree structure
  const buildCategoryTree = (categories) => {
    const categoryMap = new Map();
    const rootCategories = [];

    // First pass: create map of all categories
    categories.forEach(category => {
      categoryMap.set(category._id, {
        ...category,
        key: category._id,
        title: category.name,
        children: []
      });
    });

    // Second pass: build tree structure
    categories.forEach(category => {
      const categoryNode = categoryMap.get(category._id);
      
      if (category.parent) {
        const parent = categoryMap.get(category.parent);
        if (parent) {
          parent.children.push(categoryNode);
        }
      } else {
        rootCategories.push(categoryNode);
      }
    });

    return rootCategories;
  };

  // Get tree data for TreeSelect
  const getTreeSelectData = (categories) => {
    return categories.map(category => ({
      value: category._id,
      title: category.name,
      children: category.children ? getTreeSelectData(category.children) : []
    }));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getDeleteInfo,
    buildCategoryTree,
    getTreeSelectData
  };
};
