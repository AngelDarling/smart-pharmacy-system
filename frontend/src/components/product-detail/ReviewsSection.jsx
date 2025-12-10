export default function ReviewsSection({
    reviews,
    averageRating,
    totalReviews,
    ratingDistribution,
    onOpenReviewModal,
    formatReviewDate,
    getReviewerName,
    getInitials
}) {
    return (
        <div style={{
            background: 'white',
            borderRadius: 12,
            padding: 30,
            marginBottom: 24,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 24
            }}>
                <h2 style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: '#1f2937',
                    margin: 0
                }}>
                    Đánh giá sản phẩm
                    <span style={{ color: '#6b7280', fontWeight: 400, fontSize: 18, marginLeft: 8 }}>
                        ({totalReviews} đánh giá)
                    </span>
                </h2>
                <button
                    onClick={onOpenReviewModal}
                    style={{
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        padding: '12px 24px',
                        fontSize: 15,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#2563eb'}
                    onMouseLeave={(e) => e.target.style.background = '#3b82f6'}
                >
                    Gửi đánh giá
                </button>
            </div>

            {/* Rating Summary */}
            <div style={{
                background: '#f8f9fa',
                borderRadius: 8,
                padding: 24,
                marginBottom: 24
            }}>
                <div style={{ display: 'flex', gap: 40 }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            fontSize: 48,
                            fontWeight: 700,
                            color: '#1f2937',
                            lineHeight: 1
                        }}>
                            {averageRating.toFixed(1)}
                            <svg
                                width="40"
                                height="40"
                                viewBox="0 0 20 20"
                                fill="#fbbf24"
                                style={{ marginLeft: 8, verticalAlign: 'middle' }}
                            >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        </div>
                        <div style={{ color: '#6b7280', fontSize: 14, marginTop: 8 }}>
                            Trung bình
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        {[5, 4, 3, 2, 1].map(star => {
                            const count = ratingDistribution[star] || 0;
                            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                            return (
                                <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                    <div style={{ display: 'flex', gap: 2 }}>
                                        {[...Array(star)].map((_, i) => (
                                            <svg key={i} width="16" height="16" viewBox="0 0 20 20" fill="#fbbf24">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <div style={{ flex: 1, height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${percentage}%`,
                                            height: '100%',
                                            background: '#fbbf24',
                                            transition: 'width 0.3s'
                                        }} />
                                    </div>
                                    <span style={{ fontSize: 14, color: '#6b7280', width: 30, textAlign: 'right' }}>
                                        {count}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {reviews.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                        color: '#6b7280'
                    }}>
                        Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!
                    </div>
                ) : (
                    reviews.map(review => (
                        <div key={review._id} style={{
                            paddingBottom: 20,
                            borderBottom: '1px solid #e5e7eb'
                        }}>
                            <div style={{ display: 'flex', gap: 16 }}>
                                <div style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 18,
                                    fontWeight: 700,
                                    flexShrink: 0
                                }}>
                                    {getInitials(getReviewerName(review))}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        marginBottom: 8
                                    }}>
                                        <span style={{ fontWeight: 600, color: '#1f2937', fontSize: 16 }}>
                                            {getReviewerName(review)}
                                        </span>
                                        <div style={{ display: 'flex', gap: 2 }}>
                                            {[...Array(review.rating)].map((_, i) => (
                                                <svg key={i} width="16" height="16" viewBox="0 0 20 20" fill="#fbbf24">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <span style={{ fontSize: 14, color: '#9ca3af' }}>
                                            {formatReviewDate(review.createdAt)}
                                        </span>
                                    </div>
                                    <p style={{
                                        margin: 0,
                                        color: '#374151',
                                        fontSize: 15,
                                        lineHeight: 1.6,
                                        marginBottom: review.adminReply ? 12 : 0
                                    }}>
                                        {review.comment}
                                    </p>
                                    {review.adminReply && (
                                        <div style={{
                                            marginTop: 12,
                                            padding: 12,
                                            background: '#f0f9ff',
                                            borderRadius: 8,
                                            borderLeft: '3px solid #3b82f6'
                                        }}>
                                            <div style={{
                                                fontSize: 13,
                                                fontWeight: 600,
                                                color: '#3b82f6',
                                                marginBottom: 6
                                            }}>
                                                Phản hồi từ cửa hàng:
                                            </div>
                                            <div style={{
                                                fontSize: 14,
                                                color: '#374151',
                                                lineHeight: 1.6
                                            }}>
                                                {review.adminReply}
                                            </div>
                                            {review.adminReplyAt && (
                                                <div style={{
                                                    fontSize: 12,
                                                    color: '#6b7280',
                                                    marginTop: 8
                                                }}>
                                                    {formatReviewDate(review.adminReplyAt)}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
