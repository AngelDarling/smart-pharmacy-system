import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import HealthNewsCard from '../../components/healthNews/HealthNewsCard';
import { Helmet } from 'react-helmet-async';
import { useHealthNewsCategories } from '../../hooks/useHealthNewsCategories';
const API_URL = '/api';

function HealthNews() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [news, setNews] = useState([]);
    const [featuredNews, setFeaturedNews] = useState([]);
    const { categories } = useHealthNewsCategories();
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        pages: 1,
        total: 0
    });

    const categoryId = searchParams.get('category');
    const searchQuery = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');

    useEffect(() => {
        fetchFeaturedNews();
    }, []);

    useEffect(() => {
        fetchNews();
        window.scrollTo(0, 0);
    }, [categoryId, searchQuery, page]);

    const fetchFeaturedNews = async () => {
        try {
            const response = await axios.get(`${API_URL}/health-news/featured?limit=3`);
            setFeaturedNews(response.data);
        } catch (error) {
            console.error('Error fetching featured news:', error);
        }
    };

    const fetchNews = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (categoryId) params.append('category', categoryId);
            if (searchQuery) params.append('search', searchQuery);
            params.append('page', page);
            params.append('limit', 12);

            const response = await axios.get(`${API_URL}/health-news?${params.toString()}`);
            setNews(response.data.items);
            setPagination({
                page: response.data.page,
                pages: response.data.pages,
                total: response.data.total
            });
        } catch (error) {
            console.error('Error fetching news:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const query = formData.get('search');
        setSearchParams({ search: query, category: categoryId || '', page: 1 });
    };

    const handleCategoryClick = (id) => {
        setSearchParams({ category: id === categoryId ? '' : id, search: searchQuery, page: 1 });
    };

    const handlePageChange = (newPage) => {
        setSearchParams({ category: categoryId || '', search: searchQuery, page: newPage });
    };

    return (
        <div style={{ background: '#f9fafb', minHeight: '100vh', paddingBottom: 60 }}>
            <Helmet>
                <title>Tin tức Sức khỏe & Y tế | Smart Pharmacy</title>
                <meta name="description" content="Cập nhật tin tức sức khỏe, y tế, dinh dưỡng và làm đẹp mới nhất từ các chuyên gia." />
            </Helmet>

            {/* Hero Section with Featured News */}
            {!categoryId && !searchQuery && page === 1 && featuredNews.length > 0 && (
                <div style={{ background: 'white', padding: '40px 0', borderBottom: '1px solid #e5e7eb' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
                        <h2 style={{
                            fontSize: 28,
                            fontWeight: 700,
                            color: '#111827',
                            marginBottom: 24,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10
                        }}>
                            <span style={{ fontSize: 32 }}>⭐</span> Tin nổi bật
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                            {featuredNews.map(article => (
                                <HealthNewsCard key={article._id} article={article} />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>

                    {/* Search & Filter Header */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 20
                    }}>
                        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#111827' }}>
                            {categoryId
                                ? `Danh mục: ${categories.find(c => c._id === categoryId)?.name || '...'}`
                                : searchQuery
                                    ? `Kết quả tìm kiếm: "${searchQuery}"`
                                    : 'Tin tức mới nhất'}
                        </h1>

                        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, flex: 1, maxWidth: 400 }}>
                            <input
                                name="search"
                                defaultValue={searchQuery}
                                placeholder="Tìm kiếm bài viết..."
                                style={{
                                    flex: 1,
                                    padding: '10px 16px',
                                    borderRadius: 8,
                                    border: '1px solid #d1d5db',
                                    fontSize: 15,
                                    outline: 'none'
                                }}
                            />
                            <button
                                type="submit"
                                style={{
                                    background: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0 20px',
                                    borderRadius: 8,
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Tìm
                            </button>
                        </form>
                    </div>

                    {/* Categories Bar */}
                    <div style={{
                        display: 'flex',
                        gap: 12,
                        overflowX: 'auto',
                        paddingBottom: 10,
                        scrollbarWidth: 'none'
                    }}>
                        <button
                            onClick={() => handleCategoryClick('')}
                            style={{
                                padding: '8px 16px',
                                borderRadius: 20,
                                border: '1px solid',
                                borderColor: !categoryId ? '#3b82f6' : '#e5e7eb',
                                background: !categoryId ? '#eff6ff' : 'white',
                                color: !categoryId ? '#1d4ed8' : '#4b5563',
                                fontWeight: 500,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s'
                            }}
                        >
                            Tất cả
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat._id}
                                onClick={() => handleCategoryClick(cat._id)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: 20,
                                    border: '1px solid',
                                    borderColor: categoryId === cat._id ? '#3b82f6' : '#e5e7eb',
                                    background: categoryId === cat._id ? '#eff6ff' : 'white',
                                    color: categoryId === cat._id ? '#1d4ed8' : '#4b5563',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    transition: 'all 0.2s'
                                }}
                            >
                                <span>{cat.icon}</span>
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* News Grid */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 60 }}>
                            <div style={{ fontSize: 18, color: '#6b7280' }}>Đang tải tin tức...</div>
                        </div>
                    ) : news.length > 0 ? (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
                                {news.map(article => (
                                    <HealthNewsCard key={article._id} article={article} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination.pages > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
                                    <button
                                        disabled={page === 1}
                                        onClick={() => handlePageChange(page - 1)}
                                        style={{
                                            padding: '8px 16px',
                                            border: '1px solid #e5e7eb',
                                            background: 'white',
                                            borderRadius: 6,
                                            cursor: page === 1 ? 'not-allowed' : 'pointer',
                                            color: page === 1 ? '#9ca3af' : '#374151'
                                        }}
                                    >
                                        Trước
                                    </button>

                                    {[...Array(pagination.pages)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => handlePageChange(i + 1)}
                                            style={{
                                                padding: '8px 16px',
                                                border: '1px solid',
                                                borderColor: page === i + 1 ? '#3b82f6' : '#e5e7eb',
                                                background: page === i + 1 ? '#3b82f6' : 'white',
                                                color: page === i + 1 ? 'white' : '#374151',
                                                borderRadius: 6,
                                                cursor: 'pointer',
                                                fontWeight: 500
                                            }}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}

                                    <button
                                        disabled={page === pagination.pages}
                                        onClick={() => handlePageChange(page + 1)}
                                        style={{
                                            padding: '8px 16px',
                                            border: '1px solid #e5e7eb',
                                            background: 'white',
                                            borderRadius: 6,
                                            cursor: page === pagination.pages ? 'not-allowed' : 'pointer',
                                            color: page === pagination.pages ? '#9ca3af' : '#374151'
                                        }}
                                    >
                                        Sau
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            background: 'white',
                            borderRadius: 12,
                            border: '1px dashed #e5e7eb'
                        }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                            <h3 style={{ margin: '0 0 8px 0', color: '#111827' }}>Không tìm thấy bài viết nào</h3>
                            <p style={{ color: '#6b7280', margin: 0 }}>
                                Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default HealthNews;
