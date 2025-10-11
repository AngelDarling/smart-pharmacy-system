/**
 * Custom hook for managing users
 * Handles CRUD operations for user management
 */

import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import Swal from 'sweetalert2';
import api from '../../api/client.js';

const API_BASE_URL = 'http://localhost:5000/api';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });
  const [stats, setStats] = useState(null);

  // Fetch users with filters
  const fetchUsers = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      
      // Add pagination
      queryParams.append('page', filters.page || pagination.current);
      queryParams.append('limit', filters.limit || pagination.pageSize);
      
      // Add filters
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.role) queryParams.append('role', filters.role);
      if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive);
      if (filters.department) queryParams.append('department', filters.department);
      
      const response = await api.get(`/users?${queryParams}`);
      setUsers(response.data.items || []);
      setPagination(prev => ({
        ...prev,
        current: response.data.page || 1,
        total: response.data.total || 0
      }));
    } catch (err) {
      setError(err.message);
      message.error('Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize]);

  // Fetch user statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/users/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching user stats:', err);
    }
  }, []);

  // Create new user
  const createUser = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/users', userData);
      const newUser = response.data;
      setUsers(prev => [newUser, ...prev]);
      
      // Show success message with SweetAlert2
      Swal.fire({
        title: 'Thành công!',
        text: 'Tạo người dùng thành công!',
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
      
      return newUser;
    } catch (err) {
      setError(err.message);
      message.error(err.response?.data?.message || err.message || 'Lỗi khi tạo người dùng');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update user
  const updateUser = async (id, userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put(`/users/${id}`, userData);
      const updatedUser = response.data;
      setUsers(prev => 
        prev.map(user => user._id === id ? updatedUser : user)
      );
      
      // Show success message with SweetAlert2
      Swal.fire({
        title: 'Thành công!',
        text: 'Cập nhật người dùng thành công!',
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
      
      return updatedUser;
    } catch (err) {
      setError(err.message);
      message.error(err.response?.data?.message || err.message || 'Lỗi khi cập nhật người dùng');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const deleteUser = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      await api.delete(`/users/${id}`);
      setUsers(prev => prev.filter(user => user._id !== id));
      
      // Show success message with SweetAlert2
      Swal.fire({
        title: 'Xóa thành công!',
        text: 'Xóa người dùng thành công!',
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
      message.error(err.response?.data?.message || err.message || 'Lỗi khi xóa người dùng');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Toggle user status
  const toggleUserStatus = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.patch(`/users/${id}/toggle-status`);
      const result = response.data;
      
      setUsers(prev => 
        prev.map(user => 
          user._id === id ? { ...user, isActive: result.isActive } : user
        )
      );
      
      // Show success message with SweetAlert2
      Swal.fire({
        title: 'Cập nhật thành công!',
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
      
      return result;
    } catch (err) {
      setError(err.message);
      message.error(err.response?.data?.message || err.message || 'Lỗi khi thay đổi trạng thái');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Bulk update users
  const bulkUpdateUsers = async (userIds, updateData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put('/users/bulk-update', {
        userIds,
        updateData
      });
      
      // Refresh users list
      await fetchUsers();
      
      // Show success message with SweetAlert2
      Swal.fire({
        title: 'Cập nhật thành công!',
        text: response.data.message,
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

  // Get user by ID
  const getUserById = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (err) {
      setError(err.message);
      message.error('Lỗi khi tải thông tin người dùng');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Handle pagination change
  const handlePaginationChange = (page, pageSize) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }));
    fetchUsers({ page, limit: pageSize });
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
    
    fetchUsers(newFilters);
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [fetchUsers, fetchStats]);

  return {
    users,
    loading,
    error,
    pagination,
    stats,
    fetchUsers,
    fetchStats,
    createUser,
    updateUser,
    deleteUser,
    getUserById,
    toggleUserStatus,
    bulkUpdateUsers,
    handlePaginationChange,
    handleTableChange
  };
};
