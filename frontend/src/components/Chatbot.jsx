import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';

export default function Chatbot({ isOpen, onClose }) {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'ai',
      text: 'Xin chào! Tôi là trợ lý AI của Smart Pharmacy. Tôi có thể giúp bạn tìm kiếm và tư vấn sản phẩm. Bạn cần hỗ trợ gì hôm nay? 😊',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);
  const [liveChatTimestamp, setLiveChatTimestamp] = useState(0);
  const [openTimestamp, setOpenTimestamp] = useState(0);

  useEffect(() => {
    const handleLiveChatState = (e) => {
      setIsLiveChatOpen(e.detail.isOpen);
      setLiveChatTimestamp(e.detail.timestamp || 0);
    };
    window.addEventListener('livechat-state-change', handleLiveChatState);
    return () => window.removeEventListener('livechat-state-change', handleLiveChatState);
  }, []);

  useEffect(() => {
    const ts = isOpen ? Date.now() : 0;
    setOpenTimestamp(ts);
    window.dispatchEvent(new CustomEvent('chatbot-state-change', {
      detail: { isOpen, timestamp: ts }
    }));
  }, [isOpen]);

  const shouldShift = isOpen && isLiveChatOpen && openTimestamp > liveChatTimestamp;

  // Handle window resize for responsive
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Focus input when chatbot opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Khởi tạo Web Speech API
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'vi-VN';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);

      recognition.onresult = (event) => {
        const result = event.results[0][0].transcript;
        if (result) {
          // Chỉ cập nhật input để người dùng kiểm tra, không tự động gửi
          setMessage(result);
        }
      };

      recognition.onerror = (event) => {
        console.error('Lỗi nhận diện giọng nói:', event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const handleStartListening = () => {
    if (!recognitionRef.current) {
      alert("Trình duyệt của bạn không hỗ trợ nhận diện giọng nói.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Không thể bắt đầu nhận diện:', error);
      }
    }
  };

  const handleVoiceSubmit = async (voiceText) => {
    if (!voiceText.trim() || isLoading) return;

    const newUserMessage = {
      sender: 'user',
      text: voiceText.trim(),
      timestamp: new Date()
    };
    setChatHistory(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const response = await api.post('/chat', { message: voiceText.trim() });
      const data = response.data;
      const aiMessage = {
        sender: 'ai',
        text: data.reply || 'Xin lỗi, tôi không thể trả lời câu hỏi này.',
        timestamp: new Date(),
        products: data.products || []
      };
      setChatHistory(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Lỗi khi gọi API:', error);
      const errorMessage = {
        sender: 'ai',
        text: 'Lỗi hệ thống khi xử lý giọng nói.',
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage('');

    // Thêm tin nhắn của người dùng vào lịch sử
    const newUserMessage = {
      sender: 'user',
      text: userMessage,
      timestamp: new Date()
    };
    setChatHistory(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Gọi API backend
      const response = await api.post('/chat', { message: userMessage });
      const data = response.data;

      const aiMessage = {
        sender: 'ai',
        text: data.reply || 'Xin lỗi, tôi không thể trả lời câu hỏi này.',
        timestamp: new Date(),
        products: data.products || []
      };

      setChatHistory(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Lỗi khi gọi API:', error);
      const errorMessage = {
        sender: 'ai',
        text: error.response?.data?.reply || 'Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau hoặc liên hệ hotline 1800 6928 để được hỗ trợ.',
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Hàm để render tin nhắn có highlight sản phẩm và giá tiền
  const renderMessage = (text) => {
    if (!text) return null;

    // 1. Tách theo cụm **...** trước
    const parts = text.split(/(\*\*.*?\*\*)/g);

    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const productName = part.slice(2, -2);
        return (
          <strong key={`prod-${i}`} style={{ color: '#764ba2', fontWeight: 700 }}>
            {productName}
          </strong>
        );
      }

      // 2. Với phần văn bản thường, tìm và highlight giá tiền
      // Regex tìm các định dạng: 100,000 VND, 100.000 VNĐ, 100,000đ, 100k...
      const priceRegex = /(\d{1,3}(?:[.,]\d{3})+(?:\s?VND|\s?VNĐ|₫|đ))/gi;
      const subParts = part.split(priceRegex);

      return subParts.map((subPart, j) => {
        if (subPart.match(priceRegex)) {
          return (
            <span key={`price-${i}-${j}`} style={{ color: '#ef4444', fontWeight: 700 }}>
              {subPart}
            </span>
          );
        }
        return subPart;
      });
    });
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 90,
      right: isMobile ? 20 : (shouldShift ? 420 : 20),
      left: isMobile ? 20 : 'auto',
      width: isMobile ? 'calc(100% - 40px)' : 380,
      maxWidth: 380,
      height: isMobile ? 'calc(100vh - 110px)' : 600,
      maxHeight: 600,
      background: 'white',
      borderRadius: 24,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1001,
      overflow: 'hidden',
      transition: 'right 0.3s cubic-bezier(0.19, 1, 0.22, 1), transform 0.3s ease',
      animation: 'chatAppear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: '16px 16px 0 0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20
          }}>
            🤖
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>AI Tư vấn</div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>Smart Pharmacy</div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            color: 'white',
            width: 32,
            height: 32,
            minWidth: 32,
            minHeight: 32,
            padding: 0,
            margin: 0,
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            lineHeight: 1,
            transition: 'all 0.2s',
            boxSizing: 'border-box',
            flexShrink: 0
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        background: '#f9fafb',
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}>
        {chatHistory.map((msg, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              gap: 4
            }}
          >
            <div style={{
              maxWidth: '85%',
              padding: '14px 18px',
              borderRadius: msg.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
              background: msg.sender === 'user'
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'white',
              color: msg.sender === 'user' ? 'white' : '#1f2937',
              fontSize: '14.5px',
              lineHeight: '1.6',
              textAlign: 'justify',
              boxShadow: msg.sender === 'user'
                ? '0 4px 12px rgba(102, 126, 234, 0.25)'
                : '0 4px 12px rgba(0, 0, 0, 0.05)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              border: msg.sender === 'user' ? 'none' : '1px solid #f1f5f9'
            }}>
              {renderMessage(msg.text)}
            </div>
            <div style={{
              fontSize: 11,
              color: '#9ca3af',
              padding: '0 4px'
            }}>
              {formatTime(msg.timestamp)}
            </div>

            {/* Hiển thị sản phẩm được đề xuất */}
            {msg.sender === 'ai' && msg.products && msg.products.length > 0 && (
              <div style={{
                width: '100%',
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}>
                <div style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#6b7280',
                  marginBottom: 4
                }}>
                  Sản phẩm đề xuất:
                </div>
                {msg.products.slice(0, 3).map((product) => (
                  <Link
                    key={product.id}
                    to={`/p/${product.slug}`}
                    onClick={onClose}
                    style={{
                      display: 'flex',
                      gap: 12,
                      padding: 12,
                      background: 'white',
                      borderRadius: 12,
                      textDecoration: 'none',
                      color: 'inherit',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl.startsWith('http')
                          ? product.imageUrl
                          : `${product.imageUrl}`}
                        alt={product.name}
                        style={{
                          width: 60,
                          height: 60,
                          objectFit: 'contain',
                          borderRadius: 8,
                          background: '#f3f4f6'
                        }}
                        onError={(e) => {
                          e.target.src = '/default-product.png';
                        }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#1f2937',
                        marginBottom: 4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {product.name}
                      </div>
                      <div style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#ef4444'
                      }}>
                        {product.price?.toLocaleString('vi-VN')}₫
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 4
          }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: '16px 16px 16px 4px',
              background: 'white',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              gap: 4
            }}>
              <span style={{ animation: 'dot1 1.4s infinite' }}>●</span>
              <span style={{ animation: 'dot2 1.4s infinite' }}>●</span>
              <span style={{ animation: 'dot3 1.4s infinite' }}>●</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} style={{
        padding: '16px',
        background: 'white',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        gap: 8
      }}>
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={isListening ? "Đang lắng nghe..." : "Nhập câu hỏi của bạn..."}
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: '1px solid #e5e7eb',
            borderRadius: 24,
            fontSize: 14,
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#667eea'}
          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
        />

        {/* Nút Voice Input */}
        <button
          type="button"
          onClick={handleStartListening}
          disabled={isLoading}
          style={{
            width: 44,
            height: 44,
            minWidth: 44,
            minHeight: 44,
            padding: 0,
            borderRadius: '50%',
            border: 'none',
            background: isListening
              ? 'rgba(239, 68, 68, 0.1)'
              : 'rgba(59, 130, 246, 0.1)',
            color: isListening ? '#ef4444' : '#3b82f6',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            animation: isListening ? 'pulse-voice 1.5s infinite' : 'none',
            position: 'relative',
            boxSizing: 'border-box'
          }}
          title="Nói để đặt câu hỏi"
        >
          {isListening && (
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '2px solid #ef4444',
              animation: 'pulse-voice 1.5s infinite'
            }} />
          )}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C10.34 2 9 3.34 9 5V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V5C15 3.34 13.66 2 12 2Z"
              fill="currentColor"
            />
            <path
              d="M12 17C9.24 17 7 14.76 7 12H5C5 15.53 7.61 18.43 11 18.92V22H13V18.92C16.39 18.43 19 15.53 19 12H17C17 14.76 14.76 17 12 17Z"
              fill="currentColor"
            />
          </svg>
        </button>

        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          style={{
            width: 44,
            height: 44,
            minWidth: 44,
            minHeight: 44,
            padding: 0,
            margin: 0,
            borderRadius: '50%',
            background: message.trim() && !isLoading
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : '#d1d5db',
            border: 'none',
            color: 'white',
            cursor: message.trim() && !isLoading ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            lineHeight: 1,
            transition: 'all 0.2s',
            boxSizing: 'border-box',
            flexShrink: 0
          }}
        >
          {isLoading ? '⏳' : '➤'}
        </button>
      </form>

      <style>{`
        @keyframes chatAppear {
            from { opacity: 0; transform: translateY(30px) scale(0.9); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes dot1 {
          0%, 20% { opacity: 0.3; }
          40%, 100% { opacity: 1; }
        }
        @keyframes dot2 {
          0%, 20%, 40% { opacity: 0.3; }
          60%, 100% { opacity: 1; }
        }
        @keyframes dot3 {
          0%, 20%, 40%, 60% { opacity: 0.3; }
          80%, 100% { opacity: 1; }
        }
        @keyframes pulse-voice {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        
        ::-webkit-scrollbar {
            width: 6px;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        ::-webkit-scrollbar-thumb {
            background: #e2e8f0;
            border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}

