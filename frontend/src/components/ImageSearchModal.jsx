import { useState } from 'react';
import Swal from 'sweetalert2';
import api from '../api/client.js';

export default function ImageSearchModal({ isOpen, onClose, onSearch }) {
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    if (fileArray.length === 0) {
      Swal.fire({
        title: 'Lỗi',
        text: 'Vui lòng chọn file hình ảnh hợp lệ',
        icon: 'error',
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
      return;
    }

    // Limit to 5 images
    const limitedFiles = fileArray.slice(0, 5);
    setSelectedImages(limitedFiles);

    // Create preview URLs
    const urls = limitedFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    
    // Revoke old URL to prevent memory leak
    URL.revokeObjectURL(previewUrls[index]);
    
    setSelectedImages(newImages);
    setPreviewUrls(newUrls);
  };

  const handleSearch = async () => {
    if (selectedImages.length === 0) {
      return;
    }

    try {
      setIsSearching(true);

      // Use the first image for search
      const formData = new FormData();
      formData.append('image', selectedImages[0]);

      // Call image search API
      const response = await api.post('/search/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const { success, detectedText, products, message, fallbackMode, suggestion, note } = response.data;

      if (!success) {
        throw new Error(message || 'Tìm kiếm thất bại');
      }

      // Check if in fallback mode (Vision API not available)
      if (fallbackMode && suggestion) {
        const result = await Swal.fire({
          title: '⚠️ Vision API chưa kích hoạt',
          html: `
            <div style="text-align: left; padding: 10px;">
              <p style="margin-bottom: 12px; color: #6b7280; font-size: 14px;">
                ${message}
              </p>
              <div style="background: #fef3c7; padding: 14px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #f59e0b;">
                <p style="margin: 0 0 8px; color: #92400e; font-weight: 600; font-size: 14px;">
                  💡 Gợi ý tìm kiếm:
                </p>
                <p style="margin: 0; color: #78350f; font-size: 16px; font-weight: 700;">
                  "${suggestion}"
                </p>
              </div>
              <div style="background: #dbeafe; padding: 12px; border-radius: 8px; font-size: 13px; color: #1e40af;">
                <strong>Lưu ý:</strong> ${note}
                <br/><br/>
                Hoặc bạn có thể tìm kiếm bằng văn bản thông thường.
              </div>
            </div>
          `,
          icon: 'info',
          showCancelButton: true,
          confirmButtonText: `Tìm "${suggestion}"`,
          cancelButtonText: 'Thử ảnh khác',
          confirmButtonColor: '#3b82f6',
          cancelButtonColor: '#6b7280'
        });

        if (result.isConfirmed && suggestion) {
          onSearch(suggestion);
          handleClose();
        }
        return;
      }

      // Show detected text (normal mode with Vision API)
      if (detectedText && detectedText.trim()) {
        await Swal.fire({
          title: '✅ Phát hiện văn bản',
          html: `
            <div style="text-align: left; padding: 10px;">
              <p style="margin-bottom: 10px; color: #6b7280;">Văn bản đọc được từ ảnh:</p>
              <div style="background: #f3f4f6; padding: 12px; border-radius: 8px; font-family: monospace; white-space: pre-wrap; max-height: 150px; overflow-y: auto;">
                ${detectedText}
              </div>
              <p style="margin-top: 12px; color: #059669; font-weight: 600;">
                Tìm thấy ${products?.length || 0} sản phẩm liên quan
              </p>
            </div>
          `,
          icon: 'success',
          confirmButtonText: 'Xem kết quả',
          confirmButtonColor: '#3b82f6'
        });

        // Navigate to search results with the detected text
        if (detectedText.trim()) {
          onSearch(detectedText);
          handleClose();
        }
      } else {
        // No text detected
        Swal.fire({
          title: 'Không tìm thấy văn bản',
          text: message || 'Không thể đọc được text từ ảnh. Vui lòng chụp ảnh rõ hơn hoặc thử ảnh khác.',
          icon: 'warning',
          confirmButtonText: 'Thử lại',
          confirmButtonColor: '#3b82f6'
        });
      }

    } catch (error) {
      console.error('Image search error:', error);
      Swal.fire({
        title: 'Lỗi',
        text: error.response?.data?.message || error.message || 'Không thể tìm kiếm với hình ảnh này',
        icon: 'error',
        confirmButtonText: 'Đóng',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleClose = () => {
    // Clean up URLs
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setSelectedImages([]);
    setPreviewUrls([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}
      >
        {/* Modal */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'white',
            borderRadius: 16,
            maxWidth: 480,
            width: '100%',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: 0,
            position: 'relative',
            boxShadow: '0 20px 25px rgba(0,0,0,0.15)'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h2 style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 600,
              color: '#1f2937'
            }}>
              Tìm kiếm với hình ảnh
            </h2>
            <button
              onClick={handleClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 28,
                color: '#9ca3af',
                cursor: 'pointer',
                padding: 0,
                lineHeight: 1,
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: 24 }}>
            {/* Tips - Compact */}
            <div style={{
              background: '#fef3c7',
              padding: 12,
              borderRadius: 8,
              marginBottom: 20,
              display: 'flex',
              gap: 10
            }}>
              <div style={{ fontSize: 20, flexShrink: 0 }}>💡</div>
              <div>
                <div style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#92400e',
                  marginBottom: 6
                }}>
                  Mẹo để tìm kiếm hình ảnh chính xác nhất
                </div>
                <ul style={{
                  margin: 0,
                  paddingLeft: 16,
                  fontSize: 12,
                  color: '#78350f',
                  lineHeight: 1.5
                }}>
                  <li>Hình ảnh phải là sản phẩm hoặc đơn thuốc</li>
                  <li>Ảnh chụp hoặc ảnh tải lên phải rõ nét và rõ tên sản phẩm</li>
                  <li>Sử dụng góc chụp phù hợp, không bị mờ, chói lóa</li>
                </ul>
              </div>
            </div>

            {/* Upload Area - Compact */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${isDragging ? '#3b82f6' : '#d1d5db'}`,
                borderRadius: 10,
                padding: 24,
                textAlign: 'center',
                background: isDragging ? '#eff6ff' : '#f9fafb',
                transition: 'all 0.2s',
                marginBottom: 20,
                cursor: 'pointer'
              }}
              onClick={() => document.getElementById('image-upload-input').click()}
            >
              <input
                id="image-upload-input"
                type="file"
                accept="image/*"
                multiple
                onChange={handleInputChange}
                style={{ display: 'none' }}
              />
              
              <div style={{
                width: 60,
                height: 60,
                margin: '0 auto 12px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M4 16L8.586 11.414C9.367 10.633 10.633 10.633 11.414 11.414L16 16M14 14L15.586 12.414C16.367 11.633 17.633 11.633 18.414 12.414L20 14M14 8H14.01M6 20H18C19.105 20 20 19.105 20 18V6C20 4.895 19.105 4 18 4H6C4.895 4 4 4.895 4 6V18C4 19.105 4.895 20 6 20Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <div style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#1f2937',
                marginBottom: 6
              }}>
                Kéo thả hình ảnh vào đây hoặc{' '}
                <span style={{ color: '#3b82f6' }}>tải ảnh lên</span>
              </div>
              
              <div style={{
                fontSize: 12,
                color: '#6b7280'
              }}>
                (Tối đa 5 hình ảnh)
              </div>
            </div>

            {/* Preview Images - Compact */}
            {previewUrls.length > 0 && (
              <div style={{
                marginBottom: 20,
                padding: 12,
                background: '#f0f9ff',
                borderRadius: 8,
                border: '2px solid #3b82f6'
              }}>
                <div style={{
                  fontSize: 12,
                  color: '#1e40af',
                  marginBottom: 10,
                  fontWeight: 600
                }}>
                  Hình ảnh đã chọn ({previewUrls.length}):
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                  gap: 10
                }}>
                  {previewUrls.map((url, index) => (
                    <div
                      key={index}
                      style={{
                        position: 'relative',
                        aspectRatio: '1',
                        borderRadius: 6,
                        overflow: 'hidden',
                        border: '2px solid #e5e7eb'
                      }}
                    >
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(index);
                        }}
                        style={{
                          position: 'absolute',
                          top: 3,
                          right: 3,
                          background: 'rgba(239, 68, 68, 0.9)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: 20,
                          height: 20,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontSize: 14,
                          fontWeight: 'bold',
                          lineHeight: 1
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={selectedImages.length === 0 || isSearching}
              style={{
                width: '100%',
                padding: '14px 20px',
                background: (selectedImages.length > 0 && !isSearching)
                  ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                  : '#e5e7eb',
                color: (selectedImages.length > 0 && !isSearching) ? 'white' : '#9ca3af',
                border: 'none',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                cursor: (selectedImages.length > 0 && !isSearching) ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                boxShadow: (selectedImages.length > 0 && !isSearching) ? '0 2px 8px rgba(59, 130, 246, 0.3)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
              onMouseEnter={(e) => {
                if (selectedImages.length > 0 && !isSearching) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = (selectedImages.length > 0 && !isSearching) ? '0 2px 8px rgba(59, 130, 246, 0.3)' : 'none';
              }}
            >
              {isSearching && (
                <svg 
                  style={{ animation: 'spin 1s linear infinite' }} 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none"
                >
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                </svg>
              )}
              {isSearching ? 'Đang xử lý...' : 'Tìm kiếm'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

