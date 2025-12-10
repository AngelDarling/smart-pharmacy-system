export default function FiltersSidebar({ filters, categories, onFilterChange }) {
    const priceRanges = [
        { label: 'Dưới 100.000₫', min: '', max: '100000' },
        { label: '100.000₫ đến 300.000₫', min: '100000', max: '300000' },
        { label: '300.000₫ đến 500.000₫', min: '300000', max: '500000' },
        { label: 'Trên 500.000₫', min: '500000', max: '' }
    ];

    const isPriceRangeActive = (range) => {
        return filters.minPrice === range.min && filters.maxPrice === range.max;
    };

    return (
        <div style={{ width: 280, flexShrink: 0 }}>
            <div style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700, color: '#1f2937' }}>
                    Bộ lọc nâng cao
                </h3>

                {/* Search */}
                <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151', fontSize: 14 }}>
                        Tìm kiếm
                    </label>
                    <input
                        type="text"
                        placeholder="Tìm sản phẩm..."
                        value={filters.searchTerm}
                        onChange={(e) => onFilterChange('searchTerm', e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 14px',
                            border: '1px solid #d1d5db',
                            borderRadius: 8,
                            fontSize: 14,
                            outline: 'none',
                            transition: 'border-color 0.2s',
                            boxSizing: 'border-box'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                </div>

                {/* Category Filter */}
                <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', marginBottom: 12, fontWeight: 600, color: '#374151' }}>
                        Loại sản phẩm
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="category"
                                value=""
                                checked={filters.category === ''}
                                onChange={(e) => onFilterChange('category', e.target.value)}
                                style={{ margin: 0 }}
                            />
                            <span style={{ fontSize: 14, color: '#374151' }}>Tất cả</span>
                        </label>
                        {categories.slice(0, 5).map(category => (
                            <label key={category._id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="category"
                                    value={category.slug}
                                    checked={filters.category === category.slug}
                                    onChange={(e) => onFilterChange('category', e.target.value)}
                                    style={{ margin: 0 }}
                                />
                                <span style={{ fontSize: 14, color: '#374151' }}>{category.name}</span>
                            </label>
                        ))}
                        {categories.length > 5 && (
                            <button style={{
                                color: '#3b82f6',
                                background: 'none',
                                border: 'none',
                                fontSize: 14,
                                cursor: 'pointer',
                                textAlign: 'left',
                                padding: 0
                            }}>
                                Xem thêm
                            </button>
                        )}
                    </div>
                </div>

                {/* Price Range */}
                <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', marginBottom: 12, fontWeight: 600, color: '#374151', fontSize: 14 }}>
                        Giá bán
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {priceRanges.map((range, index) => {
                            const isActive = isPriceRangeActive(range);
                            return (
                                <button
                                    key={index}
                                    onClick={() => {
                                        onFilterChange('minPrice', range.min);
                                        onFilterChange('maxPrice', range.max);
                                    }}
                                    style={{
                                        padding: '12px 16px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: 8,
                                        fontSize: 15,
                                        background: isActive ? '#eff6ff' : 'white',
                                        color: '#374151',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        transition: 'all 0.2s',
                                        fontWeight: isActive ? 600 : 400
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            e.target.style.background = '#f9fafb';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            e.target.style.background = 'white';
                                        }
                                    }}
                                >
                                    {range.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
