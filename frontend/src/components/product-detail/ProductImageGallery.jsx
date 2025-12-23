import { useState } from 'react';
import { getImageUrl, handleImageError } from "../../utils/imageUtils";
import { Modal } from 'antd';

export default function ProductImageGallery({ images, productName, selectedImage, onImageSelect }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalImageIndex, setModalImageIndex] = useState(0);

    const MAX_THUMBNAILS = 5;
    const displayedImages = images.slice(0, MAX_THUMBNAILS);
    const remainingCount = images.length - MAX_THUMBNAILS;

    const handleThumbnailClick = (index) => {
        if (index === MAX_THUMBNAILS - 1 && remainingCount > 0) {
            // Click on overlay - open modal
            setModalImageIndex(0);
            setIsModalOpen(true);
        } else {
            // Normal thumbnail click
            onImageSelect(index);
        }
    };

    return (
        <div style={{ width: 500, flexShrink: 0 }}>
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
                justifyContent: 'center',
                position: 'relative'
            }}>
                <img
                    src={getImageUrl(images[selectedImage], '/default-product.svg')}
                    alt={productName}
                    style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        cursor: 'pointer'
                    }}
                    onClick={() => {
                        setModalImageIndex(selectedImage);
                        setIsModalOpen(true);
                    }}
                    onError={(e) => handleImageError(e, '/default-product.svg')}
                />

                {/* Previous Button */}
                {images.length > 1 && selectedImage > 0 && (
                    <button
                        onClick={() => onImageSelect(selectedImage - 1)}
                        style={{
                            position: 'absolute',
                            left: 16,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            border: 'none',
                            background: 'rgba(255, 255, 255, 0.9)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 18,
                            color: '#333',
                            transition: 'all 0.2s',
                            zIndex: 10
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
                            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                        }}
                    >
                        ‹
                    </button>
                )}

                {/* Next Button */}
                {images.length > 1 && selectedImage < images.length - 1 && (
                    <button
                        onClick={() => onImageSelect(selectedImage + 1)}
                        style={{
                            position: 'absolute',
                            right: 16,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            border: 'none',
                            background: 'rgba(255, 255, 255, 0.9)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 18,
                            color: '#333',
                            transition: 'all 0.2s',
                            zIndex: 10
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
                            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                        }}
                    >
                        ›
                    </button>
                )}
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'nowrap' }}>
                    {displayedImages.map((img, index) => {
                        const isLastThumbnail = index === MAX_THUMBNAILS - 1;
                        const showOverlay = isLastThumbnail && remainingCount > 0;

                        return (
                            <div
                                key={index}
                                onClick={() => handleThumbnailClick(index)}
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
                                    justifyContent: 'center',
                                    position: 'relative',
                                    flexShrink: 0
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

                                {/* Overlay for last thumbnail if there are more images */}
                                {showOverlay && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: 'rgba(0, 0, 0, 0.7)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: 14,
                                        fontWeight: 600,
                                        transition: 'background 0.2s'
                                    }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.85)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
                                        }}
                                    >
                                        Xem thêm<br />{remainingCount} ảnh
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal to view all images */}
            <Modal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width="90vw"
                style={{ top: 20 }}
                centered
                title={productName}
            >
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 20
                }}>
                    {/* Main modal image */}
                    <div style={{
                        width: '100%',
                        height: '500px', // Fixed height to prevent jumping
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#f8f9fa',
                        borderRadius: 12,
                        padding: 20,
                        border: '1px solid #e5e7eb'
                    }}>
                        <img
                            src={getImageUrl(images[modalImageIndex], '/default-product.svg')}
                            alt={`${productName} ${modalImageIndex + 1}`}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain' // Keep aspect ratio within fixed container
                            }}
                            onError={(e) => handleImageError(e, '/default-product.svg')}
                        />
                    </div>

                    {/* Image counter */}
                    <div style={{
                        fontSize: 14,
                        color: '#6b7280',
                        fontWeight: 500
                    }}>
                        {modalImageIndex + 1} / {images.length}
                    </div>

                    {/* All thumbnails in modal */}
                    <div style={{
                        display: 'flex',
                        gap: 10,
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        maxWidth: '100%',
                        overflowX: 'auto',
                        padding: '10px 0'
                    }}>
                        {images.map((img, index) => (
                            <div
                                key={index}
                                onClick={() => setModalImageIndex(index)}
                                style={{
                                    width: 80,
                                    height: 80,
                                    background: 'white',
                                    borderRadius: 6,
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    border: modalImageIndex === index ? '3px solid #3b82f6' : '1px solid #e5e7eb',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
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
                </div>
            </Modal>
        </div>
    );
}
