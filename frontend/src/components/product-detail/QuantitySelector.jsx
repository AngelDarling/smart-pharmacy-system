export default function QuantitySelector({ quantity, maxStock, onQuantityChange, onAddToCart, disabled }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: 12, fontWeight: 600, color: '#374151' }}>Số lượng:</span>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: 8 }}>
                    <button
                        onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '10px 16px',
                            cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                            fontSize: 18,
                            color: quantity <= 1 ? '#d1d5db' : '#374151',
                            fontWeight: 600
                        }}
                    >
                        −
                    </button>
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => {
                            const value = parseInt(e.target.value || '1', 10);
                            onQuantityChange(Math.max(1, Math.min(value, maxStock)));
                        }}
                        min="1"
                        max={maxStock || 1}
                        style={{
                            width: 60,
                            textAlign: 'center',
                            border: 'none',
                            outline: 'none',
                            fontSize: 16,
                            color: '#1f2937',
                            fontWeight: 600
                        }}
                    />
                    <button
                        onClick={() => onQuantityChange(Math.min(quantity + 1, maxStock || 1))}
                        disabled={quantity >= (maxStock || 0)}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '10px 16px',
                            cursor: quantity >= (maxStock || 0) ? 'not-allowed' : 'pointer',
                            fontSize: 18,
                            color: quantity >= (maxStock || 0) ? '#d1d5db' : '#374151',
                            fontWeight: 600
                        }}
                    >
                        +
                    </button>
                </div>
                {quantity >= (maxStock || 0) && maxStock > 0 && (
                    <span style={{
                        fontSize: 13,
                        color: '#dc2626',
                        marginLeft: 8
                    }}>
                        (Đã đạt tối đa)
                    </span>
                )}
            </div>

            <button
                onClick={onAddToCart}
                disabled={disabled}
                style={{
                    flex: 1,
                    background: !disabled ? '#3b82f6' : '#9ca3af',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    padding: '14px 24px',
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: !disabled ? 'pointer' : 'not-allowed',
                    transition: 'background-color 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                }}
                onMouseEnter={(e) => {
                    if (!disabled) {
                        e.target.style.background = '#2563eb';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!disabled) {
                        e.target.style.background = '#3b82f6';
                    }
                }}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 2L9 6M15 2L15 6M6 8L18 8M6 12L18 12M4 6C4 5.44772 4.44772 5 5 5H19C19.5523 5 20 5.44772 20 6V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V6Z" />
                </svg>
                Thêm vào giỏ hàng
            </button>
        </div>
    );
}
