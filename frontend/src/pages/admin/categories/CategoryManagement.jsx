/**
 * Category Management Page
 * Table-based interface for managing product categories with hierarchical display
 */

import React, { useState, useEffect } from 'react';
import {
  Table,
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
import { usePermissions } from '../../../hooks/usePermissions';
import '../../../styles/sweetalert2-custom.css';

const { Search } = Input;
const { Option } = Select;

const CategoryManagement = () => {
  const { permissions } = usePermissions();
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
  const [flatData, setFlatData] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [parentCategory, setParentCategory] = useState(null);
  const [levelFilter, setLevelFilter] = useState('all'); // 'all', '0', '1', '2', etc.
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteInfo, setDeleteInfo] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });


  // Flatten tree data to flat list for table display
  const flattenTree = (nodes, level = 0, parentPath = []) => {
    let result = [];
    if (!nodes || !Array.isArray(nodes)) return result;

    nodes.forEach((node) => {
      if (!node) return;

      const flatNode = {
        ...node,
        key: node.key || node._id || node.id,
        level: level,
        parentPath: parentPath,
        indent: level * 24 // 24px per level for indentation
      };

      result.push(flatNode);

      if (node.children && node.children.length > 0) {
        const childNodes = flattenTree(node.children, level + 1, [...parentPath, node.name]);
        result = result.concat(childNodes);
      }
    });

    return result;
  };

  // Build tree data and flat data when categories change
  useEffect(() => {
    try {
      if (categories && Array.isArray(categories) && categories.length > 0) {
        // API tree already returns tree structure
        setTreeData(categories);

        // Flatten tree for table display
        const flattened = flattenTree(categories);
        setFlatData(flattened);
      } else {
        setTreeData([]);
        setFlatData([]);
      }
    } catch (error) {
      console.error('Error building tree data:', error);
      setTreeData([]);
      setFlatData([]);
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

  // Count all categories - use flatData for simplicity
  const getAllCategoriesCount = () => {
    return flatData.length;
  };

  // Helper function to find a node and its path (ancestors) in the tree
  const findNodeAndPath = (data, searchText, ancestors = []) => {
    try {
      if (!data || !Array.isArray(data)) return null;

      for (const item of data) {
        if (!item) continue;

        const matches = item.name && item.name.toLowerCase().includes(searchText.toLowerCase());

        if (matches) {
          // Found matching node, return it with its ancestors
          return {
            node: item,
            ancestors: ancestors,
            path: [...ancestors, item]
          };
        }

        // Search in children
        if (item.children && item.children.length > 0) {
          const found = findNodeAndPath(item.children, searchText, [...ancestors, item]);
          if (found) return found;
        }
      }

      return null;
    } catch (error) {
      console.error('Error finding node:', error);
      return null;
    }
  };

  // Filter tree data based on search - show matching node with its parent and children
  const filterTreeData = (data, searchText) => {
    try {
      if (!searchText || !data || !Array.isArray(data)) return data || [];

      const searchLower = searchText.toLowerCase();

      // Recursive function to filter tree
      // Returns node if it matches or has matching descendants, or if it's a parent of a matching node
      const filterNode = (node) => {
        if (!node) return null;

        const nodeMatches = node.name && node.name.toLowerCase().includes(searchLower);

        // Filter children recursively first
        const filteredChildren = node.children && node.children.length > 0
          ? node.children.map(filterNode).filter(Boolean)
          : [];

        const hasMatchingChildren = filteredChildren.length > 0;

        // Include node if:
        // 1. Node itself matches (include all its children, but filter them too)
        // 2. Node has matching children (include as parent context)
        if (nodeMatches || hasMatchingChildren) {
          return {
            ...node,
            children: nodeMatches
              ? (node.children && node.children.length > 0
                ? node.children.map(filterNode).filter(Boolean) // Filter children even if parent matches
                : [])
              : filteredChildren // If only children match, show only filtered children
          };
        }

        return null;
      };

      return data.map(filterNode).filter(Boolean);
    } catch (error) {
      console.error('Error filtering tree data:', error);
      return data || [];
    }
  };

  // Filter flat data based on search
  const filterFlatData = (data, searchText) => {
    if (!searchText || !data || !Array.isArray(data)) return data || [];

    const searchLower = searchText.toLowerCase();
    return data.filter(item => {
      if (!item) return false;
      const nameMatch = item.name && item.name.toLowerCase().includes(searchLower);
      const slugMatch = item.slug && item.slug.toLowerCase().includes(searchLower);
      return nameMatch || slugMatch;
    });
  };

  // Filter flat data based on level
  const filterFlatDataByLevel = (data, level) => {
    if (level === 'all' || !data || !Array.isArray(data)) return data || [];

    const targetLevel = parseInt(level, 10);
    return data.filter(item => {
      if (!item) return false;
      return (item.level || 0) === targetLevel;
    });
  };

  // Filter flat data based on status
  const filterFlatDataByStatus = (data, status) => {
    if (status === 'all' || !data || !Array.isArray(data)) return data || [];

    return data.filter(item => {
      if (!item) return false;
      if (status === 'active') return item.isActive === true;
      if (status === 'inactive') return item.isActive === false;
      return true;
    });
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

  // Apply filters to flat data
  let filteredFlatData = flatData;

  if (levelFilter !== 'all') {
    filteredFlatData = filterFlatDataByLevel(filteredFlatData, levelFilter);
  }

  if (statusFilter !== 'all') {
    filteredFlatData = filterFlatDataByStatus(filteredFlatData, statusFilter);
  }

  if (searchValue) {
    filteredFlatData = filterFlatData(filteredFlatData, searchValue);
  }

  // Get row background color based on level
  const getRowStyle = (record) => {
    const level = record.level || 0;
    // Màu nền khác nhau cho mỗi level
    const colors = {
      0: '#f0f7ff', // Xanh nhạt cho level 0 (gốc)
      1: '#f6ffed', // Xanh lá nhạt cho level 1
      2: '#fff7e6', // Vàng nhạt cho level 2
      3: '#fff1f0', // Đỏ nhạt cho level 3
    };
    return {
      backgroundColor: colors[level] || '#fafafa', // Màu mặc định cho level cao hơn
      transition: 'background-color 0.2s'
    };
  };

  // Get hover color based on level
  const getHoverColor = (level) => {
    const hoverColors = {
      0: '#d6e7ff', // Xanh đậm hơn khi hover
      1: '#d9f7be', // Xanh lá đậm hơn khi hover
      2: '#ffe7ba', // Vàng đậm hơn khi hover
      3: '#ffccc7', // Đỏ đậm hơn khi hover
    };
    return hoverColors[level] || '#f0f0f0';
  };

  // Table columns definition
  const columns = [
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => {
        const actionMenu = [
          {
            key: 'add',
            icon: <PlusOutlined />,
            label: 'Thêm danh mục con',
            onClick: () => handleAddCategory(record)
          },
          {
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Chỉnh sửa',
            onClick: () => handleEditCategory(record)
          },
          {
            key: 'view',
            icon: <EyeOutlined />,
            label: 'Xem chi tiết',
            onClick: () => console.log('View category:', record)
          },
          {
            type: 'divider'
          },
          {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: 'Xóa danh mục',
            danger: true,
            onClick: () => handleDeleteCategory(record)
          }
        ];

        return (
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: record.indent || 0 }}>
            <Avatar
              size="small"
              icon={record.level === 0 ? <FolderOpenOutlined /> : <FolderOutlined />}
              style={{
                backgroundColor: record.isActive ? '#52c41a' : '#ff4d4f',
                marginRight: 12
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '14px',
                fontWeight: 500,
                color: '#262626',
                marginBottom: 4
              }}>
                {text || 'Unknown'}
              </div>
              {record.description && (
                <div style={{
                  fontSize: '12px',
                  color: '#8c8c8c',
                  fontStyle: 'italic'
                }}>
                  {record.description.length > 60 ? `${record.description.substring(0, 60)}...` : record.description}
                </div>
              )}
            </div>
          </div>
        );
      },
      width: '30%'
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      render: (slug) => (
        <span style={{ color: '#8c8c8c', fontSize: '13px' }}>
          {slug ? `/${slug}` : '-'}
        </span>
      ),
      width: '20%'
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      render: (level) => (
        <Tag color="blue">{level || 0}</Tag>
      ),
      width: '8%',
      align: 'center'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Hoạt động' : 'Tạm dừng'}
        </Tag>
      ),
      width: '12%',
      align: 'center'
    },
    {
      title: 'Số sản phẩm',
      dataIndex: 'productCount',
      key: 'productCount',
      render: (count) => (
        <span style={{ color: '#1890ff', fontWeight: 500 }}>
          {count !== undefined ? count : 0}
        </span>
      ),
      width: '12%',
      align: 'center'
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => {
        const actionMenu = [
          {
            key: 'add',
            icon: <PlusOutlined />,
            label: 'Thêm danh mục con',
            onClick: () => handleAddCategory(record)
          },
          {
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Chỉnh sửa',
            onClick: () => handleEditCategory(record)
          },
          {
            key: 'view',
            icon: <EyeOutlined />,
            label: 'Xem chi tiết',
            onClick: () => console.log('View category:', record)
          },
          {
            type: 'divider'
          },
          {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: 'Xóa danh mục',
            danger: true,
            onClick: () => handleDeleteCategory(record)
          }
        ];

        return (
          <Space size="small">
            {permissions.canCreateCategories() && (
              <Tooltip title="Thêm danh mục con">
                <Button
                  type="text"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => handleAddCategory(record)}
                  style={{ color: '#52c41a' }}
                />
              </Tooltip>
            )}
            {permissions.canEditCategories() && (
              <Tooltip title="Chỉnh sửa">
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleEditCategory(record)}
                  style={{ color: '#1890ff' }}
                />
              </Tooltip>
            )}
            <Dropdown menu={{ items: actionMenu }} trigger={['click']}>
              <Button
                type="text"
                size="small"
                icon={<MoreOutlined />}
              />
            </Dropdown>
          </Space>
        );
      },
      width: '18%',
      align: 'center'
    }
  ];

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
            {permissions.canCreateCategories() && (
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
            )}
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
              {getAllCategoriesCount()} danh mục
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
          ) : !filteredFlatData || filteredFlatData.length === 0 ? (
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
            <Table
              columns={columns}
              dataSource={filteredFlatData}
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} danh mục`,
                pageSizeOptions: ['10', '20', '50', '100'],
                onChange: (page, pageSize) => {
                  setPagination({ current: page, pageSize });
                }
              }}
              rowKey={(record) => record.key || record._id || record.id}
              rowClassName={(record, index) => {
                // Thêm hover effect
                return '';
              }}
              onRow={(record) => ({
                style: getRowStyle(record),
                onMouseEnter: (e) => {
                  e.currentTarget.style.backgroundColor = getHoverColor(record.level || 0);
                },
                onMouseLeave: (e) => {
                  e.currentTarget.style.backgroundColor = getRowStyle(record).backgroundColor;
                }
              })}
              style={{
                background: 'white'
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
