import React, { useState, useEffect, useRef } from 'react';
import { Layout, Menu, List, Avatar, Input, Button, Typography, Badge, Empty, Tabs, Tag, Space, Modal, message, Tooltip } from 'antd';
import { SendOutlined, UserOutlined, CheckCircleOutlined, DeleteOutlined, HistoryOutlined, MessageOutlined } from '@ant-design/icons';
import { io } from 'socket.io-client';
import api from '../../api/client.js';
import Swal from 'sweetalert2';

const { Sider, Content } = Layout;
const { Text, Title } = Typography;

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminChat() {
    const [conversations, setConversations] = useState([]);
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [activeTab, setActiveTab] = useState('open');
    const [loading, setLoading] = useState(false);
    const [unreadCounts, setUnreadCounts] = useState({ open: 0, closed: 0 });
    const [isCleaning, setIsCleaning] = useState(false);
    const socketRef = useRef(null);
    const scrollRef = useRef(null);

    const fetchCounts = async () => {
        try {
            const [openRes, closedRes] = await Promise.all([
                api.get('/live-chat/conversations?status=open'),
                api.get('/live-chat/conversations?status=closed')
            ]);
            setUnreadCounts({
                open: openRes.data.reduce((sum, c) => sum + (c.unreadCount || 0), 0),
                closed: closedRes.data.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
            });
        } catch (error) {
            console.error('Error fetching unread counts:', error);
        }
    };

    const fetchConversations = async (status) => {
        setLoading(true);
        try {
            const res = await api.get(`/live-chat/conversations?status=${status || activeTab}`);
            setConversations(res.data);
            fetchCounts(); // Update counts whenever we fetch
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initialize socket
        socketRef.current = io(SOCKET_URL);
        socketRef.current.emit('admin_join');

        socketRef.current.on('admin_receive_message', ({ sessionId, message: msg, conversation }) => {
            // Update counts
            fetchCounts();

            // Update conversations list only if it matches current tab or if it's a new message for open chats
            if (activeTab === 'open' || conversation.status === activeTab) {
                setConversations((prev) => {
                    const index = prev.findIndex(c => c.sessionId === sessionId);
                    if (index > -1) {
                        const updated = [...prev];
                        updated[index] = conversation;
                        // Move to top
                        const item = updated.splice(index, 1)[0];
                        return [item, ...updated];
                    } else if (conversation.status === activeTab) {
                        return [conversation, ...prev];
                    }
                    return prev;
                });
            }

            // If this is the active conversation, add message
            if (sessionId === selectedSessionId) {
                setMessages((prev) => [...prev, msg]);
            }
        });

        socketRef.current.on('new_conversation', (conversation) => {
            if (activeTab === 'open') {
                setConversations((prev) => [conversation, ...prev]);
            }
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [selectedSessionId, activeTab]);

    useEffect(() => {
        fetchConversations();
    }, [activeTab]);

    useEffect(() => {
        if (selectedSessionId) {
            const fetchMessages = async () => {
                try {
                    const conversation = conversations.find(c => c.sessionId === selectedSessionId);
                    if (conversation) {
                        const res = await api.get(`/live-chat/messages/${conversation._id}`);
                        setMessages(res.data);
                    }
                } catch (error) {
                    console.error('Error fetching messages:', error);
                }
            };
            fetchMessages();
        }
    }, [selectedSessionId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!input.trim() || !selectedSessionId) return;

        const messageData = {
            sessionId: selectedSessionId,
            text: input,
            senderType: 'staff',
            senderId: 'admin'
        };

        socketRef.current.emit('send_message', messageData);
        setInput('');
    };

    const handleCloseConversation = async (id) => {
        try {
            await api.patch(`/live-chat/close/${id}`);
            message.success('Đã kết thúc cuộc trò chuyện');
            setSelectedSessionId(null);
            fetchConversations();
        } catch (error) {
            message.error('Không thể kết thúc cuộc trò chuyện');
        }
    };

    const handleCleanup = async () => {
        Swal.fire({
            title: 'Xác nhận dọn dẹp?',
            text: 'Tất cả các cuộc trò chuyện đã đóng sẽ bị xóa vĩnh viễn khỏi hệ thống.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#7c3aed',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Xóa sạch',
            cancelButtonText: 'Hủy'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    setIsCleaning(true);
                    const res = await api.post('/live-chat/cleanup');

                    Swal.fire({
                        title: 'Thành công!',
                        text: res.data.message || 'Dữ liệu đã được dọn dẹp.',
                        icon: 'success',
                        confirmButtonColor: '#7c3aed'
                    });

                    fetchCounts();
                    fetchConversations();
                } catch (error) {
                    console.error('Cleanup API call failed:', error);
                    Swal.fire({
                        title: 'Lỗi!',
                        text: 'Không thể thực hiện dọn dẹp lúc này. Vui lòng thử lại sau.',
                        icon: 'error',
                        confirmButtonColor: '#7c3aed'
                    });
                } finally {
                    setIsCleaning(false);
                }
            }
        });
    };

    const selectedConv = conversations.find(c => c.sessionId === selectedSessionId);

    return (
        <Layout style={{ height: 'calc(100vh - 120px)', background: '#f0f2f5', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <Sider width={350} theme="light" style={{ borderRight: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '24px 20px', background: 'white', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <Title level={4} style={{ margin: 0, color: '#1f2937' }}>Hỗ trợ khách hàng</Title>
                        <Tooltip title="Dọn dẹp lịch sử đã đóng">
                            <div
                                onClick={(e) => {
                                    console.log('Cleanup div wrapper clicked');
                                    handleCleanup();
                                }}
                                style={{ zIndex: 10, cursor: 'pointer' }}
                            >
                                <Button
                                    type="text"
                                    icon={<DeleteOutlined />}
                                    danger
                                    loading={isCleaning}
                                    style={{ pointerEvents: 'none' }}
                                />
                            </div>
                        </Tooltip>
                    </div>
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        size="small"
                        items={[
                            {
                                key: 'open',
                                label: (
                                    <Space>
                                        <MessageOutlined />
                                        Đang chờ
                                        {unreadCounts.open > 0 && <Badge count={unreadCounts.open} style={{ backgroundColor: '#7c3aed' }} size="small" />}
                                    </Space>
                                )
                            },
                            {
                                key: 'closed',
                                label: (
                                    <Space>
                                        <HistoryOutlined />
                                        Đã đóng
                                        {unreadCounts.closed > 0 && <Badge count={unreadCounts.closed} style={{ backgroundColor: '#6b7280' }} size="small" />}
                                    </Space>
                                )
                            }
                        ]}
                    />
                </div>
                <div style={{ flex: 1, overflowY: 'auto', background: 'white' }}>
                    <List
                        dataSource={conversations}
                        locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có cuộc trò chuyện nào" /> }}
                        renderItem={(item) => (
                            <List.Item
                                onClick={() => setSelectedSessionId(item.sessionId)}
                                style={{
                                    cursor: 'pointer',
                                    padding: '16px 20px',
                                    background: selectedSessionId === item.sessionId ? '#f5f3ff' : 'transparent',
                                    borderLeft: selectedSessionId === item.sessionId ? '4px solid #7c3aed' : '4px solid transparent',
                                    transition: 'all 0.2s',
                                    borderBottom: '1px solid #f9fafb'
                                }}
                                className="conv-item"
                                onMouseEnter={(e) => { if (selectedSessionId !== item.sessionId) e.currentTarget.style.background = '#f9fafb'; }}
                                onMouseLeave={(e) => { if (selectedSessionId !== item.sessionId) e.currentTarget.style.background = 'transparent'; }}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <Badge count={selectedSessionId === item.sessionId ? 0 : item.unreadCount} offset={[-2, 32]}>
                                            <Avatar size={48} icon={<UserOutlined />} style={{ backgroundColor: '#e5e7eb' }} />
                                        </Badge>
                                    }
                                    title={
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text strong style={{ fontSize: 15 }}>{item.customerName}</Text>
                                            <Text type="secondary" style={{ fontSize: 11 }}>
                                                {new Date(item.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                        </div>
                                    }
                                    description={
                                        <div style={{ marginTop: 4 }}>
                                            <Text type="secondary" ellipsis style={{ maxWidth: 200, display: 'block', fontSize: 13 }}>
                                                {item.lastMessage || 'Bắt đầu trò chuyện'}
                                            </Text>
                                            <Tag color={item.status === 'open' ? 'processing' : 'default'} style={{ marginTop: 8, borderRadius: 10 }}>
                                                {item.status === 'open' ? 'Đang chờ' : 'Đã giải quyết'}
                                            </Tag>
                                        </div>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                </div>
            </Sider>
            <Content style={{ display: 'flex', flexDirection: 'column', background: '#f9fafb' }}>
                {selectedSessionId ? (
                    <>
                        <div style={{ padding: '16px 24px', background: 'white', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar size="large" icon={<UserOutlined />} style={{ marginRight: 12, backgroundColor: '#7c3aed' }} />
                                <div>
                                    <Text strong style={{ fontSize: 16 }}>{selectedConv?.customerName}</Text>
                                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>ID: {selectedSessionId.substring(0, 12)}...</div>
                                </div>
                            </div>
                            {selectedConv?.status === 'open' && (
                                <Button
                                    icon={<CheckCircleOutlined />}
                                    onClick={() => handleCloseConversation(selectedConv._id)}
                                    style={{ borderRadius: 8 }}
                                >
                                    Kết thúc hỗ trợ
                                </Button>
                            )}
                        </div>
                        <div
                            ref={scrollRef}
                            style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}
                        >
                            {messages.map((msg, idx) => {
                                const isStaff = msg.senderType === 'staff';
                                return (
                                    <div
                                        key={idx}
                                        style={{
                                            alignSelf: isStaff ? 'flex-end' : 'flex-start',
                                            maxWidth: '75%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: isStaff ? 'flex-end' : 'flex-start',
                                            gap: 4
                                        }}
                                    >
                                        <div
                                            style={{
                                                padding: '12px 18px',
                                                borderRadius: isStaff ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                                background: isStaff ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                                                color: isStaff ? 'white' : '#1f2937',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                                fontSize: '14.5px',
                                                lineHeight: '1.5',
                                                border: isStaff ? 'none' : '1px solid #f1f5f9'
                                            }}
                                        >
                                            {msg.text}
                                        </div>
                                        <Text type="secondary" style={{ fontSize: 10, padding: '0 4px' }}>
                                            {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{ padding: '20px 24px', background: 'white', borderTop: '1px solid #f0f0f0' }}>
                            {selectedConv?.status === 'open' ? (
                                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 12 }}>
                                    <Input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Nhập nội dung phản hồi cho khách hàng..."
                                        size="large"
                                        style={{ borderRadius: 24, padding: '10px 20px' }}
                                        onPressEnter={handleSendMessage}
                                    />
                                    <Button
                                        type="primary"
                                        icon={<SendOutlined />}
                                        size="large"
                                        onClick={handleSendMessage}
                                        style={{
                                            borderRadius: '50%',
                                            width: 48,
                                            height: 48,
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            border: 'none',
                                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                                        }}
                                    />
                                </form>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '10px', background: '#f9fafb', borderRadius: 8, color: '#6b7280' }}>
                                    Cuộc trò chuyện này đã kết thúc. Bạn chỉ có thể xem lại lịch sử.
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f9fafb' }}>
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <span>Chọn một cuộc trò chuyện để bắt đầu hỗ trợ</span>
                            }
                        />
                    </div>
                )}
            </Content>
        </Layout>
    );
}
