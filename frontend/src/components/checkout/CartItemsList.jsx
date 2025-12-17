import { getImageUrl, handleImageError } from "../../utils/imageUtils";

export default function CartItemsList({ items }) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            marginBottom: 20,
            maxHeight: 300,
            overflowY: 'auto',
            paddingRight: 8
        }}>
            {items.map((item) => {
                const hasDiscount = item.finalPrice !== undefined && item.finalPrice < item.price && (item.discount > 0 || item.originalPrice > item.finalPrice);
                const itemPrice = hasDiscount ? item.finalPrice : item.price;
                const originalPrice = hasDiscount ? (item.originalPrice || item.price) : null;

                return (
                    <div
                        key={item.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: 12,
                            background: '#f8f9fa',
                            borderRadius: 8,
                            gap: 12
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                            <img
                                src={getImageUrl(item.image, "/default-product.png")}
                                alt={item.name}
                                style={{
                                    width: 60,
                                    height: 60,
                                    objectFit: 'contain',
                                    borderRadius: 8,
                                    background: 'white',
                                    padding: 4
                                }}
                                onError={(e) => handleImageError(e, "/default-product.png")}
                            />
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: '#1f2937',
                                    marginBottom: 4,
                                    lineHeight: 1.4
                                }}>
                                    {item.name}
                                </div>
                                <div style={{
                                    fontSize: 13,
                                    color: '#6b7280'
                                }}>
                                    Số lượng: {item.qty}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                            <span style={{ color: '#3b82f6', fontWeight: 600, fontSize: 15 }}>
                                {(itemPrice * item.qty).toLocaleString()}₫
                            </span>
                            {originalPrice && (
                                <span style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'line-through' }}>
                                    {(originalPrice * item.qty).toLocaleString()}₫
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
