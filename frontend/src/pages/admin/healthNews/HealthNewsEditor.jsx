import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useHealthNewsCategories } from '../../../hooks/useHealthNewsCategories';
import Swal from 'sweetalert2';

const API_URL = 'http://localhost:5000/api';

function HealthNewsEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const quillRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const { categories } = useHealthNewsCategories();
    const [products, setProducts] = useState([]);
    const [selectedProductsInfo, setSelectedProductsInfo] = useState([]); // Store full info of selected products
    const [productCategories, setProductCategories] = useState([]);
    const [selectedProductCategory, setSelectedProductCategory] = useState('');
    const [productSearchTerm, setProductSearchTerm] = useState('');
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
        fetchProductCategories();
        if (id) {
            fetchArticle();
        }
    }, [id]);

    // Fetch products when category is selected
    useEffect(() => {
        if (selectedProductCategory) {
            fetchProducts(selectedProductCategory);
        }
    }, [selectedProductCategory]);

    const fetchProductCategories = async () => {
        try {
            const response = await axios.get(`${API_URL}/categories/tree`);
            setProductCategories(response.data || []);
        } catch (error) {
            console.error('Error fetching product categories:', error);
        }
    };

    const fetchProducts = async (categoryId) => {
        try {
            const token = localStorage.getItem('token');
            const url = categoryId
                ? `${API_URL}/products?categoryId=${categoryId}&limit=100`
                : `${API_URL}/products?limit=100`;
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Ensure products is always an array
            const productsData = response.data.items || response.data.products || response.data;
            const products = Array.isArray(productsData) ? productsData : [];

            // Debug: Log first product to see structure
            if (products.length > 0) {
                console.log('First product:', products[0]);
                console.log('Images field:', products[0].images);
                console.log('Image field:', products[0].image);
            }

            setProducts(products);
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]); // Set empty array on error
        }
    };

    const fetchArticle = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = `${API_URL}/health-news/admin/${id}`;
            console.log('Fetching article from:', url);

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Article response:', response.data);

            const article = response.data;

            // Ensure all fields have proper default values to avoid controlled/uncontrolled input errors
            setFormData({
                title: article.title || '',
                excerpt: article.excerpt || '',
                content: article.content || '',
                featuredImage: article.featuredImage || '',
                category: article.category?._id || article.category || '',
                tags: Array.isArray(article.tags) ? article.tags : [],
                author: {
                    name: article.author?.name || '',
                    avatar: article.author?.avatar || '',
                    bio: article.author?.bio || ''
                },
                status: article.status || 'draft',
                isFeatured: Boolean(article.isFeatured),
                seo: {
                    metaTitle: article.seo?.metaTitle || '',
                    metaDescription: article.seo?.metaDescription || '',
                    metaKeywords: Array.isArray(article.seo?.metaKeywords) ? article.seo.metaKeywords : [],
                    ogImage: article.seo?.ogImage || '',
                    schemaType: article.seo?.schemaType || 'Article'
                },
                relatedProducts: Array.isArray(article.relatedProducts)
                    ? article.relatedProducts
                        .filter(p => p && (typeof p === 'object' ? p._id : p)) // Filter nulls
                        .map(p => typeof p === 'object' ? p._id : p)
                    : []
            });

            // Fetch selected products info to display names
            if (article.relatedProducts && article.relatedProducts.length > 0) {
                const productIds = article.relatedProducts
                    .filter(p => p && (typeof p === 'object' ? p._id : p))
                    .map(p => typeof p === 'object' ? p._id : p);

                if (productIds.length > 0) {
                    fetchSelectedProductsInfo(productIds);
                }
            }
        } catch (error) {
            console.error('Error fetching article:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: 'Không thể tải bài viết: ' + (error.response?.data?.message || error.message)
            });
        }
    };

    const fetchSelectedProductsInfo = async (productIds) => {
        try {
            const token = localStorage.getItem('token');
            // Fetch products by IDs
            const promises = productIds.map(id =>
                axios.get(`${API_URL}/products/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch(err => {
                    console.error(`Error fetching product ${id}:`, err);
                    return null;
                })
            );
            const responses = await Promise.all(promises);
            const productsInfo = responses
                .filter(res => res && res.data)
                .map(res => res.data);
            setSelectedProductsInfo(productsInfo);
        } catch (error) {
            console.error('Error fetching selected products info:', error);
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
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi upload!',
                    text: error.response?.data?.message || error.message
                });
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
            Swal.fire({
                icon: 'error',
                title: 'Lỗi upload!',
                text: error.response?.data?.message || error.message
            });
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
            // Validate required fields
            if (!formData.title?.trim()) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Thiếu thông tin!',
                    text: 'Vui lòng nhập tiêu đề bài viết!'
                });
                setLoading(false);
                return;
            }
            if (!formData.category) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Thiếu thông tin!',
                    text: 'Vui lòng chọn danh mục!'
                });
                setLoading(false);
                return;
            }
            if (!formData.excerpt?.trim()) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Thiếu thông tin!',
                    text: 'Vui lòng nhập tóm tắt bài viết!'
                });
                setLoading(false);
                return;
            }
            // For updates, existing image serves as featuredImage if not changed
            if (!formData.featuredImage) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Thiếu thông tin!',
                    text: 'Vui lòng chọn ảnh đại diện!'
                });
                setLoading(false);
                return;
            }

            // Clean up selections and prepare payload
            const cleanRelatedProducts = Array.isArray(formData.relatedProducts)
                ? formData.relatedProducts.filter(id => id && typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/))
                : [];

            const formDataToSubmit = {
                ...formData,
                relatedProducts: cleanRelatedProducts
            };

            const token = localStorage.getItem('token');
            // Explicitly use proper route

            if (id) {
                // Update
                console.log('Submitting Update:', formDataToSubmit);
                await axios.put(
                    `${API_URL}/health-news/${id}`,
                    formDataToSubmit,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                await Swal.fire({
                    icon: 'success',
                    title: 'Thành công!',
                    text: 'Cập nhật bài viết thành công!',
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                // Create
                console.log('Submitting Create:', formDataToSubmit);
                await axios.post(
                    `${API_URL}/health-news`,
                    formDataToSubmit,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                await Swal.fire({
                    icon: 'success',
                    title: 'Thành công!',
                    text: 'Tạo bài viết thành công!',
                    timer: 1500,
                    showConfirmButton: false
                });
            }

            navigate('/admin/health-news');
        } catch (error) {
            console.error('Error saving article:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: error.response?.data?.message || 'Có lỗi xảy ra'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                .product-item {
                    background: white;
                }
                .product-item.selected {
                    background: #eff6ff !important;
                }
                .product-item:not(.selected):hover {
                    background: #f9fafb !important;
                }
            `}</style>
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
                            <div style={{ marginBottom: 15, display: 'block', width: '100%' }}>
                                <img
                                    src={formData.featuredImage}
                                    alt="Featured"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: 300,
                                        objectFit: 'cover',
                                        borderRadius: 8,
                                        display: 'block'
                                    }}
                                />
                            </div>
                        )}

                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFeaturedImageUpload}
                            style={{ marginBottom: 10, display: 'block' }}
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




                    {/* Related Products */}
                    <div style={{
                        background: 'white',
                        padding: 20,
                        borderRadius: 8,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        marginBottom: 20
                    }}>
                        <h2 style={{ marginTop: 0 }}>Sản phẩm liên quan</h2>

                        {/* Selected Products Display */}
                        {formData.relatedProducts.length > 0 && (
                            <div style={{
                                marginBottom: 20,
                                padding: 15,
                                background: '#f0f9ff',
                                borderRadius: 8,
                                border: '1px solid #bae6fd'
                            }}>
                                <div style={{
                                    fontWeight: 600,
                                    marginBottom: 15,
                                    color: '#0369a1',
                                    fontSize: 14
                                }}>
                                    ✓ Đã chọn {formData.relatedProducts.length} sản phẩm
                                </div>

                                {/* Product Cards Grid */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                    gap: 12
                                }}>
                                    {formData.relatedProducts.map(productId => {
                                        // Try to find in selectedProductsInfo first, then in current products list
                                        let product = selectedProductsInfo.find(p => p._id === productId);
                                        if (!product) {
                                            product = products.find(p => p._id === productId);
                                        }

                                        if (!product) {
                                            // Product not found, show minimal info
                                            return (
                                                <div
                                                    key={productId}
                                                    style={{
                                                        padding: 10,
                                                        background: 'white',
                                                        borderRadius: 8,
                                                        border: '2px solid #3b82f6',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 10
                                                    }}
                                                >
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: 13, color: '#6b7280' }}>
                                                            Sản phẩm đã chọn
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData({
                                                                ...formData,
                                                                relatedProducts: formData.relatedProducts.filter(id => id !== productId)
                                                            });
                                                        }}
                                                        style={{
                                                            background: '#fee2e2',
                                                            border: 'none',
                                                            color: '#dc2626',
                                                            cursor: 'pointer',
                                                            padding: '4px 8px',
                                                            borderRadius: 4,
                                                            fontSize: 12,
                                                            fontWeight: 600
                                                        }}
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            );
                                        }

                                        // Get product image
                                        const svgPlaceholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Crect width="40" height="40" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="10" fill="%23999"%3E📦%3C/text%3E%3C/svg%3E';
                                        let productImage = svgPlaceholder;
                                        if (Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
                                            productImage = product.imageUrls[0];
                                        }

                                        // Get category name
                                        const categoryName = product.categoryId?.name || 'Chưa phân loại';

                                        return (
                                            <div
                                                key={productId}
                                                style={{
                                                    padding: 10,
                                                    background: 'white',
                                                    borderRadius: 8,
                                                    border: '2px solid #3b82f6',
                                                    display: 'flex',
                                                    gap: 10
                                                }}
                                            >
                                                <img
                                                    src={productImage}
                                                    alt={product.name}
                                                    style={{
                                                        width: 50,
                                                        height: 50,
                                                        objectFit: 'cover',
                                                        borderRadius: 6,
                                                        flexShrink: 0
                                                    }}
                                                    onError={(e) => {
                                                        e.target.src = svgPlaceholder;
                                                    }}
                                                />
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{
                                                        fontSize: 13,
                                                        fontWeight: 600,
                                                        color: '#1f2937',
                                                        marginBottom: 4,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        {product.name}
                                                    </div>
                                                    <div style={{
                                                        fontSize: 11,
                                                        color: '#6b7280',
                                                        marginBottom: 4
                                                    }}>
                                                        📁 {categoryName}
                                                    </div>
                                                    <div style={{
                                                        fontSize: 12,
                                                        color: '#dc2626',
                                                        fontWeight: 600
                                                    }}>
                                                        {product.finalPrice?.toLocaleString() || product.price?.toLocaleString()}₫
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData({
                                                            ...formData,
                                                            relatedProducts: formData.relatedProducts.filter(id => id !== productId)
                                                        });
                                                    }}
                                                    style={{
                                                        background: '#fee2e2',
                                                        border: 'none',
                                                        color: '#dc2626',
                                                        cursor: 'pointer',
                                                        padding: '4px 8px',
                                                        borderRadius: 4,
                                                        fontSize: 12,
                                                        fontWeight: 600,
                                                        height: 'fit-content',
                                                        alignSelf: 'flex-start'
                                                    }}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Category filter */}
                        <div style={{ marginBottom: 15 }}>
                            <label style={{ display: 'block', marginBottom: 5, fontWeight: 500, fontSize: 14 }}>
                                Chọn danh mục sản phẩm
                            </label>
                            <select
                                value={selectedProductCategory}
                                onChange={(e) => setSelectedProductCategory(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: 10,
                                    border: '1px solid #ddd',
                                    borderRadius: 6,
                                    fontSize: 14
                                }}
                            >
                                <option value="">-- Chọn danh mục để xem sản phẩm --</option>
                                {productCategories.map(cat => (
                                    <optgroup key={cat._id} label={cat.name}>
                                        <option value={cat._id}>{cat.name}</option>
                                        {cat.children?.map(subCat => (
                                            <option key={subCat._id} value={subCat._id}>
                                                &nbsp;&nbsp;└─ {subCat.name}
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        </div>

                        {selectedProductCategory && (
                            <>
                                {/* Search box */}
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm sản phẩm..."
                                    value={productSearchTerm}
                                    onChange={(e) => setProductSearchTerm(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: 10,
                                        border: '1px solid #ddd',
                                        borderRadius: 6,
                                        fontSize: 14,
                                        marginBottom: 15
                                    }}
                                />

                                {/* Products grid */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                    gap: 12,
                                    maxHeight: 400,
                                    overflowY: 'auto',
                                    padding: 5
                                }}>
                                    {products
                                        .filter(p => p.name.toLowerCase().includes(productSearchTerm.toLowerCase()))
                                        .map(product => {
                                            const isSelected = formData.relatedProducts.includes(product._id);

                                            // SVG placeholder
                                            const svgPlaceholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Crect width="40" height="40" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="10" fill="%23999"%3E📦%3C/text%3E%3C/svg%3E';

                                            let productImage = svgPlaceholder;
                                            if (Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
                                                productImage = product.imageUrls[0];
                                            }

                                            return (
                                                <label
                                                    key={product._id}
                                                    className={`product-item ${isSelected ? 'selected' : ''}`}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 10,
                                                        padding: 10,
                                                        border: isSelected ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                                                        borderRadius: 8,
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                // Add product
                                                                setFormData({
                                                                    ...formData,
                                                                    relatedProducts: [...formData.relatedProducts, product._id]
                                                                });
                                                                // Add to selectedProductsInfo if not already there
                                                                if (!selectedProductsInfo.find(p => p._id === product._id)) {
                                                                    setSelectedProductsInfo([...selectedProductsInfo, product]);
                                                                }
                                                            } else {
                                                                // Remove product
                                                                setFormData({
                                                                    ...formData,
                                                                    relatedProducts: formData.relatedProducts.filter(id => id !== product._id)
                                                                });
                                                                // Keep in selectedProductsInfo for display purposes
                                                            }
                                                        }}
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                    <img
                                                        src={productImage}
                                                        alt={product.name}
                                                        style={{
                                                            width: 40,
                                                            height: 40,
                                                            objectFit: 'cover',
                                                            borderRadius: 4
                                                        }}
                                                        onError={(e) => {
                                                            e.target.src = svgPlaceholder;
                                                        }}
                                                    />
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{
                                                            fontSize: 13,
                                                            fontWeight: 500,
                                                            color: '#374151',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }}>
                                                            {product.name}
                                                        </div>
                                                        <div style={{
                                                            fontSize: 12,
                                                            color: '#dc2626',
                                                            fontWeight: 600
                                                        }}>
                                                            {product.finalPrice?.toLocaleString() || product.price?.toLocaleString()}₫
                                                        </div>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                </div>
                            </>
                        )}

                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 10 }}>
                            Đã chọn: {formData.relatedProducts.length} sản phẩm
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
        </>
    );
}

export default HealthNewsEditor;
