export default function ProductTabs({ product, activeTab, onTabChange }) {
    const tabs = [
        { key: 'description', label: 'Mô tả sản phẩm' },
        { key: 'usage', label: 'Cách sử dụng' },
        { key: 'storage', label: 'Bảo quản' },
        { key: 'ingredients', label: 'Thành phần' }
    ];

    const getTabContent = () => {
        switch (activeTab) {
            case 'description':
                return product.description || 'Sản phẩm đang cập nhật mô tả chi tiết.';
            case 'usage':
                return product.attributes?.usage || product.usage || 'Vui lòng tham khảo hướng dẫn sử dụng trên bao bì sản phẩm hoặc tư vấn dược sĩ.';
            case 'storage':
                return product.attributes?.storage || 'Bảo quản nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp. Để xa tầm tay trẻ em.';
            case 'ingredients':
                return product.ingredients || product.attributes?.ingredients || 'Đang cập nhật thông tin thành phần.';
            default:
                return '';
        }
    };

    return (
        <div style={{
            background: 'white',
            borderRadius: 12,
            marginBottom: 24,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden'
        }}>
            {/* Tabs Header */}
            <div style={{
                display: 'flex',
                borderBottom: '2px solid #f3f4f6',
                overflowX: 'auto'
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => onTabChange(tab.key)}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '18px 28px',
                            cursor: 'pointer',
                            fontSize: 15,
                            fontWeight: 600,
                            color: activeTab === tab.key ? '#3b82f6' : '#6b7280',
                            borderBottom: activeTab === tab.key ? '3px solid #3b82f6' : '3px solid transparent',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => {
                            if (activeTab !== tab.key) {
                                e.target.style.color = '#374151';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (activeTab !== tab.key) {
                                e.target.style.color = '#6b7280';
                            }
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div style={{ padding: 30, fontSize: 15, color: '#374151', lineHeight: 1.8 }}>
                {getTabContent()}
            </div>
        </div>
    );
}
