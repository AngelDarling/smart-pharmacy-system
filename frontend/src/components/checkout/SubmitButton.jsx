export default function SubmitButton({ isSubmitting, disabled }) {
    return (
        <>
            <button
                type="submit"
                form="checkout-form"
                style={{
                    width: '100%',
                    padding: '16px',
                    background: disabled || isSubmitting ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: disabled || isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    marginBottom: 16
                }}
                disabled={disabled || isSubmitting}
                onMouseEnter={(e) => {
                    if (!disabled && !isSubmitting) {
                        e.target.style.background = '#2563eb';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!disabled && !isSubmitting) {
                        e.target.style.background = '#3b82f6';
                    }
                }}
            >
                {isSubmitting ? "Đang xử lý..." : "Đặt hàng"}
            </button>

            <div style={{
                fontSize: 12,
                color: '#6b7280',
                textAlign: 'center',
                lineHeight: 1.6
            }}>
                Bằng việc đặt hàng, bạn đồng ý với{" "}
                <a href="#" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                    Điều khoản dịch vụ
                </a>{" "}
                và{" "}
                <a href="#" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                    Chính sách xử lý dữ liệu cá nhân
                </a>{" "}
                của Smart Pharmacy.
            </div>
        </>
    );
}
