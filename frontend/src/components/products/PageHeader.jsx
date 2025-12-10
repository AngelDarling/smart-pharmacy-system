export default function PageHeader({ currentCategory, query }) {
    return (
        <div style={{ background: 'transparent', padding: '10px 0' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
                <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1f2937' }}>
                    {currentCategory ? currentCategory.name : query ? `Kết quả tìm kiếm` : 'Danh sách sản phẩm'}
                </h1>
            </div>
        </div>
    );
}
