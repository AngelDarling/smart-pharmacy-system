import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';

export default function VoiceSearchModal({ isOpen, onClose, onSearch }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  // Initialize Web Speech API
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'vi-VN';
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event) => {
        const result = event.results[0][0].transcript;
        setTranscript(result);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'aborted') {
          return;
        }
        
        if (event.error === 'no-speech') {
          Swal.fire({
            title: 'Không nghe thấy giọng nói',
            text: 'Vui lòng thử lại và nói rõ hơn',
            icon: 'warning',
            timer: 3000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
          });
        } else if (event.error === 'not-allowed') {
          Swal.fire({
            title: 'Không có quyền truy cập micro',
            text: 'Vui lòng cho phép truy cập micro trong cài đặt trình duyệt',
            icon: 'error',
            timer: 4000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
          });
        }
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, []);

  const handleStartListening = () => {
    if (!recognitionRef.current) {
      Swal.fire({
        title: 'Không hỗ trợ',
        text: 'Trình duyệt của bạn không hỗ trợ tìm kiếm bằng giọng nói. Vui lòng sử dụng Chrome hoặc Edge.',
        icon: 'error',
        timer: 4000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
      }
    }
  };

  const handleSearch = () => {
    if (transcript.trim()) {
      onSearch(transcript);
      onClose();
      setTranscript('');
    }
  };

  const handleClose = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setTranscript('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
        @keyframes ripple {
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4),
                        0 0 0 0 rgba(59, 130, 246, 0.4),
                        0 0 0 0 rgba(59, 130, 246, 0.4);
          }
          100% {
            box-shadow: 0 0 0 15px rgba(59, 130, 246, 0),
                        0 0 0 30px rgba(59, 130, 246, 0),
                        0 0 0 45px rgba(59, 130, 246, 0);
          }
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
            maxWidth: 500,
            width: '100%',
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
              Tìm kiếm với giọng nói
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
          <div style={{ padding: 32 }}>
            {/* Tips */}
            <div style={{
              background: '#fef3c7',
              padding: 16,
              borderRadius: 8,
              marginBottom: 24,
              display: 'flex',
              gap: 12
            }}>
              <div style={{ fontSize: 24, flexShrink: 0 }}>💡</div>
              <div>
                <div style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#92400e',
                  marginBottom: 8
                }}>
                  Mẹo để tìm kiếm sản phẩm chính xác nhất
                </div>
                <ul style={{
                  margin: 0,
                  paddingLeft: 20,
                  fontSize: 13,
                  color: '#78350f',
                  lineHeight: 1.6
                }}>
                  <li>Nói to, rõ ràng, không tạp âm.</li>
                  <li>Đọc đúng tên sản phẩm hoặc thành phần, tránh từ ngữ mơ hồ.</li>
                </ul>
              </div>
            </div>

            {/* Example */}
            <div style={{
              marginBottom: 24,
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: 14,
                color: '#6b7280',
                marginBottom: 8
              }}>
                Ví dụ: "Vitamin C"
              </div>
            </div>

            {/* Microphone Button */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: 24
            }}>
              <button
                onClick={handleStartListening}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  border: 'none',
                  background: isListening 
                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                    : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s',
                  boxShadow: isListening 
                    ? '0 8px 25px rgba(239, 68, 68, 0.4)'
                    : '0 8px 25px rgba(59, 130, 246, 0.4)',
                  animation: isListening ? 'ripple 1.5s infinite' : 'none',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!isListening) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 12px 35px rgba(59, 130, 246, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = isListening 
                    ? '0 8px 25px rgba(239, 68, 68, 0.4)'
                    : '0 8px 25px rgba(59, 130, 246, 0.4)';
                }}
              >
                <svg 
                  width="48" 
                  height="48" 
                  viewBox="0 0 24 24" 
                  fill="none"
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                  }}
                >
                  {/* Microphone body */}
                  <path 
                    d="M12 2C10.34 2 9 3.34 9 5V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V5C15 3.34 13.66 2 12 2Z" 
                    fill="white"
                    opacity="0.95"
                  />
                  {/* Microphone stand */}
                  <path 
                    d="M12 17C9.24 17 7 14.76 7 12H5C5 15.53 7.61 18.43 11 18.92V22H13V18.92C16.39 18.43 19 15.53 19 12H17C17 14.76 14.76 17 12 17Z" 
                    fill="white"
                    opacity="0.9"
                  />
                  {/* Microphone grille detail */}
                  <circle cx="12" cy="8" r="1.5" fill="rgba(59, 130, 246, 0.3)" />
                  <circle cx="12" cy="11" r="1.5" fill="rgba(59, 130, 246, 0.3)" />
                </svg>
              </button>
              <div style={{
                marginTop: 16,
                fontSize: 16,
                fontWeight: 600,
                color: isListening ? '#ef4444' : '#6b7280'
              }}>
                {isListening ? 'Đang ghi âm...' : 'Nhấn để bắt đầu ghi âm'}
              </div>
            </div>

            {/* Transcript Display */}
            {transcript && (
              <div style={{
                marginBottom: 24,
                padding: 16,
                background: '#f0f9ff',
                borderRadius: 8,
                border: '2px solid #3b82f6'
              }}>
                <div style={{
                  fontSize: 13,
                  color: '#1e40af',
                  marginBottom: 4,
                  fontWeight: 600
                }}>
                  Nội dung đã ghi:
                </div>
                <div style={{
                  fontSize: 18,
                  color: '#1f2937',
                  fontWeight: 600
                }}>
                  "{transcript}"
                </div>
              </div>
            )}

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={!transcript.trim()}
              style={{
                width: '100%',
                padding: '14px 20px',
                background: transcript.trim() 
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : '#e5e7eb',
                color: transcript.trim() ? 'white' : '#9ca3af',
                border: 'none',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                cursor: transcript.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                boxShadow: transcript.trim() ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (transcript.trim()) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = transcript.trim() ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none';
              }}
            >
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

