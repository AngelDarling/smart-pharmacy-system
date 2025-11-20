/**
 * Custom hook for managing staff
 * Handles CRUD operations for staff management
 */

import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import Swal from 'sweetalert2';
import api from '../../api/client.js';

export const useStaff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });
  const [stats, setStats] = useState(null);

  // Fetch staff with filters
  const fetchStaff = useCallback(async (filters = {}) => {
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
      
      const response = await api.get(`/staff?${queryParams}`);
      setStaff (response.data.items || []);
      setPagination(prev => ({
        ...prev,
        current: response.data.page || 1,
        total: response.data.total || 0
      }));
    } catch (err) {
      setError(err.message);
      message.error('Lỗi khi tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize]);

  // Fetch staff statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/staff/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching staff stats:', err);
    }
  }, []);

  // Create new staff
  const createStaff = async (staffData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/staff', staffData);
      const newStaff = response.data;
      setStaff(prev => [newStaff, ...prev]);
      
      Swal.fire({
        title: 'Thành công!',
        text: 'Tạo nhân viên thành công!',
        icon: 'success',
        timer: 5000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
      
      return newStaff;
    } catch (err) {
      setError(err.message);
      message.error(err.response?.data?.message || 'Lỗi khi tạo nhân viên');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update staff
  const updateStaff = async (id, staffData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put(`/staff/${id}`, staffData);
      const updatedStaff = response.data;
      setStaff(prev => 
        prev.map(s => s._id === id ? updatedStaff : s)
      );
      
      Swal.fire({
        title: 'Thành công!',
        text: 'Cập nhật nhân viên thành công!',
        icon: 'success',
        timer: 5000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
      
      return updatedStaff;
    } catch (err) {
      setError(err.message);
      message.error(err.response?.data?.message || 'Lỗi khi cập nhật nhân viên');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update staff role
  const updateStaffRole = async (id, role) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put(`/staff/${id}/role`, { role });
      const updatedStaff = response.data;
      setStaff(prev => 
        prev.map(s => s._id === id ? updatedStaff : s)
      );
      
      Swal.fire({
        title: 'Thành công!',
        text: 'Cập nhật vai trò thành công!',
        icon: 'success',
        timer: 5000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
      
      return updatedStaff;
    } catch (err) {
      setError(err.message);
      message.error(err.response?.data?.message || 'Lỗi khi cập nhật vai trò');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete staff
  const deleteStaff = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      await api.delete(`/staff/${id}`);
      setStaff(prev => prev.filter(s => s._id !== id));
      
      Swal.fire({
        title: 'Xóa thành công!',
        text: 'Xóa nhân viên thành công!',
        icon: 'success',
        timer: 5000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    } catch (err) {
      setError(err.message);
      message.error(err.response?.data?.message || 'Lỗi khi xóa nhân viên');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Toggle staff status
  const toggleStaffStatus = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.patch(`/staff/${id}/status`);
      const result = response.data;
      
      setStaff(prev => 
        prev.map(s => 
          s._id === id ? { ...s, isActive: result.isActive } : s
        )
      );
      
      Swal.fire({
        title: 'Cập nhật thành công!',
        text: result.message,
        icon: 'success',
        timer: 5000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
      
      return result;
    } catch (err) {
      setError(err.message);
      message.error(err.response?.data?.message || 'Lỗi khi thay đổi trạng thái');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Bulk update staff
  const bulkUpdateStaff = async (staffIds, updateData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/staff/bulk/update', {
        staffIds,
        updateData
      });
      
      // Refresh staff list
      await fetchStaff();
      
      Swal.fire({
        title: 'Cập nhật thành công!',
        text: response.data.message,
        icon: 'success',
        timer: 5000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
      
      return response.data;
    } catch (err) {
      setError(err.message);
      message.error(err.response?.data?.message || 'Lỗi khi cập nhật hàng loạt');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get staff by ID
  const getStaffById = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/staff/${id}`);
      return response.data;
    } catch (err) {
      setError(err.message);
      message.error('Lỗi khi tải thông tin nhân viên');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Handle pagination change
  const handlePaginationChange = (page, pageSize) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }));
    fetchStaff({ page, limit: pageSize });
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
    
    fetchStaff(newFilters);
  };

  useEffect(() => {
    fetchStaff();
    fetchStats();
  }, [fetchStaff, fetchStats]);

  return {
    users: staff, // Keep as 'users' for compatibility with existing components
    staff,
    loading,
    error,
    pagination,
    stats,
    fetchUsers: fetchStaff,
    fetchStaff,
    fetchStats,
    createUser: createStaff,
    createStaff,
    updateUser: updateStaff,
    updateStaff,
    updateStaffRole,
    deleteUser: deleteStaff,
    deleteStaff,
    getUserById: getStaffById,
    getStaffById,
    toggleUserStatus: toggleStaffStatus,
    toggleStaffStatus,
    bulkUpdateUsers: bulkUpdateStaff,
    bulkUpdateStaff,
    handlePaginationChange,
    handleTableChange
  };
};
