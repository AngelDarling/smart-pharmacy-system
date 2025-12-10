export default function ProductSpecs({ product }) {
    return (
        <div style={{
            background: '#f8f9fa',
            borderRadius: 8,
            padding: 20,
            marginBottom: 24
        }}>
            <h3 style={{
                fontSize: 18,
                fontWeight: 600,
                color: '#1f2937',
                marginBottom: 16,
                marginTop: 0
            }}>
                Thông số kỹ thuật
            </h3>
            <div style={{
                display: 'grid',
                gridTemplateColumns: '140px 1fr',
                gap: '12px 20px',
                fontSize: 15,
                color: '#374151'
            }}>
                <div style={{ fontWeight: 600 }}>Mã sản phẩm:</div>
                <div>{product.sku || 'N/A'}</div>

                <div style={{ fontWeight: 600 }}>Thương hiệu:</div>
                <div>{product.brandId?.name || 'N/A'}</div>

                <div style={{ fontWeight: 600 }}>Danh mục:</div>
                <div>{product.categoryId?.name || 'N/A'}</div>

                <div style={{ fontWeight: 600 }}>Đơn vị:</div>
                <div>{product.unit || 'Hộp'}</div>

                {product.barcode && (
                    <>
                        <div style={{ fontWeight: 600 }}>Mã vạch:</div>
                        <div>{product.barcode}</div>
                    </>
                )}
            </div>
        </div>
    );
}
