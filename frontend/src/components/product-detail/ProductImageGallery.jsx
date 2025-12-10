import { getImageUrl, handleImageError } from "../../utils/imageUtils";

export default function ProductImageGallery({ images, productName, selectedImage, onImageSelect }) {
    return (
        <div style={{ width: 450, flexShrink: 0 }}>
            {/* Main Image */}
            <div style={{
                width: '100%',
                height: 450,
                background: 'white',
                borderRadius: 12,
                overflow: 'hidden',
                marginBottom: 16,
                border: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <img
                    src={getImageUrl(images[selectedImage], '/default-product.svg')}
                    alt={productName}
                    style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                    }}
                    onError={(e) => handleImageError(e, '/default-product.svg')}
                />
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {images.map((img, index) => (
                        <div
                            key={index}
                            onClick={() => onImageSelect(index)}
                            style={{
                                width: 90,
                                height: 90,
                                background: 'white',
                                borderRadius: 8,
                                overflow: 'hidden',
                                cursor: 'pointer',
                                border: selectedImage === index ? '3px solid #3b82f6' : '1px solid #e5e7eb',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onMouseEnter={(e) => {
                                if (selectedImage !== index) {
                                    e.currentTarget.style.borderColor = '#3b82f6';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (selectedImage !== index) {
                                    e.currentTarget.style.borderColor = '#e5e7eb';
                                }
                            }}
                        >
                            <img
                                src={getImageUrl(img, '/default-product.svg')}
                                alt={`${productName} ${index + 1}`}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain'
                                }}
                                onError={(e) => handleImageError(e, '/default-product.svg')}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
