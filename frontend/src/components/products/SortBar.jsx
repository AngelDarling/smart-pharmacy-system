export default function SortBar({ sortBy, viewMode, onSortChange, onViewModeChange }) {
    const sortOptions = [
        { value: 'bestselling', label: 'Bán chạy' },
        { value: 'price_asc', label: 'Giá thấp' },
        { value: 'price_desc', label: 'Giá cao' },
        { value: 'name', label: 'Tên A-Z' },
        { value: 'discount', label: 'Giảm giá nhiều' }
    ];

    return (
        <div style={{
            background: 'transparent',
            padding: '16px 24px',
            borderRadius: 12,
            marginBottom: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontWeight: 600, color: '#374151' }}>Sắp xếp theo:</span>
                <div style={{ display: 'flex', gap: 8 }}>
                    {sortOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => onSortChange(option.value)}
                            style={{
                                padding: '8px 16px',
                                border: '1px solid #d1d5db',
                                background: sortBy === option.value ? '#3b82f6' : 'white',
                                color: sortBy === option.value ? 'white' : '#374151',
                                borderRadius: 6,
                                cursor: 'pointer',
                                fontSize: 14,
                                fontWeight: 500,
                                transition: 'all 0.2s'
                            }}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
                <button
                    onClick={() => onViewModeChange('grid')}
                    style={{
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        background: viewMode === 'grid' ? '#3b82f6' : 'white',
                        color: viewMode === 'grid' ? 'white' : '#374151',
                        borderRadius: 6,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    title="Hiển thị dạng lưới"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" />
                        <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" />
                        <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" />
                        <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" />
                    </svg>
                </button>
                <button
                    onClick={() => onViewModeChange('list')}
                    style={{
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        background: viewMode === 'list' ? '#3b82f6' : 'white',
                        color: viewMode === 'list' ? 'white' : '#374151',
                        borderRadius: 6,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    title="Hiển thị dạng danh sách"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <line x1="8" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" />
                        <line x1="8" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" />
                        <line x1="8" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" />
                        <line x1="3" y1="6" x2="3.01" y2="6" stroke="currentColor" strokeWidth="2" />
                        <line x1="3" y1="12" x2="3.01" y2="12" stroke="currentColor" strokeWidth="2" />
                        <line x1="3" y1="18" x2="3.01" y2="18" stroke="currentColor" strokeWidth="2" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
