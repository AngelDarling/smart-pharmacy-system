import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, Input, Button, Space, Steps, Timeline, Tag, Typography, message, Row, Col, Divider } from 'antd';
import { CarOutlined, CheckCircleOutlined, ShoppingOutlined, ClockCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import api from '../../../api/client';

const { Title, Text } = Typography;

const STATUS_VI = {
  preparing: 'Đang chuẩn bị',
  pickup: 'Đang lấy hàng',
  shipping: 'Đang giao hàng',
  delivered: 'Giao hàng thành công',
  cancelled: 'Đã hủy'
};

const STATUS_TO_STEP = {
  preparing: 0,
  pickup: 1,
  shipping: 2,
  delivered: 3,
  cancelled: 0
};

export default function Tracking() {
  const [params, setParams] = useSearchParams();
  const [codeInput, setCodeInput] = useState(params.get('code') || '');
  const [loading, setLoading] = useState(false);
  const [shipment, setShipment] = useState(null);
  const [polling, setPolling] = useState(false);

  const stepIndex = useMemo(() => STATUS_TO_STEP[shipment?.status] ?? 0, [shipment]);

  async function fetchTrack(code) {
    if (!code) return;
    try {
      setLoading(true);
      const res = await api.get(`/shipping/track/${encodeURIComponent(code)}`);
      setShipment(res.data);
      setParams({ code });
      if (res.data.status !== 'delivered') {
        setPolling(true);
        setTimeout(() => {
          setPolling(false);
          fetchTrack(code);
        }, 15000);
      } else {
        setPolling(false);
      }
    } catch (e) {
      message.error('Không tìm thấy vận đơn');
      setShipment(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const c = params.get('code');
    if (c) fetchTrack(c);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <div style={{
        background: 'linear-gradient(90deg,#ec4899 0%,#ef4444 100%)',
        color: 'white',
        borderRadius: 12,
        padding: 16,
        boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
        marginBottom: 16
      }}>
        <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
          <CarOutlined style={{ fontSize: 22 }} />
          <Title level={3} style={{ margin: 0, color: 'white' }}>Theo dõi đơn hàng</Title>
        </div>
        <div style={{ marginTop: 8, opacity: 0.9 }}>Nhập mã vận chuyển hoặc mã đơn (SHP... hoặc ORD...).</div>
      </div>

      <Card style={{ marginBottom: 16, borderRadius: 12 }} bodyStyle={{ paddingBottom: 12 }}>
        <Space.Compact style={{ width: '100%' }}>
          <Input 
            placeholder="Nhập mã vận chuyển (SHP...) hoặc mã đơn (ORD...)" 
            value={codeInput} 
            onChange={(e)=> setCodeInput(e.target.value)} 
            onPressEnter={()=> fetchTrack(codeInput.trim())} 
          />
          <Button type="primary" loading={loading} onClick={()=> fetchTrack(codeInput.trim())}>Tra cứu</Button>
          <Button icon={<ReloadOutlined />} onClick={()=> fetchTrack(codeInput.trim())} disabled={!codeInput || loading}>
            Làm mới
          </Button>
        </Space.Compact>

        {shipment && (
          <div style={{ marginTop: 16 }}>
            <Row gutter={[16,16]} align="middle">
              <Col xs={24} md={12}>
                <div style={{ display:'flex', gap: 10, alignItems:'center' }}>
                  <Text>Mã vận chuyển:</Text>
                  <Text code style={{ fontSize: 16 }}>{shipment.shippingCode}</Text>
                </div>
              </Col>
              <Col xs={24} md={12} style={{ textAlign:'right' }}>
                <Tag color={shipment.status === 'delivered' ? 'green' : shipment.status === 'shipping' ? 'geekblue' : shipment.status === 'pickup' ? 'gold' : 'default'} style={{ fontSize: 14, padding: '4px 10px' }}>
                  {STATUS_VI[shipment.status] || shipment.status}
                </Tag>
                {polling && <span style={{ marginLeft: 8, color: '#6b7280' }}>(Đang tự động cập nhật...)</span>}
              </Col>
            </Row>

            <div style={{ marginTop: 12 }}>
              <Steps current={stepIndex} responsive items={[
                { title: 'Đã xác nhận', icon: <ClockCircleOutlined /> },
                { title: 'Đang lấy hàng', icon: <ShoppingOutlined /> },
                { title: 'Đang giao', icon: <CarOutlined /> },
                { title: 'Đã giao', icon: <CheckCircleOutlined /> },
              ]} />
            </div>
          </div>
        )}
      </Card>

      {shipment && (
        <Row gutter={[16,16]}>
          <Col xs={24}>
            <Card title="Lộ trình vận chuyển" style={{ borderRadius: 12 }}>
              <Timeline>
                {[...(shipment.timeline || [])].slice().reverse().map((t, idx) => (
                  <Timeline.Item 
                    key={idx} 
                    color={t.status === 'delivered' ? 'green' : t.status === 'shipping' ? 'blue' : t.status === 'pickup' ? 'gold' : 'gray'}
                    dot={t.status === 'delivered' ? <CheckCircleOutlined style={{ color: '#16a34a' }} /> : t.status === 'shipping' ? <CarOutlined style={{ color: '#2563eb' }} /> : t.status === 'pickup' ? <ShoppingOutlined style={{ color: '#f59e0b' }} /> : <ClockCircleOutlined style={{ color: '#9ca3af' }} />}
                  >
                    <div style={{ fontWeight: 600 }}>{STATUS_VI[t.status] || t.status}</div>
                    <div style={{ color:'#6b7280' }}>{new Date(t.timestamp).toLocaleString('vi-VN')}</div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}

