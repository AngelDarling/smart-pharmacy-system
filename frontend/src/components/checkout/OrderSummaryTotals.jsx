export default function OrderSummaryTotals({
    itemsSubtotal,
    productSavings,
    shippingFee,
    couponDiscount,
    grandTotal
}) {
    return (
        <>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                padding: '16px 0',
                borderTop: '1px solid #e5e7eb',
                borderBottom: '2px solid #e5e7eb',
                marginBottom: 16
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 14,
                    color: '#6b7280'
                }}>
                    <span>Tạm tính:</span>
                    <span>{itemsSubtotal.toLocaleString()}₫</span>
                </div>

                {productSavings > 0 && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 14,
                        color: '#6b7280'
                    }}>
                        <span>Tiết kiệm từ sản phẩm:</span>
                        <span style={{ color: "#10b981" }}>
                            -{productSavings.toLocaleString()}₫
                        </span>
                    </div>
                )}

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 14,
                    color: '#6b7280'
                }}>
                    <span>Phí vận chuyển:</span>
                    <span style={{ color: shippingFee === 0 ? "#10b981" : "#6b7280" }}>
                        {shippingFee === 0 ? "Miễn phí" : `${shippingFee.toLocaleString()}₫`}
                    </span>
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 14,
                    color: '#6b7280'
                }}>
                    <span>Giảm giá:</span>
                    <span style={{ color: couponDiscount > 0 ? "#ef4444" : "#6b7280" }}>
                        {couponDiscount > 0 ? `-${couponDiscount.toLocaleString()}₫` : "0₫"}
                    </span>
                </div>
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 0',
                marginBottom: 20
            }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: '#1f2937' }}>
                    Tổng cộng:
                </span>
                <span style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: '#3b82f6'
                }}>
                    {grandTotal.toLocaleString()}₫
                </span>
            </div>
        </>
    );
}
