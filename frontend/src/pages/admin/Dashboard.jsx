import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { usePermissions } from "../../hooks/usePermissions.js";
import { showSuccess } from "../../api/alert.js";
import api from "../../api/client.js";
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Space,
  Tag,
  Progress,
  Tooltip,
  Divider
} from 'antd';
import {
  UserOutlined,
  ShoppingOutlined,
  FolderOutlined,
  DatabaseOutlined,
  TeamOutlined,
  DollarOutlined,
  WarningOutlined,
  TrophyOutlined,
  MedicineBoxOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CarOutlined,
  RiseOutlined,
  FallOutlined,
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export default function AdminDashboard() {
  const { user } = useAuth();
  const { permissions } = usePermissions();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [orderStats, setOrderStats] = useState(null);

  useEffect(() => {
    const flag = localStorage.getItem("flash");
    if (flag === "login_success") {
      showSuccess("Đăng nhập thành công", "Xin chào!");
      localStorage.removeItem("flash");
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadStats = async () => {
      try {
        setLoading(true);

        if (permissions.canReadProducts() || permissions.canReadInventory()) {
          const statsRes = await api.get("/admin/stats");
          if (mounted) setStats(statsRes.data);
        }

        if (permissions.canReadUsers()) {
          const userRes = await api.get("/users/stats");
          if (mounted) setUserStats(userRes.data);
        }

        if (permissions.canReadOrders()) {
          try {
            const orderRes = await api.get("/orders/stats");
            if (mounted) setOrderStats(orderRes.data);
          } catch (error) {
            console.error('Error loading order stats:', error);
          }
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadStats();
    return () => { mounted = false; };
  }, [permissions]);

  const monthRevenue = stats?.month?.revenue || 0;
  const todayRevenue = stats?.today?.revenue || 0;
  const todayInvoices = stats?.today?.invoices || 0;
  const lowStock = stats?.inventory?.lowStockCount || 0;

  // Use real data from API - ensure they are always arrays
  const last7DaysData = Array.isArray(stats?.last7Days) ? stats.last7Days : [];
  const topProductsData = Array.isArray(stats?.topProducts) ? stats.topProducts : [];

  function formatMoney(v) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v || 0);
  }

  const getRoleInfo = (role) => {
    const roleMap = {
      admin: { color: 'purple', icon: <TrophyOutlined />, name: 'Quản trị viên' },
      manager: { color: 'orange', icon: <UserOutlined />, name: 'Quản lý' },
      pharmacist: { color: 'blue', icon: <UserOutlined />, name: 'Dược sĩ' },
      staff: { color: 'green', icon: <UserOutlined />, name: 'Nhân viên' }
    };
    return roleMap[role] || { color: 'default', icon: <UserOutlined />, name: role };
  };

  const roleInfo = getRoleInfo(user?.role);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Text>Đang tải thống kê...</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px' }}>
      {/* Compact Welcome Section */}
      <Card
        size="small"
        style={{
          marginBottom: '16px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          padding: '12px'
        }}
      >
        <Row align="middle" justify="space-between">
          <Col>
            <Space>
              <div>
                <Title level={4} style={{ margin: 0, color: 'white' }}>
                  Xin chào, {user?.name || 'Quản trị viên'}!
                </Title>
                <Space style={{ marginTop: '4px' }}>
                  <Tag color={roleInfo.color} icon={roleInfo.icon} style={{ background: 'white', fontSize: '11px' }}>
                    {roleInfo.name}
                  </Tag>
                  <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px' }}>
                    📅 {new Date().toLocaleDateString('vi-VN', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </Text>
                </Space>
              </div>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Compact Stats Grid - 6 per row */}
      <Row gutter={[12, 12]} style={{ marginBottom: '16px' }}>
        {permissions.canReadProducts() && (
          <Col xs={12} sm={8} lg={4}>
            <Card size="small" hoverable onClick={() => navigate('/admin/products')} style={{ cursor: 'pointer' }}>
              <Statistic
                title={<Text style={{ fontSize: 11 }}>Sản phẩm</Text>}
                value={stats?.products?.total || 0}
                prefix={<MedicineBoxOutlined style={{ color: '#52c41a', fontSize: 16 }} />}
                valueStyle={{ color: '#52c41a', fontSize: '20px' }}
              />
            </Card>
          </Col>
        )}

        {permissions.canReadCategories() && (
          <Col xs={12} sm={8} lg={4}>
            <Card size="small" hoverable onClick={() => navigate('/admin/categories')} style={{ cursor: 'pointer' }}>
              <Statistic
                title={<Text style={{ fontSize: 11 }}>Danh mục</Text>}
                value={stats?.categories?.total || 0}
                prefix={<FolderOutlined style={{ color: '#1890ff', fontSize: 16 }} />}
                valueStyle={{ color: '#1890ff', fontSize: '20px' }}
              />
            </Card>
          </Col>
        )}

        {permissions.canReadInventory() && (
          <Col xs={12} sm={8} lg={4}>
            <Card size="small" hoverable onClick={() => navigate('/admin/inventory')} style={{ cursor: 'pointer', borderColor: lowStock > 0 ? '#ff4d4f' : undefined }}>
              <Statistic
                title={<Text style={{ fontSize: 11 }}>Cảnh báo</Text>}
                value={lowStock}
                prefix={<WarningOutlined style={{ color: lowStock > 0 ? '#ff4d4f' : '#52c41a', fontSize: 16 }} />}
                valueStyle={{ color: lowStock > 0 ? '#ff4d4f' : '#52c41a', fontSize: '20px' }}
              />
            </Card>
          </Col>
        )}

        {permissions.canReadUsers() && (
          <Col xs={12} sm={8} lg={4}>
            <Card size="small" hoverable onClick={() => navigate('/admin/users')} style={{ cursor: 'pointer' }}>
              <Statistic
                title={<Text style={{ fontSize: 11 }}>Nhân viên</Text>}
                value={userStats?.totalUsers || 0}
                prefix={<TeamOutlined style={{ color: '#722ed1', fontSize: 16 }} />}
                valueStyle={{ color: '#722ed1', fontSize: '20px' }}
              />
            </Card>
          </Col>
        )}

        {(permissions.canReadOrders() || permissions.canReadReports()) && (
          <>
            <Col xs={12} sm={8} lg={4}>
              <Card size="small" hoverable>
                <Statistic
                  title={<Text style={{ fontSize: 11 }}>Doanh thu tháng</Text>}
                  value={monthRevenue / 1000000}
                  prefix={<DollarOutlined style={{ color: '#52c41a', fontSize: 16 }} />}
                  suffix="M"
                  valueStyle={{ color: '#52c41a', fontSize: '20px' }}
                  precision={1}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <Card size="small" hoverable>
                <Statistic
                  title={<Text style={{ fontSize: 11 }}>Đơn hôm nay</Text>}
                  value={todayInvoices}
                  prefix={<ShoppingCartOutlined style={{ color: '#1890ff', fontSize: 16 }} />}
                  valueStyle={{ color: '#1890ff', fontSize: '20px' }}
                />
              </Card>
            </Col>
          </>
        )}
      </Row>

      {/* Order Status - Compact */}
      {permissions.canReadOrders() && orderStats && (
        <Row gutter={[12, 12]} style={{ marginBottom: '16px' }}>
          <Col xs={12} sm={6}>
            <Card size="small" hoverable onClick={() => navigate('/admin/orders?status=pending')} style={{ cursor: 'pointer' }}>
              <Statistic
                title={<Text style={{ fontSize: 11 }}>Chờ xử lý</Text>}
                value={orderStats.statusBreakdown?.find(s => s._id === 'pending')?.count || 0}
                prefix={<ClockCircleOutlined style={{ color: '#faad14', fontSize: 16 }} />}
                valueStyle={{ color: '#faad14', fontSize: '18px' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" hoverable onClick={() => navigate('/admin/orders?status=processing')} style={{ cursor: 'pointer' }}>
              <Statistic
                title={<Text style={{ fontSize: 11 }}>Đang xử lý</Text>}
                value={orderStats.statusBreakdown?.find(s => s._id === 'processing')?.count || 0}
                prefix={<ShoppingOutlined style={{ color: '#1890ff', fontSize: 16 }} />}
                valueStyle={{ color: '#1890ff', fontSize: '18px' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" hoverable onClick={() => navigate('/admin/orders?status=shipping')} style={{ cursor: 'pointer' }}>
              <Statistic
                title={<Text style={{ fontSize: 11 }}>Đang giao</Text>}
                value={orderStats.statusBreakdown?.find(s => s._id === 'shipping')?.count || 0}
                prefix={<CarOutlined style={{ color: '#13c2c2', fontSize: 16 }} />}
                valueStyle={{ color: '#13c2c2', fontSize: '18px' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" hoverable onClick={() => navigate('/admin/orders?status=completed')} style={{ cursor: 'pointer' }}>
              <Statistic
                title={<Text style={{ fontSize: 11 }}>Hoàn thành</Text>}
                value={orderStats.statusBreakdown?.find(s => s._id === 'completed')?.count || 0}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />}
                valueStyle={{ color: '#52c41a', fontSize: '18px' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Charts Row */}
      <Row gutter={[12, 12]}>
        {/* 7-Day Revenue Chart */}
        <Col xs={24} lg={12}>
          <Card
            size="small"
            title={<><LineChartOutlined /> Doanh thu 7 ngày gần nhất</>}
            extra={<Text type="secondary" style={{ fontSize: 11 }}>VNĐ</Text>}
          >
            <Line7DaysChart data={last7DaysData} />
          </Card>
        </Col>

        {/* Top Products Chart */}
        <Col xs={24} lg={12}>
          <Card
            size="small"
            title={<><BarChartOutlined /> Top 5 sản phẩm bán chạy</>}
            extra={<Text type="secondary" style={{ fontSize: 11 }}>Số lượng</Text>}
          >
            <HorizontalBarChart data={topProductsData} />
          </Card>
        </Col>

        {/* Order Distribution Pie Chart */}
        {permissions.canReadOrders() && orderStats && (
          <Col xs={24} lg={12}>
            <Card
              size="small"
              title={<><PieChartOutlined /> Phân bố đơn hàng</>}
            >
              <SimplePieChart data={orderStats.statusBreakdown || []} />
            </Card>
          </Col>
        )}

        {/* Quick Stats Summary */}
        <Col xs={24} lg={12}>
          <Card size="small" title="Tổng quan nhanh">
            <Row gutter={[8, 8]}>
              <Col span={12}>
                <div style={{ padding: '8px', background: '#f0f9ff', borderRadius: '6px' }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Tổng doanh thu tháng</Text>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>
                    {formatMoney(monthRevenue)}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ padding: '8px', background: '#f6ffed', borderRadius: '6px' }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Doanh thu hôm nay</Text>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#52c41a' }}>
                    {formatMoney(todayRevenue)}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ padding: '8px', background: '#fff7e6', borderRadius: '6px' }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Đơn hàng tháng</Text>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fa8c16' }}>
                    {orderStats?.totalOrders || 0}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ padding: '8px', background: '#fff1f0', borderRadius: '6px' }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Tồn kho thấp</Text>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff4d4f' }}>
                    {lowStock} SP
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

// Line Chart Component for 7 Days Revenue
function Line7DaysChart({ data }) {
  // Safety check for empty or invalid data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#8c8c8c' }}>
        <Text type="secondary">Chưa có dữ liệu doanh thu</Text>
      </div>
    );
  }

  const max = Math.max(...data.map(d => d.revenue));
  const min = Math.min(...data.map(d => d.revenue));
  const range = max - min || 1;

  return (
    <div style={{ padding: '8px 0' }}>
      <div style={{ height: 160, position: 'relative' }}>
        <svg width="100%" height="100%" viewBox="0 0 400 160" preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1="0"
              y1={i * 40}
              x2="400"
              y2={i * 40}
              stroke="#f0f0f0"
              strokeWidth="1"
            />
          ))}

          {/* Area fill */}
          <path
            d={`M 0 160 ${data.map((d, i) => {
              const x = (i / (data.length - 1)) * 400;
              const y = 160 - ((d.revenue - min) / range) * 140;
              return `L ${x} ${y}`;
            }).join(' ')} L 400 160 Z`}
            fill="url(#gradient)"
            opacity="0.3"
          />

          {/* Line */}
          <polyline
            points={data.map((d, i) => {
              const x = (i / (data.length - 1)) * 400;
              const y = 160 - ((d.revenue - min) / range) * 140;
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#1890ff"
            strokeWidth="2"
          />

          {/* Data points */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * 400;
            const y = 160 - ((d.revenue - min) / range) * 140;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                fill="#1890ff"
                style={{ cursor: 'pointer' }}
              >
                <title>{`${d.day}/12: ${(d.revenue / 1000000).toFixed(1)}M VNĐ`}</title>
              </circle>
            );
          })}

          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1890ff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#1890ff" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* X-axis labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: 11, color: '#8c8c8c' }}>
        {data.map(d => (
          <span key={d.date}>{d.day}/12</span>
        ))}
      </div>

      {/* Summary */}
      <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#e6f7ff', borderRadius: '4px', border: '1px solid #91d5ff' }}>
        <Text style={{ fontSize: '11px', color: '#0050b3' }}>
          💰 Tổng: {(data.reduce((sum, d) => sum + d.revenue, 0) / 1000000).toFixed(1)}M VNĐ |
          📊 TB: {(data.reduce((sum, d) => sum + d.revenue, 0) / data.length / 1000000).toFixed(1)}M VNĐ/ngày
        </Text>
      </div>
    </div>
  );
}

// Horizontal Bar Chart for Top Products
function HorizontalBarChart({ data }) {
  // Safety check for empty or invalid data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#8c8c8c' }}>
        <Text type="secondary">Chưa có dữ liệu sản phẩm</Text>
      </div>
    );
  }

  const max = Math.max(...data.map(d => d.sales));

  return (
    <div style={{ padding: '8px 0' }}>
      {data.map((item, i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ fontSize: 12 }} ellipsis={{ tooltip: item.name }}>{item.name}</Text>
            <Text strong style={{ fontSize: 12, color: '#52c41a' }}>{item.sales}</Text>
          </div>
          <Progress
            percent={(item.sales / max) * 100}
            showInfo={false}
            strokeColor={{
              '0%': '#52c41a',
              '100%': '#73d13d',
            }}
            size="small"
          />
        </div>
      ))}
    </div>
  );
}

// Simple Pie Chart for Order Distribution
function SimplePieChart({ data }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const colors = {
    pending: '#faad14',
    processing: '#1890ff',
    shipping: '#13c2c2',
    completed: '#52c41a',
    cancelled: '#ff4d4f'
  };
  const names = {
    pending: 'Chờ xử lý',
    processing: 'Đang xử lý',
    shipping: 'Đang giao',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy'
  };

  let currentAngle = 0;
  const segments = data.map(item => {
    const percentage = (item.count / total) * 100;
    const angle = (percentage / 100) * 360;
    const segment = {
      ...item,
      percentage,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
      color: colors[item._id] || '#d9d9d9'
    };
    currentAngle += angle;
    return segment;
  });

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '8px 0' }}>
      {/* Pie chart */}
      <div style={{ position: 'relative', width: 120, height: 120 }}>
        <svg width="120" height="120" viewBox="0 0 120 120">
          {segments.map((seg, i) => {
            const startAngle = (seg.startAngle - 90) * (Math.PI / 180);
            const endAngle = (seg.endAngle - 90) * (Math.PI / 180);
            const largeArc = seg.percentage > 50 ? 1 : 0;

            const x1 = 60 + 50 * Math.cos(startAngle);
            const y1 = 60 + 50 * Math.sin(startAngle);
            const x2 = 60 + 50 * Math.cos(endAngle);
            const y2 = 60 + 50 * Math.sin(endAngle);

            return (
              <path
                key={i}
                d={`M 60 60 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`}
                fill={seg.color}
                stroke="#fff"
                strokeWidth="2"
                style={{ cursor: 'pointer' }}
              >
                <title>{`${names[seg._id]}: ${seg.count} (${seg.percentage.toFixed(1)}%)`}</title>
              </path>
            );
          })}
          {/* Center circle */}
          <circle cx="60" cy="60" r="25" fill="white" />
          <text x="60" y="55" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#262626">{total}</text>
          <text x="60" y="70" textAnchor="middle" fontSize="10" fill="#8c8c8c">Đơn hàng</text>
        </svg>
      </div>

      {/* Legend */}
      <div style={{ flex: 1 }}>
        {data.map(item => (
          <div key={item._id} style={{ display: 'flex', alignItems: 'center', marginBottom: 8, justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: 12,
                height: 12,
                background: colors[item._id],
                marginRight: 8,
                borderRadius: '2px'
              }} />
              <Text style={{ fontSize: 12 }}>{names[item._id]}</Text>
            </div>
            <Text strong style={{ fontSize: 12 }}>{item.count}</Text>
          </div>
        ))}
      </div>
    </div>
  );
}
