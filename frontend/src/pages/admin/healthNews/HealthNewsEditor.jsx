import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useHealthNewsCategories } from '../../../hooks/useHealthNewsCategories';

const API_URL = 'http://localhost:5000/api';

function HealthNewsEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const quillRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const { categories } = useHealthNewsCategories();
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        featuredImage: '',
        category: '',
        tags: [],
        author: {
            name: '',
            avatar: '',
            bio: ''
        },
        status: 'draft',
        isFeatured: false,
        seo: {
            metaTitle: '',
            metaDescription: '',
            metaKeywords: [],
            ogImage: '',
            schemaType: 'Article'
        },
        relatedProducts: []
    });
    const [tagInput, setTagInput] = useState('');
    const [keywordInput, setKeywordInput] = useState('');

    useEffect(() => {
        fetchProducts();
        if (id) {
            fetchArticle();
        }
    }, [id]);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/products?limit=100`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(response.data.products || response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchArticle = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/health-news/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const article = response.data;
            setFormData({
                title: article.title || '',
                excerpt: article.excerpt || '',
                content: article.content || '',
                featuredImage: article.featuredImage || '',
                category: article.category?._id || '',
                tags: article.tags || [],
                author: article.author || { name: '', avatar: '', bio: '' },
                status: article.status || 'draft',
                isFeatured: article.isFeatured || false,
                seo: article.seo || {
                    metaTitle: '',
                    metaDescription: '',
                    metaKeywords: [],
                    ogImage: '',
                    schemaType: 'Article'
                },
                relatedProducts: article.relatedProducts?.map(p => p._id) || []
            });
        } catch (error) {
            console.error('Error fetching article:', error);
            alert('Không thể tải bài viết');
        }
    };

    // Image upload handler for Quill editor
    const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('image', file);

            try {
                const token = localStorage.getItem('token');
                const response = await axios.post(
                    `${API_URL}/health-news/upload-image`,
                    formData,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );

                const imageUrl = response.data.url;
                const quill = quillRef.current.getEditor();
                const range = quill.getSelection();
                quill.insertEmbed(range.index, 'image', imageUrl);
            } catch (error) {
                console.error('Error uploading image:', error);
                alert('Lỗi upload ảnh: ' + (error.response?.data?.message || error.message));
            }
        };
    };

    const modules = {
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'color': [] }, { 'background': [] }],
                ['link', 'image'],
                ['blockquote', 'code-block'],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        }
    };

    const handleFeaturedImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadFormData = new FormData();
        uploadFormData.append('image', file);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/health-news/upload-image`,
                uploadFormData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            setFormData({ ...formData, featuredImage: response.data.url });
        } catch (error) {
            console.error('Error uploading featured image:', error);
            alert('Lỗi upload ảnh: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData({
                ...formData,
                tags: [...formData.tags, tagInput.trim()]
            });
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(t => t !== tag)
        });
    };

    const handleAddKeyword = () => {
        if (keywordInput.trim() && !formData.seo.metaKeywords.includes(keywordInput.trim())) {
            setFormData({
                ...formData,
                seo: {
                    ...formData.seo,
                    metaKeywords: [...formData.seo.metaKeywords, keywordInput.trim()]
                }
            });
            setKeywordInput('');
        }
    };

    const handleRemoveKeyword = (keyword) => {
        setFormData({
            ...formData,
            seo: {
                ...formData.seo,
                metaKeywords: formData.seo.metaKeywords.filter(k => k !== keyword)
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');

            if (id) {
                // Update
                await axios.put(
                    `${API_URL}/health-news/${id}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                alert('Cập nhật bài viết thành công!');
            } else {
                // Create
                await axios.post(
                    `${API_URL}/health-news`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                alert('Tạo bài viết thành công!');
            }

            navigate('/admin/health-news');
        } catch (error) {
            console.error('Error saving article:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ marginBottom: 20 }}>
                <h1>{id ? 'Sửa bài viết' : 'Tạo bài viết mới'}</h1>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Basic Info */}
                <div style={{
                    background: 'white',
                    padding: 20,
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    marginBottom: 20
                }}>
                    <h2 style={{ marginTop: 0 }}>Thông tin cơ bản</h2>

                    <div style={{ marginBottom: 15 }}>
                        <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>
                            Tiêu đề *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                            Tóm tắt (150-300 ký tự) *
                        </label>
                        <textarea
                            value={formData.excerpt}
                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                            required
                            maxLength={300}
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
                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                            {formData.excerpt.length}/300 ký tự
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 15 }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>
                                Danh mục *
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                required
                                style={{
                                    width: '100%',
                                    padding: 10,
                                    border: '1px solid #ddd',
                                    borderRadius: 6,
                                    fontSize: 14
                                }}
                            >
                                <option value="">Chọn danh mục</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>
                                Trạng thái
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: 10,
                                    border: '1px solid #ddd',
                                    borderRadius: 6,
                                    fontSize: 14
                                }}
                            >
                                <option value="draft">Nháp</option>
                                <option value="published">Xuất bản</option>
                                <option value="archived">Lưu trữ</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ marginBottom: 15 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={formData.isFeatured}
                                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                            />
                            <span style={{ fontWeight: 500 }}>⭐ Bài viết nổi bật</span>
                        </label>
                    </div>
                </div>

                {/* Featured Image */}
                <div style={{
                    background: 'white',
                    padding: 20,
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    marginBottom: 20
                }}>
                    <h2 style={{ marginTop: 0 }}>Ảnh đại diện *</h2>

                    {formData.featuredImage && (
                        <img
                            src={formData.featuredImage}
                            alt="Featured"
                            style={{
                                maxWidth: '100%',
                                maxHeight: 300,
                                objectFit: 'cover',
                                borderRadius: 8,
                                marginBottom: 15
                            }}
                        />
                    )}

                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFeaturedImageUpload}
                        style={{ marginBottom: 10 }}
                    />

                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                        Hoặc nhập URL ảnh:
                    </div>
                    <input
                        type="url"
                        value={formData.featuredImage}
                        onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                        placeholder="https://..."
                        style={{
                            width: '100%',
                            padding: 10,
                            border: '1px solid #ddd',
                            borderRadius: 6,
                            fontSize: 14,
                            marginTop: 5
                        }}
                    />
                </div>

                {/* Content Editor */}
                <div style={{
                    background: 'white',
                    padding: 20,
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    marginBottom: 20
                }}>
                    <h2 style={{ marginTop: 0 }}>Nội dung bài viết *</h2>
                    <ReactQuill
                        ref={quillRef}
                        theme="snow"
                        value={formData.content}
                        onChange={(content) => setFormData({ ...formData, content })}
                        modules={modules}
                        style={{ height: 400, marginBottom: 50 }}
                    />
                </div>

                {/* Tags */}
                <div style={{
                    background: 'white',
                    padding: 20,
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    marginBottom: 20
                }}>
                    <h2 style={{ marginTop: 0 }}>Tags</h2>

                    <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                            placeholder="Nhập tag và nhấn Enter"
                            style={{
                                flex: 1,
                                padding: 10,
                                border: '1px solid #ddd',
                                borderRadius: 6,
                                fontSize: 14
                            }}
                        />
                        <button
                            type="button"
                            onClick={handleAddTag}
                            style={{
                                padding: '10px 20px',
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: 6,
                                cursor: 'pointer'
                            }}
                        >
                            Thêm
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {formData.tags.map(tag => (
                            <span
                                key={tag}
                                style={{
                                    background: '#e0e7ff',
                                    color: '#3730a3',
                                    padding: '6px 12px',
                                    borderRadius: 16,
                                    fontSize: 13,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6
                                }}
                            >
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveTag(tag)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#3730a3',
                                        cursor: 'pointer',
                                        padding: 0,
                                        fontSize: 16
                                    }}
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Author Info */}
                <div style={{
                    background: 'white',
                    padding: 20,
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    marginBottom: 20
                }}>
                    <h2 style={{ marginTop: 0 }}>Thông tin tác giả</h2>

                    <div style={{ marginBottom: 15 }}>
                        <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>
                            Tên tác giả
                        </label>
                        <input
                            type="text"
                            value={formData.author.name}
                            onChange={(e) => setFormData({
                                ...formData,
                                author: { ...formData.author, name: e.target.value }
                            })}
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
                            Giới thiệu ngắn
                        </label>
                        <textarea
                            value={formData.author.bio}
                            onChange={(e) => setFormData({
                                ...formData,
                                author: { ...formData.author, bio: e.target.value }
                            })}
                            rows={2}
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
                </div>

                {/* SEO Fields */}
                <div style={{
                    background: 'white',
                    padding: 20,
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    marginBottom: 20
                }}>
                    <h2 style={{ marginTop: 0 }}>SEO & Meta Tags</h2>

                    <div style={{ marginBottom: 15 }}>
                        <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>
                            Meta Title
                        </label>
                        <input
                            type="text"
                            value={formData.seo.metaTitle}
                            onChange={(e) => setFormData({
                                ...formData,
                                seo: { ...formData.seo, metaTitle: e.target.value }
                            })}
                            placeholder={formData.title}
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
                            Meta Description
                        </label>
                        <textarea
                            value={formData.seo.metaDescription}
                            onChange={(e) => setFormData({
                                ...formData,
                                seo: { ...formData.seo, metaDescription: e.target.value }
                            })}
                            placeholder={formData.excerpt}
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

                    <div style={{ marginBottom: 15 }}>
                        <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>
                            Meta Keywords
                        </label>
                        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                            <input
                                type="text"
                                value={keywordInput}
                                onChange={(e) => setKeywordInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                                placeholder="Nhập keyword và nhấn Enter"
                                style={{
                                    flex: 1,
                                    padding: 10,
                                    border: '1px solid #ddd',
                                    borderRadius: 6,
                                    fontSize: 14
                                }}
                            />
                            <button
                                type="button"
                                onClick={handleAddKeyword}
                                style={{
                                    padding: '10px 20px',
                                    background: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 6,
                                    cursor: 'pointer'
                                }}
                            >
                                Thêm
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {formData.seo.metaKeywords.map(keyword => (
                                <span
                                    key={keyword}
                                    style={{
                                        background: '#fef3c7',
                                        color: '#92400e',
                                        padding: '6px 12px',
                                        borderRadius: 16,
                                        fontSize: 13,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6
                                    }}
                                >
                                    {keyword}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveKeyword(keyword)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#92400e',
                                            cursor: 'pointer',
                                            padding: 0,
                                            fontSize: 16
                                        }}
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: 15 }}>
                        <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>
                            Schema Type
                        </label>
                        <select
                            value={formData.seo.schemaType}
                            onChange={(e) => setFormData({
                                ...formData,
                                seo: { ...formData.seo, schemaType: e.target.value }
                            })}
                            style={{
                                width: '100%',
                                padding: 10,
                                border: '1px solid #ddd',
                                borderRadius: 6,
                                fontSize: 14
                            }}
                        >
                            <option value="Article">Article</option>
                            <option value="MedicalWebPage">MedicalWebPage</option>
                        </select>
                    </div>
                </div>

                {/* Related Products */}
                <div style={{
                    background: 'white',
                    padding: 20,
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    marginBottom: 20
                }}>
                    <h2 style={{ marginTop: 0 }}>Sản phẩm liên quan</h2>

                    <select
                        multiple
                        value={formData.relatedProducts}
                        onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions, option => option.value);
                            setFormData({ ...formData, relatedProducts: selected });
                        }}
                        style={{
                            width: '100%',
                            padding: 10,
                            border: '1px solid #ddd',
                            borderRadius: 6,
                            fontSize: 14,
                            minHeight: 200
                        }}
                    >
                        {products.map(product => (
                            <option key={product._id} value={product._id}>
                                {product.name} - {product.price?.toLocaleString()}₫
                            </option>
                        ))}
                    </select>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 5 }}>
                        Giữ Ctrl/Cmd để chọn nhiều sản phẩm
                    </div>
                </div>

                {/* Submit Buttons */}
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        onClick={() => navigate('/admin/health-news')}
                        style={{
                            padding: '12px 24px',
                            background: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontWeight: 500,
                            fontSize: 14
                        }}
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '12px 24px',
                            background: loading ? '#9ca3af' : '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: 6,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: 500,
                            fontSize: 14
                        }}
                    >
                        {loading ? 'Đang lưu...' : (id ? 'Cập nhật' : 'Tạo mới')}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default HealthNewsEditor;
