import React from 'react';
import { Link } from 'react-router-dom';

export default function Breadcrumb({ categoryBreadcrumb, productName }) {
    return (
        <div style={{ background: 'white', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#6b7280', flexWrap: 'wrap' }}>
                    <Link to="/" style={{ color: '#3b82f6', textDecoration: 'none' }}>Trang chủ</Link>
                    {categoryBreadcrumb.length > 0 && (
                        <>
                            {categoryBreadcrumb.map((cat) => (
                                <React.Fragment key={cat._id}>
                                    <span>/</span>
                                    <Link
                                        to={`/catalog?category=${cat.slug}`}
                                        style={{
                                            color: '#3b82f6',
                                            textDecoration: 'none'
                                        }}
                                    >
                                        {cat.name}
                                    </Link>
                                </React.Fragment>
                            ))}
                        </>
                    )}
                    <span>/</span>
                    <span style={{ color: '#1f2937', fontWeight: 600 }}>{productName}</span>
                </div>
            </div>
        </div>
    );
}
