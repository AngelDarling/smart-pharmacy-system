import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../api/client.js';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function LiveChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [sessionId, setSessionId] = useState('');
    const [hasSentFirstMessage, setHasSentFirstMessage] = useState(false);
    const scrollRef = useRef(null);
    const socketRef = useRef(null);
    const [isAIOpen, setIsAIOpen] = useState(false);
    const [aiTimestamp, setAiTimestamp] = useState(0);
    const [openTimestamp, setOpenTimestamp] = useState(0);

    useEffect(() => {
        const handleAIState = (e) => {
            setIsAIOpen(e.detail.isOpen);
            setAiTimestamp(e.detail.timestamp || 0);
        };
        window.addEventListener('chatbot-state-change', handleAIState);
        return () => window.removeEventListener('chatbot-state-change', handleAIState);
    }, []);

    useEffect(() => {
        const ts = isOpen ? Date.now() : 0;
        setOpenTimestamp(ts);
        window.dispatchEvent(new CustomEvent('livechat-state-change', {
            detail: { isOpen, timestamp: ts }
        }));
    }, [isOpen]);

    // Calculate position: Shift left (420px) only if both are open AND this one opened later
    const shouldShift = isOpen && isAIOpen && openTimestamp > aiTimestamp;

    useEffect(() => {
        // Get or create session ID
        let sid = localStorage.getItem('chat_session_id');
        if (!sid) {
            sid = 'sess_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('chat_session_id', sid);
        }
        setSessionId(sid);

        // Initialize socket
        socketRef.current = io(SOCKET_URL);

        socketRef.current.emit('join', { sessionId: sid });

        socketRef.current.on('receive_message', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        // Fetch history
        const fetchHistory = async () => {
            try {
                const res = await api.get(`/live-chat/history/${sid}`);
                if (res.data.length > 0) {
                    setMessages(res.data);
                    setHasSentFirstMessage(true);
                } else {
                    // Initial greeting
                    setMessages([{
                        senderType: 'staff',
                        text: 'Bạn cần giúp đỡ gì?',
                        createdAt: new Date()
                    }]);
                }
            } catch (error) {
                console.error('Error fetching chat history:', error);
            }
        };
        fetchHistory();

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const messageData = {
            sessionId,
            text: input,
            senderType: 'customer',
            senderId: sessionId
        };

        socketRef.current.emit('send_message', messageData);
        setInput('');

        // Auto reply for the first real user message in this session (if not already sent)
        if (!hasSentFirstMessage) {
            setHasSentFirstMessage(true);
            setTimeout(() => {
                const autoReply = {
                    senderType: 'staff',
                    text: 'Xin bạn chờ đợi giây lát, nhân viên của chúng tôi sẽ phản hồi ngay!',
                    createdAt: new Date()
                };
                setMessages(prev => [...prev, autoReply]);
            }, 1000);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <div style={{
                position: 'fixed',
                bottom: 20,
                right: 110, // Offset from the AI chatbot button
                zIndex: 1000
            }}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    style={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: isOpen
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            : 'white',
                        border: isOpen ? 'none' : '2px solid #764ba2',
                        color: isOpen ? 'white' : '#764ba2',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(118, 75, 162, 0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        transform: isOpen ? 'scale(1.1)' : 'scale(1)',
                        padding: 0
                    }}
                    onMouseEnter={(e) => {
                        if (!isOpen) {
                            e.currentTarget.style.transform = 'scale(1.1)';
                            e.currentTarget.style.background = 'rgba(118, 75, 162, 0.2)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isOpen) {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.background = 'rgba(118, 75, 162, 0.1)';
                        }
                    }}
                >
                    <div style={{ fontSize: 22 }}>💬</div>
                    <div style={{ fontSize: 8, fontWeight: 700 }}>TƯ VẤN</div>
                </button>
            </div>

            {/* Chat Window */}
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    bottom: 90,
                    right: shouldShift ? 420 : 20,
                    width: 380,
                    height: 600,
                    maxHeight: 'calc(100vh - 120px)',
                    background: 'white',
                    borderRadius: 24,
                    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 2000,
                    overflow: 'hidden',
                    transition: 'right 0.3s cubic-bezier(0.19, 1, 0.22, 1)',
                    animation: 'chatAppear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '18px 20px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
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
                                fontSize: 20,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}>
                                👨‍⚕️
                            </div>
                            <div>
                                <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}>Dược sĩ tư vấn</div>
                                <div style={{ fontSize: 11, opacity: 0.9 }}>Hỗ trợ trực tuyến</div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: 'none',
                                color: 'white',
                                width: 32,
                                height: 32,
                                minWidth: 32,
                                minHeight: 32,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontSize: 18,
                                padding: 0
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                        >
                            ×
                        </button>
                    </div>

                    {/* Messages */}
                    <div
                        ref={scrollRef}
                        style={{
                            flex: 1,
                            padding: '20px',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            background: '#f9fafb'
                        }}
                    >
                        {messages.map((msg, idx) => {
                            const isCustomer = msg.senderType === 'customer';
                            const time = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';

                            return (
                                <div
                                    key={idx}
                                    style={{
                                        alignSelf: isCustomer ? 'flex-end' : 'flex-start',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: isCustomer ? 'flex-end' : 'flex-start',
                                        maxWidth: '85%',
                                        gap: 4
                                    }}
                                >
                                    <div
                                        style={{
                                            padding: '12px 16px',
                                            borderRadius: isCustomer ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                            background: isCustomer
                                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                                : 'white',
                                            color: isCustomer ? 'white' : '#1f2937',
                                            boxShadow: isCustomer
                                                ? '0 4px 12px rgba(102, 126, 234, 0.2)'
                                                : '0 2px 8px rgba(0, 0, 0, 0.05)',
                                            fontSize: '14.5px',
                                            lineHeight: '1.5',
                                            border: isCustomer ? 'none' : '1px solid #f1f5f9'
                                        }}
                                    >
                                        {msg.text}
                                    </div>
                                    {time && (
                                        <span style={{ fontSize: 10, color: '#9ca3af', margin: '0 4px' }}>
                                            {time}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Input */}
                    <form
                        onSubmit={handleSendMessage}
                        style={{
                            padding: '16px',
                            background: 'white',
                            borderTop: '1px solid #f3f4f6',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'center'
                        }}
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Nhập nội dung phản hồi..."
                            style={{
                                flex: 1,
                                border: '1px solid #e5e7eb',
                                borderRadius: '24px',
                                padding: '12px 18px',
                                outline: 'none',
                                fontSize: '14px',
                                transition: 'all 0.2s',
                                background: '#f9fafb'
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = '#667eea';
                                e.currentTarget.style.background = 'white';
                                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = '#e5e7eb';
                                e.currentTarget.style.background = '#f9fafb';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim()}
                            style={{
                                background: input.trim() ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e5e7eb',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: 44,
                                height: 44,
                                minWidth: 44,
                                minHeight: 44,
                                flexShrink: 0,
                                cursor: input.trim() ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s ease',
                                boxShadow: input.trim() ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none',
                                transform: input.trim() ? 'scale(1)' : 'scale(0.95)',
                                padding: 0
                            }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </form>

                    <style>{`
                        @keyframes chatAppear {
                            from { opacity: 0; transform: translateY(30px) scale(0.9); }
                            to { opacity: 1; transform: translateY(0) scale(1); }
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
            )}
        </>
    );
}
