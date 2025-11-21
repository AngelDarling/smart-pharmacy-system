import { Link } from 'react-router-dom';

function HealthNewsCard({ article }) {
    return (
        <Link
            to={`/health-news/${article.slug}`}
            style={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'block',
                height: '100%'
            }}
        >
            <div style={{
                background: 'white',
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer'
            }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
                }}
            >
                {/* Image */}
                <div style={{ position: 'relative', paddingTop: '60%' }}>
                    <img
                        src={article.featuredImage}
                        alt={article.title}
                        loading="lazy"
                        decoding="async"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                    />
                    {article.category && (
                        <span style={{
                            position: 'absolute',
                            top: 12,
                            left: 12,
                            background: 'rgba(255,255,255,0.9)',
                            padding: '4px 10px',
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#059669',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            {article.category.icon} {article.category.name}
                        </span>
                    )}
                </div>

                {/* Content */}
                <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{
                        margin: '0 0 8px 0',
                        fontSize: 18,
                        fontWeight: 600,
                        lineHeight: 1.4,
                        color: '#111827',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {article.title}
                    </h3>

                    <p style={{
                        margin: '0 0 16px 0',
                        fontSize: 14,
                        color: '#6b7280',
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        flex: 1
                    }}>
                        {article.excerpt}
                    </p>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: 12,
                        color: '#9ca3af',
                        borderTop: '1px solid #f3f4f6',
                        paddingTop: 12
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>📅 {new Date(article.publishedAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <span title="Lượt xem">👁️ {article.viewCount}</span>
                            <span title="Lượt thích">❤️ {article.likeCount}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default HealthNewsCard;
