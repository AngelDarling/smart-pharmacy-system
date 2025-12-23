import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import api from '../api/client';
import Swal from 'sweetalert2';

const ShipperSimulator = () => {
    const [searchParams] = useSearchParams();
    const [code, setCode] = useState(searchParams.get('code') || '');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleConfirm = async (e) => {
        e.preventDefault();
        if (!code.trim()) {
            Swal.fire('Lỗi', 'Vui lòng nhập mã đơn hàng hoặc mã vận chuyển', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await api.put(`/shipping/confirm/${code.trim()}`);
            setResult(response.data);
            Swal.fire({
                title: 'Thành công!',
                text: 'Đơn hàng đã được xác nhận giao hàng và hoàn tất.',
                icon: 'success',
                confirmButtonColor: '#10b981',
                background: '#ffffff',
                customClass: {
                    popup: 'animated fadeInDown'
                }
            });
        } catch (error) {
            console.error('Confirm error:', error);
            Swal.fire({
                title: 'Thất bại',
                text: error.response?.data?.message || 'Không thể cập nhật đơn hàng. Vui lòng kiểm tra lại mã.',
                icon: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            fontFamily: "'Inter', sans-serif"
        }}>
            <div style={{
                maxWidth: 550,
                width: '100%',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 24,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                padding: '48px 40px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative Elements */}
                <div style={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '50%'
                }} />

                <div style={{
                    fontSize: 80,
                    marginBottom: 24,
                    filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.1))',
                    animation: 'float 3s ease-in-out infinite'
                }}>
                    🚚
                </div>

                <h1 style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: '#111827',
                    marginBottom: 12,
                    letterSpacing: '-0.025em'
                }}>
                    Hệ Thống Xác Nhận Vận Chuyển
                </h1>

                <p style={{
                    color: '#4b5563',
                    marginBottom: 32,
                    fontSize: 16,
                    lineHeight: '1.6'
                }}>
                    Công cụ mô phỏng dành cho <span style={{ fontWeight: 600, color: '#059669' }}>Hội đồng chấm Luận văn</span>.
                    Nhập mã vận chuyển để cập nhật trạng thái đơn hàng ngay lập tức.
                </p>

                <form onSubmit={handleConfirm}>
                    <div style={{ marginBottom: 28, textAlign: 'left' }}>
                        <label style={{
                            display: 'block',
                            fontSize: 14,
                            fontWeight: 700,
                            color: '#374151',
                            marginBottom: 10,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            Mã Vận Đơn / Đơn Hàng
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                placeholder="Ví dụ: SHP332012463"
                                style={{
                                    width: '100%',
                                    padding: '16px 20px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: 12,
                                    fontSize: 18,
                                    fontWeight: 600,
                                    color: '#111827',
                                    outline: 'none',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxSizing: 'border-box',
                                    backgroundColor: '#f9fafb'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#10b981';
                                    e.target.style.backgroundColor = '#ffffff';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e5e7eb';
                                    e.target.style.backgroundColor = '#f9fafb';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '18px',
                            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 12,
                            fontSize: 18,
                            fontWeight: 700,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.4)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            letterSpacing: '0.01em'
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.target.style.transform = 'translateY(-2px) scale(1.01)';
                                e.target.style.boxShadow = '0 20px 25px -5px rgba(16, 185, 129, 0.5)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0) scale(1)';
                            e.target.style.boxShadow = '0 10px 15px -3px rgba(16, 185, 129, 0.4)';
                        }}
                    >
                        {loading ? 'Đang xác thực...' : 'XÁC NHẬN GIAO THÀNH CÔNG'}
                    </button>
                </form>

                {result && (
                    <div style={{
                        marginTop: 32,
                        padding: 24,
                        background: '#f0fdf4',
                        borderRadius: 16,
                        border: '2px solid #bbf7d0',
                        textAlign: 'left',
                        animation: 'fadeIn 0.5s ease-out'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            marginBottom: 16
                        }}>
                            <div style={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                background: '#22c55e',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 20
                            }}>✓</div>
                            <div style={{ fontSize: 16, color: '#166534', fontWeight: 800 }}>
                                Cập nhật hành trình thành công!
                            </div>
                        </div>
                        <div style={{
                            fontSize: 14,
                            color: '#15803d',
                            lineHeight: '2',
                            background: 'white',
                            padding: 16,
                            borderRadius: 8
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Mã vận đơn:</span>
                                <strong style={{ color: '#111827' }}>{result.shipment?.shippingCode}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Trạng thái mới:</span>
                                <strong style={{ color: '#059669', textTransform: 'uppercase' }}>Hoàn thành</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Thời gian:</span>
                                <strong style={{ color: '#111827' }}>{new Date().toLocaleTimeString('vi-VN')}</strong>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{
                    marginTop: 40,
                    borderTop: '1px solid #e5e7eb',
                    paddingTop: 24,
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 24
                }}>
                    <a href="/" style={{
                        color: '#6b7280',
                        textDecoration: 'none',
                        fontSize: 14,
                        fontWeight: 600,
                        transition: 'color 0.2s'
                    }}
                        onMouseEnter={(e) => e.target.style.color = '#3b82f6'}
                        onMouseLeave={(e) => e.target.style.color = '#6b7280'}
                    >
                        ← Trang chủ
                    </a>
                    <span style={{ color: '#e5e7eb' }}>|</span>
                    <a href="/admin/orders/shipping" style={{
                        color: '#6b7280',
                        textDecoration: 'none',
                        fontSize: 14,
                        fontWeight: 600,
                        transition: 'color 0.2s'
                    }}
                        onMouseEnter={(e) => e.target.style.color = '#3b82f6'}
                        onMouseLeave={(e) => e.target.style.color = '#6b7280'}
                    >
                        Quản lý đơn hàng
                    </a>
                </div>
            </div>

            <style>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default ShipperSimulator;
