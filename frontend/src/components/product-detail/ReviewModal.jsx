import Swal from 'sweetalert2';
import { getImageUrl, handleImageError } from "../../utils/imageUtils";

export default function ReviewModal({
    show,
    product,
    user,
    reviewForm,
    onClose,
    onFormChange,
    onSubmit,
    formatPrice,
    loadReviews
}) {
    if (!show) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!reviewForm.rating || reviewForm.rating === 0) {
            Swal.fire({
                icon: "warning",
                title: "Thiếu thông tin",
                text: "Vui lòng chọn số sao đánh giá",
                confirmButtonColor: "#3b82f6"
            });
            return;
        }

        if (!reviewForm.comment || !reviewForm.comment.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Thiếu thông tin",
                text: "Vui lòng nhập nội dung đánh giá",
                confirmButtonColor: "#3b82f6"
            });
            return;
        }

        // Nếu chưa đăng nhập, kiểm tra thông tin guest
        if (!user) {
            if (!reviewForm.guestName || !reviewForm.guestName.trim()) {
                Swal.fire({
                    icon: "warning",
                    title: "Thiếu thông tin",
                    text: "Vui lòng nhập họ và tên",
                    confirmButtonColor: "#3b82f6"
                });
                return;
            }
            if (!reviewForm.guestPhone || !reviewForm.guestPhone.trim()) {
                Swal.fire({
                    icon: "warning",
                    title: "Thiếu thông tin",
                    text: "Vui lòng nhập số điện thoại",
                    confirmButtonColor: "#3b82f6"
                });
                return;
            }
        }

        await onSubmit(e);
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: 20
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'white',
                    borderRadius: 12,
                    padding: 30,
                    maxWidth: 600,
                    width: '100%',
                    maxHeight: '90vh',
                    overflowY: 'auto'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 24
                }}>
                    <h3 style={{
                        fontSize: 24,
                        fontWeight: 700,
                        color: '#1f2937',
                        margin: 0
                    }}>
                        Đánh giá sản phẩm
                    </h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: 28,
                            color: '#9ca3af',
                            cursor: 'pointer',
                            padding: 0,
                            lineHeight: 1
                        }}
                    >
                        ×
                    </button>
                </div>

                <div style={{
                    display: 'flex',
                    gap: 16,
                    marginBottom: 24,
                    padding: 16,
                    background: '#f8f9fa',
                    borderRadius: 8
                }}>
                    <img
                        src={getImageUrl(product.imageUrls?.[0], '/default-product.svg')}
                        alt={product.name}
                        style={{
                            width: 60,
                            height: 60,
                            objectFit: 'contain',
                            borderRadius: 8
                        }}
                        onError={(e) => handleImageError(e, '/default-product.svg')}
                    />
                    <div>
                        <div style={{
                            fontWeight: 600,
                            color: '#1f2937',
                            fontSize: 15,
                            marginBottom: 4
                        }}>
                            {product.name}
                        </div>
                        <div style={{ fontSize: 14, color: '#6b7280' }}>
                            {formatPrice(product.price)}₫
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{
                            display: 'block',
                            marginBottom: 8,
                            fontWeight: 600,
                            color: '#374151'
                        }}>
                            Chọn đánh giá <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <div style={{ display: 'flex', gap: 8, fontSize: 36 }}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => onFormChange('rating', star)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: reviewForm.rating >= star ? '#fbbf24' : '#d1d5db',
                                        padding: 0,
                                        fontSize: 36,
                                        transition: 'color 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (reviewForm.rating < star) {
                                            e.target.style.color = '#fbbf24';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (reviewForm.rating < star) {
                                            e.target.style.color = '#d1d5db';
                                        }
                                    }}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                        <div style={{
                            marginTop: 8,
                            fontSize: 14,
                            color: '#f59e0b',
                            fontWeight: 600
                        }}>
                            {reviewForm.rating === 0 && 'Chưa chọn'}
                            {reviewForm.rating === 1 && 'Rất tệ'}
                            {reviewForm.rating === 2 && 'Tệ'}
                            {reviewForm.rating === 3 && 'Bình thường'}
                            {reviewForm.rating === 4 && 'Tốt'}
                            {reviewForm.rating === 5 && 'Tuyệt vời'}
                        </div>
                    </div>

                    {!user && (
                        <>
                            <div style={{ marginBottom: 20 }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: 8,
                                    fontWeight: 600,
                                    color: '#374151'
                                }}>
                                    Họ và tên <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    value={reviewForm.guestName}
                                    onChange={(e) => onFormChange('guestName', e.target.value)}
                                    placeholder="Nhập họ và tên"
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: 8,
                                        fontSize: 15,
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                />
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: 8,
                                    fontWeight: 600,
                                    color: '#374151'
                                }}>
                                    Số điện thoại <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    type="tel"
                                    value={reviewForm.guestPhone}
                                    onChange={(e) => onFormChange('guestPhone', e.target.value)}
                                    placeholder="Nhập số điện thoại"
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: 8,
                                        fontSize: 15,
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                />
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: 8,
                                    fontWeight: 600,
                                    color: '#374151'
                                }}>
                                    Email (Không bắt buộc)
                                </label>
                                <input
                                    type="email"
                                    value={reviewForm.guestEmail}
                                    onChange={(e) => onFormChange('guestEmail', e.target.value)}
                                    placeholder="Nhập email (Không bắt buộc)"
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: 8,
                                        fontSize: 15,
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                />
                            </div>
                        </>
                    )}

                    <div style={{ marginBottom: 24 }}>
                        <label style={{
                            display: 'block',
                            marginBottom: 8,
                            fontWeight: 600,
                            color: '#374151'
                        }}>
                            Nội dung đánh giá <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <textarea
                            value={reviewForm.comment}
                            onChange={(e) => onFormChange('comment', e.target.value)}
                            placeholder="Nhập nội dung đánh giá (Vui lòng gõ tiếng Việt có dấu)..."
                            rows={5}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '1px solid #d1d5db',
                                borderRadius: 8,
                                fontSize: 15,
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                resize: 'vertical',
                                fontFamily: 'inherit'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                    </div>

                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            padding: '14px',
                            fontSize: 16,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#2563eb'}
                        onMouseLeave={(e) => e.target.style.background = '#3b82f6'}
                    >
                        Gửi đánh giá
                    </button>
                </form>
            </div>
        </div>
    );
}
