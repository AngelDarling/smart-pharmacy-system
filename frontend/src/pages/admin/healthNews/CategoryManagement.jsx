import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function CategoryManagement() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: '📰',
        order: 0,
        isActive: true
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/health-news-categories`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCategories(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');

            if (editingCategory) {
                // Update
                await axios.put(
                    `${API_URL}/health-news-categories/${editingCategory._id}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                // Create
                await axios.post(
                    `${API_URL}/health-news-categories`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            setShowForm(false);
            setEditingCategory(null);
            setFormData({ name: '', description: '', icon: '📰', order: 0, isActive: true });
            fetchCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            icon: category.icon || '📰',
            order: category.order || 0,
            isActive: category.isActive
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/health-news-categories/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    if (loading) {
        return <div style={{ padding: 20 }}>Đang tải...</div>;
    }

    return (
        <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h1 style={{ margin: 0 }}>Quản lý Danh mục Tin tức</h1>
                <button
                    onClick={() => {
                        setShowForm(true);
                        setEditingCategory(null);
                        setFormData({ name: '', description: '', icon: '📰', order: 0, isActive: true });
                    }}
                    style={{
                        padding: '10px 20px',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontWeight: 500
                    }}
                >
                    + Thêm danh mục
                </button>
            </div>

            {showForm && (
                <div style={{
                    background: 'white',
                    padding: 20,
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    marginBottom: 20
                }}>
                    <h2>{editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h2>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: 15 }}>
                            <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>
                                Tên danh mục *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                style={{
                                    width: '100%',
                                    padding: 10,
                                    border: '1px solid #ddd',
                                    borderRadius: 6,
                                    fontSize: 14
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: 15 }}>
                            <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>
                                Mô tả
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: 10,
                                    border: '1px solid #ddd',
                                    borderRadius: 6,
                                    fontSize: 14,
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 15, marginBottom: 15 }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>
                                    Icon
                                </label>
                                <input
                                    type="text"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: 10,
                                        border: '1px solid #ddd',
                                        borderRadius: 6,
                                        fontSize: 14
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>
                                    Thứ tự
                                </label>
                                <input
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                    style={{
                                        width: '100%',
                                        padding: 10,
                                        border: '1px solid #ddd',
                                        borderRadius: 6,
                                        fontSize: 14
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>
                                    Trạng thái
                                </label>
                                <select
                                    value={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                                    style={{
                                        width: '100%',
                                        padding: 10,
                                        border: '1px solid #ddd',
                                        borderRadius: 6,
                                        fontSize: 14
                                    }}
                                >
                                    <option value="true">Hoạt động</option>
                                    <option value="false">Tạm ẩn</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 10 }}>
                            <button
                                type="submit"
                                style={{
                                    padding: '10px 20px',
                                    background: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    fontWeight: 500
                                }}
                            >
                                {editingCategory ? 'Cập nhật' : 'Tạo mới'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingCategory(null);
                                }}
                                style={{
                                    padding: '10px 20px',
                                    background: '#6b7280',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    fontWeight: 500
                                }}
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{
                background: 'white',
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                overflow: 'hidden'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                            <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>Icon</th>
                            <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>Tên danh mục</th>
                            <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>Slug</th>
                            <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>Mô tả</th>
                            <th style={{ padding: 12, textAlign: 'center', fontWeight: 600 }}>Thứ tự</th>
                            <th style={{ padding: 12, textAlign: 'center', fontWeight: 600 }}>Trạng thái</th>
                            <th style={{ padding: 12, textAlign: 'center', fontWeight: 600 }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => (
                            <tr key={category._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <td style={{ padding: 12, fontSize: 24 }}>{category.icon}</td>
                                <td style={{ padding: 12, fontWeight: 500 }}>{category.name}</td>
                                <td style={{ padding: 12, color: '#6b7280', fontSize: 13 }}>{category.slug}</td>
                                <td style={{ padding: 12, color: '#6b7280', fontSize: 13 }}>
                                    {category.description?.substring(0, 50)}
                                    {category.description?.length > 50 && '...'}
                                </td>
                                <td style={{ padding: 12, textAlign: 'center' }}>{category.order}</td>
                                <td style={{ padding: 12, textAlign: 'center' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: 4,
                                        fontSize: 12,
                                        fontWeight: 500,
                                        background: category.isActive ? '#d1fae5' : '#fee2e2',
                                        color: category.isActive ? '#065f46' : '#991b1b'
                                    }}>
                                        {category.isActive ? 'Hoạt động' : 'Tạm ẩn'}
                                    </span>
                                </td>
                                <td style={{ padding: 12, textAlign: 'center' }}>
                                    <button
                                        onClick={() => handleEdit(category)}
                                        style={{
                                            padding: '6px 12px',
                                            background: '#3b82f6',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 4,
                                            cursor: 'pointer',
                                            marginRight: 8,
                                            fontSize: 13
                                        }}
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category._id)}
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
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {categories.length === 0 && (
                    <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
                        Chưa có danh mục nào. Nhấn "Thêm danh mục" để tạo mới.
                    </div>
                )}
            </div>
        </div>
    );
}

export default CategoryManagement;
