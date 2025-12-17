/**
 * Custom hook for managing customers
 * Handles CRUD operations for customer management
 */

import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import Swal from 'sweetalert2';
import api from '../../api/client.js';

export const useCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });
  const [stats, setStats] = useState(null);

  // Fetch customers with filters
  const fetchCustomers = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      
      // Add pagination
      queryParams.append('page', filters.page || pagination.current);
      queryParams.append('limit', filters.limit || pagination.pageSize);
      
      // Add filters
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive);
      
      const response = await api.get(`/customers?${queryParams}`);
      setCustomers(response.data.items || []);
      setPagination(prev => ({
        ...prev,
        current: response.data.page || 1,
        total: response.data.total || 0
      }));
    } catch (err) {
      setError(err.message);
      message.error('Lỗi khi tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize]);

  // Fetch customer statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/customers/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching customer stats:', err);
    }
  }, []);

  // Create new customer
  const createCustomer = async (customerData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/customers', customerData);
      const newCustomer = response.data;
      setCustomers(prev => [newCustomer, ...prev]);
      
      Swal.fire({
        title: 'Thành công!',
        text: 'Tạo khách hàng thành công!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      return newCustomer;
    } catch (err) {
      setError(err.message);
      message.error(err.response?.data?.message || 'Lỗi khi tạo khách hàng');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update customer
  const updateCustomer = async (id, customerData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put(`/customers/${id}`, customerData);
      const updatedCustomer = response.data;
      setCustomers(prev => 
        prev.map(customer => customer._id === id ? updatedCustomer : customer)
      );
      
      Swal.fire({
        title: 'Thành công!',
        text: 'Cập nhật khách hàng thành công!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      return updatedCustomer;
    } catch (err) {
      setError(err.message);
      message.error(err.response?.data?.message || 'Lỗi khi cập nhật khách hàng');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete customer
  const deleteCustomer = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      await api.delete(`/customers/${id}`);
      setCustomers(prev => prev.filter(customer => customer._id !== id));
      
      Swal.fire({
        title: 'Xóa thành công!',
        text: 'Xóa khách hàng thành công!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      setError(err.message);
      message.error(err.response?.data?.message || 'Lỗi khi xóa khách hàng');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Toggle customer status
  const toggleCustomerStatus = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.patch(`/customers/${id}/status`);
      const result = response.data;
      
      setCustomers(prev => 
        prev.map(customer => 
          customer._id === id ? { ...customer, isActive: result.isActive } : customer
        )
      );
      
      Swal.fire({
        title: 'Cập nhật thành công!',
        text: result.message,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
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

  // Bulk update customers
  const bulkUpdateCustomers = async (customerIds, updateData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/customers/bulk/update', {
        customerIds,
        updateData
      });
      
      // Refresh customers list
      await fetchCustomers();
      
      Swal.fire({
        title: 'Cập nhật thành công!',
        text: response.data.message,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
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

  // Get customer by ID
  const getCustomerById = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/customers/${id}`);
      return response.data;
    } catch (err) {
      setError(err.message);
      message.error('Lỗi khi tải thông tin khách hàng');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Handle pagination change
  const handlePaginationChange = (page, pageSize) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }));
    fetchCustomers({ page, limit: pageSize });
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
    
    fetchCustomers(newFilters);
  };

  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, []);

  return {
    customers,
    loading,
    error,
    pagination,
    stats,
    fetchCustomers,
    fetchStats,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerById,
    toggleCustomerStatus,
    bulkUpdateCustomers,
    handlePaginationChange,
    handleTableChange
  };
};
