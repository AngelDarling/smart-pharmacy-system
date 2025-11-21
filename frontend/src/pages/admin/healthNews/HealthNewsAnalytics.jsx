import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

function HealthNewsAnalytics() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/health-news/analytics`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(response.data);
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError('Không thể tải dữ liệu thống kê');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: 20 }}>Đang tải thống kê...</div>;
    if (error) return <div style={{ padding: 20, color: 'red' }}>{error}</div>;
    if (!stats) return null;

    const { summary, topArticles } = stats;

    return (
        <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ margin: 0 }}>Thống kê Tin tức Sức khỏe</h1>
                <Link
                    to="/admin/health-news"
                    style={{
                        padding: '10px 20px',
                        background: '#6b7280',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: 6,
                        fontWeight: 500
                    }}
                >
                    Quay lại quản lý
                </Link>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}>
                <div style={{ background: 'white', padding: 20, borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 5 }}>Tổng lượt xem</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#3b82f6' }}>{summary.totalViews.toLocaleString()}</div>
                </div>
                <div style={{ background: 'white', padding: 20, borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 5 }}>Tổng lượt thích</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#ef4444' }}>{summary.totalLikes.toLocaleString()}</div>
                </div>
                <div style={{ background: 'white', padding: 20, borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 5 }}>Tổng bài viết</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#10b981' }}>{summary.totalArticles.toLocaleString()}</div>
                </div>
                <div style={{ background: 'white', padding: 20, borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 5 }}>Đã xuất bản</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#8b5cf6' }}>{summary.publishedArticles.toLocaleString()}</div>
                </div>
            </div>

            {/* Top Articles */}
            <div style={{ background: 'white', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: 20 }}>
                <h2 style={{ marginTop: 0, marginBottom: 20 }}>Top 5 Bài viết xem nhiều nhất</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                            <th style={{ padding: '12px 0', fontWeight: 600 }}>Tiêu đề</th>
                            <th style={{ padding: '12px 0', fontWeight: 600, textAlign: 'right' }}>Lượt xem</th>
                            <th style={{ padding: '12px 0', fontWeight: 600, textAlign: 'right' }}>Lượt thích</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topArticles.map(article => (
                            <tr key={article._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '12px 0' }}>
                                    <Link to={`/health-news/${article.slug}`} target="_blank" style={{ color: '#111827', textDecoration: 'none', fontWeight: 500 }}>
                                        {article.title}
                                    </Link>
                                </td>
                                <td style={{ padding: '12px 0', textAlign: 'right', color: '#3b82f6', fontWeight: 500 }}>
                                    {article.viewCount.toLocaleString()}
                                </td>
                                <td style={{ padding: '12px 0', textAlign: 'right', color: '#ef4444', fontWeight: 500 }}>
                                    {article.likeCount.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default HealthNewsAnalytics;
