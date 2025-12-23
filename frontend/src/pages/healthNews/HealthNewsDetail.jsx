import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import DOMPurify from 'dompurify';
import { Helmet } from 'react-helmet-async';
import HealthNewsCard from '../../components/healthNews/HealthNewsCard';

const API_URL = '/api';

function HealthNewsDetail() {
    const { slug } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toc, setToc] = useState([]);
    const contentRef = useRef(null);

    useEffect(() => {
        fetchArticle();
    }, [slug]);

    useEffect(() => {
        if (article && contentRef.current) {
            generateTableOfContents();
            incrementView();
        }
    }, [article]);

    const fetchArticle = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/health-news/${slug}`);
            setArticle(response.data);
        } catch (error) {
            console.error('Error fetching article:', error);
        } finally {
            setLoading(false);
        }
    };

    const incrementView = async () => {
        try {
            await axios.post(`${API_URL}/health-news/${article._id}/view`);
        } catch (error) {
            console.error('Error incrementing view:', error);
        }
    };

    const generateTableOfContents = () => {
        const headers = contentRef.current.querySelectorAll('h2, h3');
        const tocData = Array.from(headers).map((header, index) => {
            const id = `heading-${index}`;
            header.id = id;
            return {
                id,
                text: header.innerText,
                level: header.tagName.toLowerCase()
            };
        });
        setToc(tocData);
    };

    const scrollToHeading = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    if (loading) {
        return <div style={{ padding: 60, textAlign: 'center' }}>Đang tải bài viết...</div>;
    }

    if (!article) {
        return <div style={{ padding: 60, textAlign: 'center' }}>Không tìm thấy bài viết</div>;
    }

    const sanitizedContent = DOMPurify.sanitize(article.content);

    return (
        <div style={{ background: '#f9fafb', minHeight: '100vh', paddingBottom: 60 }}>
            <Helmet>
                <title>{article.seo?.metaTitle || article.title} | Smart Pharmacy</title>
                <meta name="description" content={article.seo?.metaDescription || article.excerpt} />
                <meta name="keywords" content={article.seo?.metaKeywords?.join(', ')} />
                <meta property="og:title" content={article.seo?.metaTitle || article.title} />
                <meta property="og:description" content={article.seo?.metaDescription || article.excerpt} />
                <meta property="og:image" content={article.seo?.ogImage || article.featuredImage} />
                <meta property="og:type" content="article" />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": article.seo?.schemaType || "Article",
                        "headline": article.title,
                        "image": [article.featuredImage],
                        "datePublished": article.publishedAt,
                        "dateModified": article.updatedAt,
                        "author": [{
                            "@type": "Person",
                            "name": article.author?.name || "Smart Pharmacy",
                            "url": "https://smartpharmacy.com"
                        }]
                    })}
                </script>
            </Helmet>

            {/* Breadcrumb */}
            <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 20px', fontSize: 14, color: '#6b7280' }}>
                    <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Trang chủ</Link>
                    <span style={{ margin: '0 8px' }}>/</span>
                    <Link to="/health-news" style={{ color: 'inherit', textDecoration: 'none' }}>Tin tức sức khỏe</Link>
                    <span style={{ margin: '0 8px' }}>/</span>
                    <span style={{ color: '#111827', fontWeight: 500 }}>{article.title}</span>
                </div>
            </div>

            <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 20px', display: 'grid', gridTemplateColumns: '1fr 350px', gap: 40 }}>

                {/* Main Content */}
                <article style={{ background: 'white', padding: 40, borderRadius: 12, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <header style={{ marginBottom: 30 }}>
                        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                            {article.category && (
                                <Link
                                    to={`/health-news?category=${article.category._id}`}
                                    style={{
                                        background: '#eff6ff',
                                        color: '#1d4ed8',
                                        padding: '4px 12px',
                                        borderRadius: 20,
                                        fontSize: 13,
                                        fontWeight: 600,
                                        textDecoration: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6
                                    }}
                                >
                                    {article.category.icon} {article.category.name}
                                </Link>
                            )}
                            <span style={{ color: '#6b7280', fontSize: 13, display: 'flex', alignItems: 'center' }}>
                                📅 {new Date(article.publishedAt).toLocaleDateString('vi-VN')}
                            </span>
                        </div>

                        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#111827', lineHeight: 1.3, marginBottom: 20 }}>
                            {article.title}
                        </h1>

                        <div style={{ fontSize: 18, color: '#4b5563', lineHeight: 1.6, fontStyle: 'italic', borderLeft: '4px solid #3b82f6', paddingLeft: 20 }}>
                            {article.excerpt}
                        </div>

                        {/* Social Share Buttons */}
                        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                            <a
                                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    background: '#1877f2',
                                    color: 'white',
                                    padding: '8px 16px',
                                    borderRadius: 6,
                                    textDecoration: 'none',
                                    fontSize: 14,
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6
                                }}
                            >
                                Facebook
                            </a>
                            <a
                                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article.title)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    background: '#1da1f2',
                                    color: 'white',
                                    padding: '8px 16px',
                                    borderRadius: 6,
                                    textDecoration: 'none',
                                    fontSize: 14,
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6
                                }}
                            >
                                Twitter
                            </a>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert('Đã sao chép liên kết!');
                                }}
                                style={{
                                    background: '#f3f4f6',
                                    color: '#374151',
                                    border: '1px solid #d1d5db',
                                    padding: '8px 16px',
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    fontSize: 14,
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6
                                }}
                            >
                                🔗 Copy Link
                            </button>
                        </div>
                    </header>

                    <img
                        src={article.featuredImage}
                        alt={article.title}
                        loading="lazy"
                        decoding="async"
                        style={{ width: '100%', borderRadius: 8, marginBottom: 40 }}
                    />

                    {/* Table of Contents (Mobile/Inline) */}
                    {toc.length > 0 && (
                        <div style={{
                            background: '#f3f4f6',
                            padding: 20,
                            borderRadius: 8,
                            marginBottom: 40,
                            border: '1px solid #e5e7eb'
                        }}>
                            <h3 style={{ margin: '0 0 12px 0', fontSize: 18 }}>Mục lục</h3>
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                                {toc.map(item => (
                                    <li key={item.id} style={{ marginBottom: 8 }}>
                                        <button
                                            onClick={() => scrollToHeading(item.id)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#3b82f6',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                fontSize: 15,
                                                padding: 0,
                                                textDecoration: 'underline'
                                            }}
                                        >
                                            {item.text}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div
                        ref={contentRef}
                        className="article-content"
                        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                        style={{ fontSize: 16, lineHeight: 1.8, color: '#374151' }}
                    />

                    {/* Tags */}
                    {article.tags && article.tags.length > 0 && (
                        <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid #e5e7eb' }}>
                            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Tags:</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {article.tags.map(tag => (
                                    <Link
                                        key={tag}
                                        to={`/health-news?search=${tag}`}
                                        style={{
                                            background: '#f3f4f6',
                                            color: '#4b5563',
                                            padding: '6px 12px',
                                            borderRadius: 4,
                                            textDecoration: 'none',
                                            fontSize: 13
                                        }}
                                    >
                                        #{tag}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </article>

                {/* Sidebar */}
                <aside>
                    {/* Author Card */}
                    {article.author && (
                        <div style={{ background: 'white', padding: 24, borderRadius: 12, marginBottom: 24, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ margin: '0 0 16px 0', fontSize: 18 }}>Tác giả</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: '50%',
                                    background: '#e5e7eb',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 24
                                }}>
                                    👨‍⚕️
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 16 }}>{article.author.name}</div>
                                    <div style={{ fontSize: 13, color: '#6b7280' }}>{article.author.bio || 'Chuyên gia y tế'}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Related Products */}
                    {article.relatedProducts && article.relatedProducts.length > 0 && (
                        <div style={{ background: 'white', padding: 24, borderRadius: 12, marginBottom: 24, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ margin: '0 0 16px 0', fontSize: 18 }}>Sản phẩm liên quan</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {article.relatedProducts.map(product => (
                                    <Link
                                        key={product._id}
                                        to={`/p/${product.slug}`}
                                        style={{ display: 'flex', gap: 12, textDecoration: 'none', color: 'inherit' }}
                                    >
                                        <img
                                            src={product.images?.[0] || 'https://via.placeholder.com/60'}
                                            alt={product.name}
                                            style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }}
                                        />
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4, marginBottom: 4 }}>
                                                {product.name}
                                            </div>
                                            <div style={{ color: '#ef4444', fontWeight: 600, fontSize: 14 }}>
                                                {product.price?.toLocaleString()}₫
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Related Articles */}
                    {article.relatedArticles && article.relatedArticles.length > 0 && (
                        <div style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ margin: '0 0 16px 0', fontSize: 18 }}>Bài viết liên quan</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {article.relatedArticles.map(related => (
                                    <Link
                                        key={related._id}
                                        to={`/health-news/${related.slug}`}
                                        style={{ display: 'flex', gap: 12, textDecoration: 'none', color: 'inherit' }}
                                    >
                                        <img
                                            src={related.featuredImage}
                                            alt={related.title}
                                            style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6 }}
                                        />
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4, marginBottom: 4 }}>
                                                {related.title}
                                            </div>
                                            <div style={{ fontSize: 12, color: '#6b7280' }}>
                                                {new Date(related.publishedAt).toLocaleDateString('vi-VN')}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}

export default HealthNewsDetail;
