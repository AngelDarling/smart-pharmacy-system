import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../api/client.js';
import { Avatar, Button, Space } from 'antd';
import { FileTextOutlined, BarChartOutlined, FolderOutlined, PlusOutlined } from '@ant-design/icons';
import { useHealthNewsCategories } from '../../../hooks/useHealthNewsCategories';
import { usePermissions } from '../../../hooks/usePermissions';
import Swal from 'sweetalert2';

function HealthNewsManagement() {
    const { permissions } = usePermissions();
    const [news, setNews] = useState([]);
    const { categories } = useHealthNewsCategories();
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: '',
        status: '',
        search: ''
    });

    useEffect(() => {
        fetchNews();
    }, [filters]);

    const fetchNews = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.category) params.append('category', filters.category);
            if (filters.status) params.append('status', filters.status);
            if (filters.search) params.append('search', filters.search);

            const response = await api.get(`/health-news?${params.toString()}`);

            console.log('Response:', response.data);
            setNews(response.data.items || response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching news:', error);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Xác nhận xóa',
            text: 'Bạn có chắc muốn xóa bài viết này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy'
        });

        if (!result.isConfirmed) return;

        try {
            await api.delete(`/health-news/${id}`);

            Swal.fire({
                title: 'Đã xóa!',
                text: 'Bài viết đã được xóa thành công',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

            fetchNews();
        } catch (error) {
            console.error('Error deleting news:', error);
            Swal.fire({
                title: 'Lỗi!',
                text: error.response?.data?.message || 'Có lỗi xảy ra',
                icon: 'error'
            });
        }
    };

    const handlePublish = async (id) => {
        try {
            await api.put(`/health-news/${id}/publish`, {});
            fetchNews();
        } catch (error) {
            console.error('Error publishing news:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    if (loading) {
        return <div style={{ padding: 20 }}>Đang tải...</div>;
    }

    return (
        <div style={{ padding: 20 }}>
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
                        icon={<FileTextOutlined />}
                        style={{
                            backgroundColor: '#52c41a',
                            marginRight: '16px'
                        }}
                    />
                    <div>
                        <h2 style={{ margin: 0, color: '#262626' }}>
                            Quản lý Tin tức Sức khỏe
                        </h2>
                        <div style={{ color: '#8c8c8c', fontSize: '14px' }}>
                            Quản lý bài viết và nội dung tin tức sức khỏe
                        </div>
                    </div>
                </div>
                <Space>
                    <Link to="/admin/health-news/analytics">
                        <Button icon={<BarChartOutlined />}>
                            Thống kê
                        </Button>
                    </Link>
                    <Link to="/admin/health-news/categories">
                        <Button icon={<FolderOutlined />}>
                            Danh mục
                        </Button>
                    </Link>
                    {permissions.canCreateHealthNews() && (
                        <Link to="/admin/health-news/new">
                            <Button type="primary" icon={<PlusOutlined />} size="large">
                                Tạo bài viết
                            </Button>
                        </Link>
                    )}
                </Space>
            </div>

            {/* Filters */}
            <div style={{
                background: 'white',
                padding: 20,
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginBottom: 20
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 15 }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: 5, fontWeight: 500, fontSize: 14 }}>
                            Danh mục
                        </label>
                        <select
                            value={filters.category}
                            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                            style={{
                                width: '100%',
                                padding: 10,
                                border: '1px solid #ddd',
                                borderRadius: 6,
                                fontSize: 14
                            }}
                        >
                            <option value="">Tất cả danh mục</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: 5, fontWeight: 500, fontSize: 14 }}>
                            Trạng thái
                        </label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            style={{
                                width: '100%',
                                padding: 10,
                                border: '1px solid #ddd',
                                borderRadius: 6,
                                fontSize: 14
                            }}
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="draft">Nháp</option>
                            <option value="published">Đã xuất bản</option>
                            <option value="archived">Lưu trữ</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: 5, fontWeight: 500, fontSize: 14 }}>
                            Tìm kiếm
                        </label>
                        <input
                            type="text"
                            placeholder="Tìm theo tiêu đề, tags..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            style={{
                                width: '100%',
                                padding: 10,
                                border: '1px solid #ddd',
                                borderRadius: 6,
                                fontSize: 14
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* News List */}
            <div style={{
                background: 'white',
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                overflow: 'hidden'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                            <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>Ảnh</th>
                            <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>Tiêu đề</th>
                            <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>Danh mục</th>
                            <th style={{ padding: 12, textAlign: 'center', fontWeight: 600 }}>Trạng thái</th>
                            <th style={{ padding: 12, textAlign: 'center', fontWeight: 600 }}>Views</th>
                            <th style={{ padding: 12, textAlign: 'center', fontWeight: 600 }}>Likes</th>
                            <th style={{ padding: 12, textAlign: 'center', fontWeight: 600 }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {news.map((article) => (
                            <tr key={article._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <td style={{ padding: 12 }}>
                                    <img
                                        src={article.featuredImage}
                                        alt={article.title}
                                        style={{
                                            width: 80,
                                            height: 60,
                                            objectFit: 'cover',
                                            borderRadius: 6
                                        }}
                                    />
                                </td>
                                <td style={{ padding: 12 }}>
                                    <div style={{ fontWeight: 500, marginBottom: 4 }}>{article.title}</div>
                                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                                        {article.isFeatured && (
                                            <span style={{
                                                background: '#fef3c7',
                                                color: '#92400e',
                                                padding: '2px 6px',
                                                borderRadius: 3,
                                                marginRight: 6,
                                                fontSize: 11,
                                                fontWeight: 500
                                            }}>
                                                ⭐ Nổi bật
                                            </span>
                                        )}
                                        {new Date(article.publishedAt || article.createdAt).toLocaleDateString('vi-VN')}
                                    </div>
                                </td>
                                <td style={{ padding: 12 }}>
                                    {article.category?.icon} {article.category?.name}
                                </td>
                                <td style={{ padding: 12, textAlign: 'center' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: 4,
                                        fontSize: 12,
                                        fontWeight: 500,
                                        background: article.status === 'published' ? '#d1fae5' :
                                            article.status === 'draft' ? '#fef3c7' : '#fee2e2',
                                        color: article.status === 'published' ? '#065f46' :
                                            article.status === 'draft' ? '#92400e' : '#991b1b'
                                    }}>
                                        {article.status === 'published' ? 'Đã xuất bản' :
                                            article.status === 'draft' ? 'Nháp' : 'Lưu trữ'}
                                    </span>
                                </td>
                                <td style={{ padding: 12, textAlign: 'center' }}>{article.viewCount || 0}</td>
                                <td style={{ padding: 12, textAlign: 'center' }}>{article.likeCount || 0}</td>
                                <td style={{ padding: 12, textAlign: 'center' }}>
                                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                        {permissions.canEditHealthNews() && (
                                            <Link
                                                to={`/admin/health-news/edit/${article._id}`}
                                                style={{
                                                    padding: '6px 12px',
                                                    background: '#3b82f6',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: 4,
                                                    cursor: 'pointer',
                                                    fontSize: 13,
                                                    textDecoration: 'none',
                                                    display: 'inline-block'
                                                }}
                                            >
                                                Sửa
                                            </Link>
                                        )}
                                        {permissions.canEditHealthNews() && article.status === 'draft' && (
                                            <button
                                                onClick={() => handlePublish(article._id)}
                                                style={{
                                                    padding: '6px 12px',
                                                    background: '#10b981',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: 4,
                                                    cursor: 'pointer',
                                                    fontSize: 13
                                                }}
                                            >
                                                Xuất bản
                                            </button>
                                        )}
                                        {permissions.canDeleteHealthNews() && (
                                            <button
                                                onClick={() => handleDelete(article._id)}
                                                style={{
                                                    padding: '6px 12px',
                                                    background: '#ef4444',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: 4,
                                                    cursor: 'pointer',
                                                    fontSize: 13
                                                }}
                                            >
                                                Xóa
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {
                    news.length === 0 && (
                        <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
                            Chưa có bài viết nào. Nhấn "Tạo bài viết mới" để bắt đầu.
                        </div>
                    )
                }
            </div>
        </div>
    );
}

export default HealthNewsManagement;
