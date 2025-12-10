import React from 'react';
import { Link } from 'react-router-dom';

export default function Breadcrumb({ categoryBreadcrumb, query }) {
    return (
        <div style={{ background: 'transparent', padding: '12px 0' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#6b7280', flexWrap: 'wrap' }}>
                    <Link to="/" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                        Trang chủ
                    </Link>
                    {categoryBreadcrumb.length === 0 && !query ? (
                        <>
                            <span>/</span>
                            <span style={{ color: '#1f2937', fontWeight: 600 }}>Danh sách sản phẩm</span>
                        </>
                    ) : (
                        <>
                            {categoryBreadcrumb.map((cat, index) => (
                                <React.Fragment key={cat._id}>
                                    <span>/</span>
                                    <Link
                                        to={`/catalog?category=${cat.slug}`}
                                        style={{
                                            color: index === categoryBreadcrumb.length - 1 ? '#1f2937' : '#3b82f6',
                                            textDecoration: 'none',
                                            fontWeight: index === categoryBreadcrumb.length - 1 ? 600 : 400
                                        }}
                                    >
                                        {cat.name}
                                    </Link>
                                </React.Fragment>
                            ))}
                            {query && (
                                <>
                                    <span>/</span>
                                    <span style={{ color: '#1f2937', fontWeight: 600 }}>Tìm kiếm "{query}"</span>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
