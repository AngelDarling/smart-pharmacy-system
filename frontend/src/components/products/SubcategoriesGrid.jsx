import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function SubcategoriesGrid({
    isLevel0Category,
    isLevel1Category,
    subCategories,
    subCategoryPage,
    hoveredCard,
    onHoveredCard,
    onSubCategoryPageChange,
    getVisibleSubCategories
}) {
    const navigate = useNavigate();

    if (!((isLevel0Category || isLevel1Category) && subCategories.length > 0)) {
        return null;
    }

    return (
        <div style={{ background: 'transparent', padding: '20px 0' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isLevel1Category
                        ? 'repeat(4, 1fr)'
                        : 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: 16,
                    marginBottom: 20
                }}>
                    {subCategories.map((subCategory) => {
                        const visibleSubCategories = getVisibleSubCategories(subCategory);
                        const pagination = subCategoryPage[subCategory._id];
                        const hasMore = pagination && pagination.total > 1;

                        return (
                            <div key={subCategory._id} style={{
                                background: 'white',
                                borderRadius: 8,
                                padding: isLevel1Category ? 12 : 16,
                                boxShadow: hoveredCard === subCategory._id
                                    ? '0 4px 12px rgba(0,0,0,0.15)'
                                    : '0 1px 3px rgba(0,0,0,0.1)',
                                transition: 'box-shadow 0.2s ease-in-out',
                                cursor: 'pointer',
                                border: 'none',
                                outline: 'none'
                            }}
                                onClick={() => {
                                    if (isLevel1Category) {
                                        navigate(`/catalog?category=${subCategory.slug}`);
                                    }
                                }}
                                onMouseEnter={() => onHoveredCard(subCategory._id)}
                                onMouseLeave={() => onHoveredCard(null)}
                            >
                                {isLevel1Category ? (
                                    // Simple layout for level 2 categories
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        {/* Icon */}
                                        <div style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: 6,
                                            background: '#f3f4f6',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            {subCategory.iconUrl ? (
                                                <img
                                                    src={subCategory.iconUrl.startsWith('http') ? subCategory.iconUrl : `${subCategory.iconUrl}`}
                                                    alt={subCategory.name}
                                                    style={{ width: 24, height: 24, objectFit: 'contain' }}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'block';
                                                    }}
                                                />
                                            ) : null}
                                            <div style={{
                                                display: subCategory.iconUrl ? 'none' : 'block',
                                                fontSize: 20,
                                                color: '#6b7280'
                                            }}>
                                                📦
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h3 style={{
                                                margin: '0 0 4px',
                                                fontSize: 14,
                                                fontWeight: 600,
                                                color: '#1f2937',
                                                lineHeight: 1.2
                                            }}>
                                                {subCategory.name}
                                            </h3>
                                            <p style={{
                                                margin: 0,
                                                fontSize: 12,
                                                color: '#6b7280',
                                                fontWeight: 500
                                            }}>
                                                {subCategory.productCount || 0} sản phẩm
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    // Complex layout for level 1 categories
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                        {/* Icon */}
                                        <div style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 6,
                                            background: '#f3f4f6',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            {subCategory.iconUrl ? (
                                                <img
                                                    src={subCategory.iconUrl.startsWith('http') ? subCategory.iconUrl : `${subCategory.iconUrl}`}
                                                    alt={subCategory.name}
                                                    style={{ width: 28, height: 28, objectFit: 'contain' }}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'block';
                                                    }}
                                                />
                                            ) : null}
                                            <div style={{
                                                display: subCategory.iconUrl ? 'none' : 'block',
                                                fontSize: 24,
                                                color: '#6b7280'
                                            }}>
                                                📦
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h3 style={{
                                                margin: '0 0 6px',
                                                fontSize: 17,
                                                fontWeight: 700,
                                                color: '#1f2937',
                                                lineHeight: 1.2
                                            }}>
                                                {subCategory.name}
                                            </h3>
                                            <p style={{
                                                margin: '0 0 10px',
                                                fontSize: 15,
                                                color: '#6b7280',
                                                fontWeight: 500
                                            }}>
                                                {subCategory.productCount || 0} sản phẩm
                                            </p>

                                            {/* Level 2 subcategories */}
                                            {visibleSubCategories.length > 0 && (
                                                <div style={{ marginBottom: 10 }}>
                                                    {visibleSubCategories.map((level2Category) => (
                                                        <button
                                                            key={level2Category._id}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/catalog?category=${level2Category.slug}`);
                                                            }}
                                                            style={{
                                                                display: 'block',
                                                                width: '100%',
                                                                textAlign: 'left',
                                                                background: 'none',
                                                                border: 'none',
                                                                outline: 'none',
                                                                padding: '3px 0',
                                                                fontSize: 14,
                                                                color: '#3b82f6',
                                                                cursor: 'pointer',
                                                                transition: 'color 0.2s ease-in-out',
                                                                textDecoration: 'none'
                                                            }}
                                                            onMouseEnter={(e) => e.target.style.color = '#1d4ed8'}
                                                            onMouseLeave={(e) => e.target.style.color = '#3b82f6'}
                                                        >
                                                            {level2Category.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Pagination dots */}
                                            {hasMore && (
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'flex-end',
                                                    gap: 4
                                                }}>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onSubCategoryPageChange(subCategory._id, 'prev');
                                                        }}
                                                        disabled={pagination.current === 0}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            outline: 'none',
                                                            padding: '4px',
                                                            cursor: pagination.current === 0 ? 'not-allowed' : 'pointer',
                                                            opacity: pagination.current === 0 ? 0.3 : 1,
                                                            fontSize: 12
                                                        }}
                                                    >
                                                        ◀
                                                    </button>
                                                    {Array.from({ length: pagination.total }, (_, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onSubCategoryPageChange(subCategory._id, i);
                                                            }}
                                                            style={{
                                                                width: 6,
                                                                height: 6,
                                                                borderRadius: '50%',
                                                                border: 'none',
                                                                outline: 'none',
                                                                background: i === pagination.current ? '#3b82f6' : '#d1d5db',
                                                                cursor: 'pointer',
                                                                padding: 0
                                                            }}
                                                        />
                                                    ))}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onSubCategoryPageChange(subCategory._id, 'next');
                                                        }}
                                                        disabled={pagination.current === pagination.total - 1}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            outline: 'none',
                                                            padding: '4px',
                                                            cursor: pagination.current === pagination.total - 1 ? 'not-allowed' : 'pointer',
                                                            opacity: pagination.current === pagination.total - 1 ? 0.3 : 1,
                                                            fontSize: 12
                                                        }}
                                                    >
                                                        ▶
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
