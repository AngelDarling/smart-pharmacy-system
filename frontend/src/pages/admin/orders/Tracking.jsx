import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, Input, Button, Space, Steps, Timeline, Tag, Typography, message, Row, Col, Divider, Avatar, Descriptions, Empty } from 'antd';
import { CarOutlined, CheckCircleOutlined, ShoppingOutlined, ClockCircleOutlined, ReloadOutlined, EnvironmentOutlined, PhoneOutlined, UserOutlined, ShoppingCartOutlined, DollarOutlined } from '@ant-design/icons';
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

const STATUS_COLORS = {
  preparing: 'processing',
  pickup: 'warning',
  shipping: 'processing',
  delivered: 'success',
  cancelled: 'error'
};

export default function Tracking() {
  const [params, setParams] = useSearchParams();
  const [codeInput, setCodeInput] = useState(params.get('code') || '');
  const [loading, setLoading] = useState(false);
  const [shipment, setShipment] = useState(null);
  const [order, setOrder] = useState(null);
  const [polling, setPolling] = useState(false);

  const stepIndex = useMemo(() => STATUS_TO_STEP[shipment?.status] ?? 0, [shipment]);

  async function fetchTrack(code) {
    if (!code) return;
    try {
      setLoading(true);
      const res = await api.get(`/shipping/track/${encodeURIComponent(code)}`);
      setShipment(res.data);

      // Fetch order details if we have orderId
      if (res.data.orderId) {
        try {
          const orderRes = await api.get(`/orders/${res.data.orderId}`);
          setOrder(orderRes.data);
        } catch (e) {
          console.error('Failed to fetch order:', e);
        }
      }

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
      setOrder(null);
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
    <div>
      {/* Header Section */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            size="large"
            icon={<CarOutlined />}
            style={{
              backgroundColor: '#52c41a',
              marginRight: '16px'
            }}
          />
          <div>
            <h2 style={{ margin: 0, color: '#262626' }}>
              Theo dõi đơn hàng
            </h2>
            <div style={{ color: '#8c8c8c', fontSize: '14px' }}>
              Tra cứu và theo dõi trạng thái vận chuyển
            </div>
          </div>
        </div>
      </div>

      {/* Search Card */}
      <Card style={{ marginBottom: 16 }}>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            size="large"
            placeholder="Nhập mã vận chuyển (SHP...) hoặc mã đơn (ORD...)"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            onPressEnter={() => fetchTrack(codeInput.trim())}
          />
          <Button
            type="primary"
            size="large"
            loading={loading}
            onClick={() => fetchTrack(codeInput.trim())}
          >
            Tra cứu
          </Button>
          <Button
            size="large"
            icon={<ReloadOutlined />}
            onClick={() => fetchTrack(codeInput.trim())}
            disabled={!codeInput || loading}
          >
            Làm mới
          </Button>
        </Space.Compact>
      </Card>

      {shipment ? (
        <>
          {/* Status Overview */}
          <Card style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={12}>
                <Space direction="vertical" size={4}>
                  <Text type="secondary">Mã vận chuyển</Text>
                  <Text code style={{ fontSize: 18, fontWeight: 600 }}>{shipment.shippingCode}</Text>
                </Space>
              </Col>
              <Col xs={24} md={12} style={{ textAlign: 'right' }}>
                <Tag
                  color={STATUS_COLORS[shipment.status]}
                  style={{ fontSize: 16, padding: '6px 16px', fontWeight: 600 }}
                >
                  {STATUS_VI[shipment.status] || shipment.status}
                </Tag>
                {polling && <div style={{ marginTop: 8, color: '#8c8c8c', fontSize: 12 }}>Đang tự động cập nhật...</div>}
              </Col>
            </Row>

            <Divider />

            <Steps
              current={stepIndex}
              status={shipment.status === 'cancelled' ? 'error' : undefined}
              items={[
                { title: 'Đã xác nhận', icon: <ClockCircleOutlined /> },
                { title: 'Đang lấy hàng', icon: <ShoppingOutlined /> },
                { title: 'Đang giao', icon: <CarOutlined /> },
                { title: 'Đã giao', icon: <CheckCircleOutlined /> },
              ]}
            />
          </Card>

          <Row gutter={[16, 16]}>
            {/* Order Details */}
            {order && (
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <ShoppingCartOutlined />
                      <span>Thông tin đơn hàng</span>
                    </Space>
                  }
                  style={{ height: '100%' }}
                >
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Mã đơn hàng">
                      <Text code>{order.code}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Người nhận">
                      <Space>
                        <UserOutlined />
                        <Text strong>{order.shippingAddress?.fullName || 'N/A'}</Text>
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">
                      <Space>
                        <PhoneOutlined />
                        <Text>{order.shippingAddress?.phone || 'N/A'}</Text>
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ giao hàng">
                      <Space align="start">
                        <EnvironmentOutlined style={{ marginTop: 4 }} />
                        <Text>{order.shippingAddress?.address || 'N/A'}</Text>
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tổng tiền">
                      <Space>
                        <DollarOutlined />
                        <Text strong style={{ color: '#52c41a', fontSize: 16 }}>
                          {(order.totals?.grand || 0).toLocaleString('vi-VN')}₫
                        </Text>
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Phương thức thanh toán">
                      <Tag color="blue">{(order.paymentMethod || 'cod').toUpperCase()}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái đơn hàng">
                      <Tag color={order.status === 'completed' ? 'green' : order.status === 'cancelled' ? 'red' : 'blue'}>
                        {order.status === 'completed' ? 'Hoàn tất' :
                          order.status === 'cancelled' ? 'Đã hủy' :
                            order.status === 'shipping' ? 'Đang giao' :
                              order.status === 'processing' ? 'Đang xử lý' : 'Chờ xử lý'}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            )}

            {/* Timeline */}
            <Col xs={24} lg={order ? 12 : 24}>
              <Card
                title="Lộ trình vận chuyển"
                style={{ height: '100%' }}
              >
                {shipment.timeline && shipment.timeline.length > 0 ? (
                  <Timeline>
                    {[...(shipment.timeline || [])].slice().reverse().map((t, idx) => (
                      <Timeline.Item
                        key={idx}
                        color={
                          t.status === 'delivered' ? 'green' :
                            t.status === 'shipping' ? 'blue' :
                              t.status === 'pickup' ? 'gold' : 'gray'
                        }
                        dot={
                          t.status === 'delivered' ? <CheckCircleOutlined style={{ fontSize: 16, color: '#52c41a' }} /> :
                            t.status === 'shipping' ? <CarOutlined style={{ fontSize: 16, color: '#1890ff' }} /> :
                              t.status === 'pickup' ? <ShoppingOutlined style={{ fontSize: 16, color: '#faad14' }} /> :
                                <ClockCircleOutlined style={{ fontSize: 16, color: '#8c8c8c' }} />
                        }
                      >
                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                          {STATUS_VI[t.status] || t.status}
                        </div>
                        <div style={{ color: '#8c8c8c', fontSize: 13 }}>
                          {new Date(t.timestamp).toLocaleString('vi-VN')}
                        </div>
                        {t.location && (
                          <div style={{ color: '#595959', fontSize: 12, marginTop: 4 }}>
                            <EnvironmentOutlined /> {t.location}
                          </div>
                        )}
                      </Timeline.Item>
                    ))}
                  </Timeline>
                ) : (
                  <Empty description="Chưa có thông tin lộ trình" />
                )}
              </Card>
            </Col>
          </Row>
        </>
      ) : !loading && codeInput ? (
        <Card>
          <Empty
            description="Không tìm thấy thông tin vận chuyển. Vui lòng kiểm tra lại mã vận chuyển hoặc mã đơn hàng."
          />
        </Card>
      ) : null}
    </div>
  );
}
