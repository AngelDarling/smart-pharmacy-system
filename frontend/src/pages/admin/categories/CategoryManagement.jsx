/**
 * Category Management Page
 * Modern tree-based interface for managing product categories
 */

import React, { useState, useEffect } from 'react';
import {
  Tree,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  message,
  Popconfirm,
  Tooltip,
  Tag,
  Row,
  Col,
  Divider,
  Badge,
  Avatar,
  Dropdown,
  Menu
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  SearchOutlined,
  ReloadOutlined,
  MoreOutlined,
  SettingOutlined,
  EyeOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useCategories } from '../../../hooks/admin/useCategories';
import CategoryForm from '../../../components/admin/CategoryForm';
import '../../../styles/sweetalert2-custom.css';

const { Search } = Input;
const { Option } = Select;

const CategoryManagement = () => {
  const {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getDeleteInfo,
    buildCategoryTree
  } = useCategories();

  const [treeData, setTreeData] = useState([]);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [parentCategory, setParentCategory] = useState(null);
  const [levelFilter, setLevelFilter] = useState('all'); // 'all', '0', '1', '2', etc.
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteInfo, setDeleteInfo] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);


  // Build tree data when categories change
  useEffect(() => {
    try {
      if (categories && Array.isArray(categories) && categories.length > 0) {
        // API tree already returns tree structure, no need to rebuild
        setTreeData(categories);
        
        // Auto expand all nodes
        const allKeys = getAllKeys(categories);
        setExpandedKeys(allKeys);
      } else {
        setTreeData([]);
        setExpandedKeys([]);
      }
    } catch (error) {
      console.error('Error building tree data:', error);
      setTreeData([]);
      setExpandedKeys([]);
    }
  }, [categories]);

  // Get all keys for auto-expand
  const getAllKeys = (data) => {
    try {
      let keys = [];
      if (data && Array.isArray(data)) {
        data.forEach(item => {
          if (!item) return;
          const k = item.key || item._id || item.id;
          if (k) keys.push(k);
          if (item.children && item.children.length > 0) {
            keys = keys.concat(getAllKeys(item.children));
          }
        });
      }
      return keys;
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  };

  // Count all categories including children
  const getAllCategoriesCount = (data) => {
    try {
      let count = 0;
      if (data && Array.isArray(data)) {
        data.forEach(item => {
          if (item) {
            count++;
            if (item.children && item.children.length > 0) {
              count += getAllCategoriesCount(item.children);
            }
          }
        });
      }
      return count;
    } catch (error) {
      console.error('Error counting categories:', error);
      return 0;
    }
  };

  // Filter tree data based on search
  const filterTreeData = (data, searchText) => {
    try {
      if (!searchText || !data || !Array.isArray(data)) return data || [];
      
      return data.filter(item => {
        if (!item) return false;
        const matches = item.name && item.name.toLowerCase().includes(searchText.toLowerCase());
        const hasMatchingChildren = item.children && 
          filterTreeData(item.children, searchText).length > 0;
        
        return matches || hasMatchingChildren;
      }).map(item => ({
        ...item,
        children: item.children ? filterTreeData(item.children, searchText) : []
      }));
    } catch (error) {
      console.error('Error filtering tree data:', error);
      return data || [];
    }
  };

  // Filter tree data based on level
  const filterTreeDataByLevel = (data, level) => {
    try {
      if (level === 'all' || !data || !Array.isArray(data)) return data || [];

      const targetLevel = parseInt(level, 10);
      const includeChildren = false; // Luôn chỉ hiển thị đúng level được chọn
      const result = [];

      const traverse = (nodes) => {
        if (!nodes) return;
        nodes.forEach((node) => {
          if (!node) return;
          if ((node.level || 0) === targetLevel) {
            result.push({
              ...node,
              // nếu level 0 thì ẩn children; level > 0 có thể giữ subtree để có ngữ cảnh
              children: includeChildren ? (node.children || []) : []
            });
          }
          if (node.children && node.children.length > 0) {
            traverse(node.children);
          }
        });
      };

      traverse(data);
      return result;
    } catch (error) {
      console.error('Error filtering tree data by level:', error);
      return data || [];
    }
  };

  // Filter tree data based on status
  const filterTreeDataByStatus = (data, status) => {
    try {
      if (status === 'all' || !data || !Array.isArray(data)) return data || [];
      
      return data.filter(item => {
        if (!item) return false;
        if (status === 'active') return item.isActive === true;
        if (status === 'inactive') return item.isActive === false;
        return true;
      });
    } catch (error) {
      console.error('Error filtering tree data by status:', error);
      return data || [];
    }
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchValue(value);
  };

  // Handle add category
  const handleAddCategory = (parentCategoryData = null) => {
    setEditingCategory(null);
    setParentCategory(parentCategoryData);
    setIsModalVisible(true);
  };

  // Handle edit category
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setIsModalVisible(true);
  };

  // Handle delete category - show confirmation modal first
  const handleDeleteCategory = async (category) => {
    try {
      // Get delete info to show confirmation
      const info = await getDeleteInfo(category._id);
      setDeleteInfo(info);
      setDeletingCategory(category);
      setDeleteModalVisible(true);
    } catch (error) {
      console.error('Error getting delete info:', error);
    }
  };

  // Confirm delete category
  const confirmDeleteCategory = async () => {
    try {
      await deleteCategory(deletingCategory._id);
      setDeleteModalVisible(false);
      setDeleteInfo(null);
      setDeletingCategory(null);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setDeleteInfo(null);
    setDeletingCategory(null);
  };

  // Handle form submit
  const handleFormSubmit = async (values) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory._id, values);
      } else {
        await createCategory(values);
      }
      setIsModalVisible(false);
      setEditingCategory(null);
      await fetchCategories();
    } catch (error) {
      console.error('Form submit error:', error);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingCategory(null);
    setParentCategory(null);
  };

  // Tree title render
  const renderTreeTitle = (nodeData) => {
    try {
      const { name, isActive, level, slug, description, iconUrl } = nodeData;
      
      const actionMenu = [
        {
          key: 'add',
          icon: <PlusOutlined />,
          label: 'Thêm danh mục con',
          onClick: () => handleAddCategory(nodeData)
        },
        {
          key: 'edit',
          icon: <EditOutlined />,
          label: 'Chỉnh sửa',
          onClick: () => handleEditCategory(nodeData)
        },
        {
          key: 'view',
          icon: <EyeOutlined />,
          label: 'Xem chi tiết',
          onClick: () => console.log('View category:', nodeData)
        },
        {
          type: 'divider'
        },
        {
          key: 'delete',
          icon: <DeleteOutlined />,
          label: 'Xóa danh mục',
          danger: true,
          onClick: () => handleDeleteCategory(nodeData)
        }
      ];
      
      return (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          width: '100%',
          padding: '8px 12px',
          borderRadius: '6px',
          background: isActive ? '#f6ffed' : '#fff2f0',
          border: `1px solid ${isActive ? '#b7eb8f' : '#ffccc7'}`,
          transition: 'all 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Avatar 
              size="small" 
              icon={level === 0 ? <FolderOpenOutlined /> : <FolderOutlined />}
              style={{ 
                backgroundColor: isActive ? '#52c41a' : '#ff4d4f',
                marginRight: 12
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 500, 
                color: '#262626',
                marginBottom: 2
              }}>
                {name || 'Unknown'}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#8c8c8c',
                marginBottom: 4
              }}>
                {slug && `/${slug}`}
              </div>
              {description && (
                <div style={{ 
                  fontSize: '11px', 
                  color: '#8c8c8c',
                  fontStyle: 'italic'
                }}>
                  {description.length > 50 ? `${description.substring(0, 50)}...` : description}
                </div>
              )}
            </div>
            <Space size={4}>
              <Badge 
                status={isActive ? 'success' : 'error'} 
                text={
                  <Tag 
                    color={isActive ? 'green' : 'red'} 
                    size="small"
                    style={{ margin: 0 }}
                  >
                    {isActive ? 'Hoạt động' : 'Tạm dừng'}
                  </Tag>
                } 
              />
              <Tag color="blue" size="small">
                Level {level || 0}
              </Tag>
            </Space>
          </div>
          <Space size={4} onClick={(e) => e.stopPropagation()}>
            <Tooltip title="Thêm danh mục con">
              <Button
                type="text"
                size="small"
                shape="circle"
                icon={<PlusOutlined />}
                onClick={() => handleAddCategory(nodeData)}
                style={{ 
                  color: '#52c41a',
                  border: '1px solid #b7eb8f'
                }}
              />
            </Tooltip>
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                size="small"
                shape="circle"
                icon={<EditOutlined />}
                onClick={() => handleEditCategory(nodeData)}
                style={{ 
                  color: '#1890ff',
                  border: '1px solid #91d5ff'
                }}
              />
            </Tooltip>
            <Dropdown menu={{ items: actionMenu }} trigger={['click']}>
              <Button
                type="text"
                size="small"
                shape="circle"
                icon={<MoreOutlined />}
                style={{ 
                  color: '#8c8c8c',
                  border: '1px solid #d9d9d9'
                }}
              />
            </Dropdown>
          </Space>
        </div>
      );
    } catch (error) {
      console.error('Error rendering tree title:', error, nodeData);
      return <span>Error: {nodeData?.name || 'Unknown'}</span>;
    }
  };

  // Process tree data for display
  const processedTreeData = (treeData || []).map(item => {
    try {
      if (!item) return null;
      return {
        ...item,
        key: item.key || item._id || item.id,
        title: renderTreeTitle(item),
        children: item.children ? item.children.map(child => ({
          ...child,
          key: child.key || child._id || child.id,
          title: renderTreeTitle(child),
          children: child.children ? child.children.map(grandChild => ({
            ...grandChild,
            key: grandChild.key || grandChild._id || grandChild.id,
            title: renderTreeTitle(grandChild)
          })) : []
        })) : []
      };
    } catch (error) {
      console.error('Error processing tree item:', error, item);
      return {
        ...item,
        title: <span>Error: {item?.name || 'Unknown'}</span>,
        children: []
      };
    }
  }).filter(Boolean);

  // Auto expand all nodes when showing all levels
  useEffect(() => {
    try {
      if (levelFilter === 'all') {
        const all = getAllKeys(treeData);
        setExpandedKeys(all);
      }
    } catch (e) {
      // noop
    }
  }, [levelFilter, treeData]);

  // Apply filters in order: level -> status -> search
  let filteredTreeData = processedTreeData;
  
  if (levelFilter !== 'all') {
    filteredTreeData = filterTreeDataByLevel(filteredTreeData, levelFilter);
  }
  
  if (statusFilter !== 'all') {
    filteredTreeData = filterTreeDataByStatus(filteredTreeData, statusFilter);
  }
  
  if (searchValue) {
    filteredTreeData = filterTreeData(filteredTreeData, searchValue);
  }

  try {
    return (
      <div>
        {/* Header Section */}
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              size="large" 
              icon={<FolderOutlined />}
              style={{ 
                backgroundColor: '#1890ff',
                marginRight: '16px'
              }}
            />
            <div>
              <h2 style={{ margin: 0, color: '#262626' }}>
                Quản lý Danh mục Sản phẩm
              </h2>
              <div style={{ color: '#8c8c8c', fontSize: '14px' }}>
                Quản lý cấu trúc phân cấp danh mục sản phẩm
              </div>
            </div>
          </div>
          <Space size="middle">
            <Tooltip title="Làm mới dữ liệu">
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchCategories}
                loading={loading}
                shape="circle"
                size="large"
              />
            </Tooltip>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleAddCategory()}
              size="large"
              style={{
                borderRadius: '8px',
                height: '40px',
                paddingLeft: '20px',
                paddingRight: '20px',
                fontWeight: 500
              }}
            >
              Thêm danh mục gốc
            </Button>
          </Space>
        </div>

        {/* Search and Filter Section */}
        <div style={{ 
          display: 'flex',
          gap: 16,
          marginBottom: 24,
          flexWrap: 'wrap',
          alignItems: 'end'
        }}>
          <Search
            placeholder="Tìm kiếm danh mục theo tên, slug..."
            allowClear
            onSearch={handleSearch}
            size="large"
            style={{ flex: '1 1 250px' }}
            prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
          />
          <Select
            placeholder="Lọc theo level"
            value={levelFilter}
            onChange={setLevelFilter}
            size="large"
            style={{ flex: '1 1 200px' }}
            allowClear
          >
            <Option value="all">Tất cả level</Option>
            <Option value="0">Level 0 (Gốc)</Option>
            <Option value="1">Level 1</Option>
            <Option value="2">Level 2</Option>
            <Option value="3">Level 3</Option>
          </Select>
          <Select
            placeholder="Lọc theo trạng thái"
            value={statusFilter}
            onChange={setStatusFilter}
            size="large"
            style={{ flex: '1 1 200px' }}
            allowClear
          >
            <Option value="all">Tất cả trạng thái</Option>
            <Option value="active">Hoạt động</Option>
            <Option value="inactive">Tạm dừng</Option>
          </Select>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            color: '#8c8c8c',
            fontSize: '14px',
            flex: '1 1 200px'
          }}>
            <FileTextOutlined style={{ marginRight: '8px' }} />
            Tổng cộng: <strong style={{ color: '#262626', marginLeft: '4px' }}>
              {getAllCategoriesCount(categories)} danh mục
            </strong>
          </div>
        </div>

        {/* Tree Section */}
        <div style={{ 
          minHeight: '500px',
          background: '#fafafa',
          borderRadius: '8px',
          padding: '16px',
          border: '1px solid #f0f0f0'
        }}>
          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '80px 20px',
              color: '#8c8c8c'
            }}>
              <ReloadOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
              <div style={{ fontSize: '16px' }}>Đang tải danh mục...</div>
            </div>
          ) : error ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '80px 20px',
              color: '#ff4d4f'
            }}>
              <DeleteOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
              <div style={{ fontSize: '16px', marginBottom: '16px' }}>
                Lỗi: {error}
              </div>
              <Button 
                type="primary" 
                onClick={fetchCategories}
                icon={<ReloadOutlined />}
              >
                Thử lại
              </Button>
            </div>
          ) : !filteredTreeData || filteredTreeData.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '80px 20px',
              color: '#8c8c8c'
            }}>
              <FolderOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
              <div style={{ fontSize: '16px', marginBottom: '16px' }}>
                {searchValue ? 'Không tìm thấy danh mục phù hợp' : 'Chưa có danh mục nào'}
              </div>
              <Button 
                type="primary" 
                onClick={() => handleAddCategory()}
                icon={<PlusOutlined />}
                size="large"
              >
                {searchValue ? 'Tạo danh mục mới' : 'Thêm danh mục đầu tiên'}
              </Button>
            </div>
          ) : (
            <Tree
              treeData={filteredTreeData}
              expandedKeys={expandedKeys || []}
              selectedKeys={selectedKeys || []}
              onExpand={setExpandedKeys}
              onSelect={setSelectedKeys}
              showLine={{ showLeafIcon: false }}
              showIcon={false}
              defaultExpandAll
              style={{
                background: 'transparent'
              }}
            />
          )}
        </div>

        {/* Category Form Modal */}
        <CategoryForm
          visible={isModalVisible}
          onCancel={handleModalClose}
          onSubmit={handleFormSubmit}
          initialValues={editingCategory}
          isEditing={!!editingCategory}
          categories={categories}
          parentCategory={parentCategory}
        />

        {/* Delete Confirmation Modal */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <DeleteOutlined style={{ color: '#ff4d4f', marginRight: '8px' }} />
              Xác nhận xóa danh mục
            </div>
          }
          open={deleteModalVisible}
          onOk={confirmDeleteCategory}
          onCancel={cancelDelete}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ 
            danger: true,
            loading: loading
          }}
          width={600}
        >
          {deleteInfo && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '16px', marginBottom: '8px' }}>
                  Bạn có chắc chắn muốn xóa danh mục <strong>"{deleteInfo.category.name}"</strong>?
                </p>
                
                {deleteInfo.hasChildren ? (
                  <div style={{ 
                    background: '#fff2f0', 
                    border: '1px solid #ffccc7', 
                    borderRadius: '6px', 
                    padding: '16px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <DeleteOutlined style={{ color: '#ff4d4f', marginRight: '8px' }} />
                      <strong style={{ color: '#ff4d4f' }}>Cảnh báo:</strong>
                    </div>
                    <p style={{ margin: 0, color: '#262626' }}>
                      Danh mục này có <strong>{deleteInfo.childrenCount}</strong> danh mục con. 
                      Khi xóa danh mục cha, tất cả danh mục con cũng sẽ bị xóa theo.
                    </p>
                    <p style={{ margin: '8px 0 0 0', color: '#8c8c8c', fontSize: '14px' }}>
                      Tổng cộng sẽ xóa: <strong>{deleteInfo.totalToDelete}</strong> danh mục
                    </p>
                  </div>
                ) : (
                  <div style={{ 
                    background: '#f6ffed', 
                    border: '1px solid #b7eb8f', 
                    borderRadius: '6px', 
                    padding: '16px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <EyeOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                      <span style={{ color: '#52c41a' }}>
                        Danh mục này không có danh mục con.
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div style={{ 
                background: '#fafafa', 
                border: '1px solid #d9d9d9', 
                borderRadius: '6px', 
                padding: '12px',
                fontSize: '14px'
              }}>
                <div style={{ marginBottom: '4px' }}>
                  <strong>Tên:</strong> {deleteInfo.category.name}
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <strong>Slug:</strong> /{deleteInfo.category.slug}
                </div>
                {deleteInfo.category.description && (
                  <div>
                    <strong>Mô tả:</strong> {deleteInfo.category.description}
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    );
  } catch (error) {
    console.error('Error in CategoryManagement render:', error);
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ padding: '50px', color: '#ff4d4f' }}>
          <h3>Lỗi khi tải trang</h3>
          <p>Vui lòng thử lại sau</p>
          <Button 
            type="primary" 
            onClick={() => window.location.reload()}
            style={{ marginTop: 16 }}
          >
            Tải lại trang
          </Button>
        </div>
      </div>
    );
  }
};

export default CategoryManagement;
