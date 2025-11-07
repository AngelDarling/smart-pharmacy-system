import { useEffect, useMemo, useState, useCallback } from "react";
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
  Avatar,
  Tag,
  Progress,
  List,
  Badge,
  Divider,
  Alert,
  Button,
  Tooltip
} from 'antd';
import {
  UserOutlined,
  ShoppingOutlined,
  FolderOutlined,
  DatabaseOutlined,
  TeamOutlined,
  DollarOutlined,
  WarningOutlined,
  CalendarOutlined,
  TrophyOutlined,
  BarChartOutlined,
  EyeOutlined,
  EditOutlined,
  MedicineBoxOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CarOutlined,
  FileTextOutlined,
  FireOutlined,
  LinkOutlined
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
  const [recentOrders, setRecentOrders] = useState([]);
  
  // Force reload stats when component mounts
  const [reloadTrigger, setReloadTrigger] = useState(0);
  
  useEffect(() => {
    const flag = localStorage.getItem("flash");
    if (flag === "login_success") {
      showSuccess("Đăng nhập thành công", "Xin chào!");
      localStorage.removeItem("flash");
    }
  }, []);
  
  // Force reload when component mounts
  useEffect(() => {
    setReloadTrigger(prev => prev + 1);
  }, []);
  useEffect(() => {
    let mounted = true;
    const loadStats = async () => {
      try {
        setLoading(true);
        
        // Load general stats if user has permission
        if (permissions.canReadProducts() || permissions.canReadInventory()) {
          const statsRes = await api.get("/admin/stats");
          if (mounted) setStats(statsRes.data);
        }
        
        // Load user stats if user has permission
        if (permissions.canReadUsers()) {
          const userRes = await api.get("/users/stats");
          if (mounted) setUserStats(userRes.data);
        }
        
        // Load order stats if user has permission
        if (permissions.canReadOrders()) {
          try {
            const orderRes = await api.get("/orders/stats");
            if (mounted) setOrderStats(orderRes.data);
            
            // Load recent orders
            const recentRes = await api.get("/orders?limit=5&sort=-createdAt");
            if (mounted) setRecentOrders(recentRes.data?.items || []);
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
    
    // Load stats when component mounts or when permissions change
    loadStats();
    
    return () => { mounted = false; };
  }, [permissions, reloadTrigger]); // Depend on permissions and reload trigger

  const monthRevenue = stats?.month?.revenue || 0;
  const todayRevenue = stats?.today?.revenue || 0;
  const todayInvoices = stats?.today?.invoices || 0;
  const lowStock = stats?.inventory?.lowStockCount || 0;

  function formatMoney(v) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v || 0);
  }

  // Get role display info
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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px' 
      }}>
        <Text>Đang tải thống kê...</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Welcome Section */}
      <Card style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Space size="large">
              <Avatar size={64} icon={<MedicineBoxOutlined />} style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }} />
              <div>
                <Title level={2} style={{ margin: 0, color: 'white' }}>
                  Xin chào, {user?.name || 'Quản trị viên'}!
                </Title>
                <Space style={{ marginTop: '8px' }}>
                  <Tag color={roleInfo.color} icon={roleInfo.icon} style={{ background: 'white' }}>
                    {roleInfo.name}
                  </Tag>
                  {user?.department && (
                    <Tag color="blue" style={{ background: 'white' }}>{user.department}</Tag>
                  )}
                </Space>
                <div style={{ marginTop: '12px' }}>
                  <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                    📅 {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </Text>
                </div>
              </div>
            </Space>
          </Col>
          <Col>
            <Space direction="vertical" align="end">
              <Text strong style={{ color: 'white', fontSize: '16px' }}>
                🏥 Smart Pharmacy System
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                Hệ thống quản lý nhà thuốc
              </Text>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Quick Stats - Main Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {permissions.canReadProducts() && (
          <Col xs={24} sm={12} lg={6}>
            <Card 
              hoverable
              onClick={() => navigate('/admin/products')}
              style={{ cursor: 'pointer' }}
            >
              <Statistic
                title="Tổng sản phẩm"
                value={stats?.products?.total || 0}
                prefix={<MedicineBoxOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a', fontSize: '28px' }}
              />
              <div style={{ marginTop: '8px' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Sản phẩm đang hoạt động
                </Text>
              </div>
            </Card>
          </Col>
        )}
        
        {permissions.canReadCategories() && (
          <Col xs={24} sm={12} lg={6}>
            <Card 
              hoverable
              onClick={() => navigate('/admin/categories')}
              style={{ cursor: 'pointer' }}
            >
              <Statistic
                title="Danh mục sản phẩm"
                value={stats?.categories?.total || 0}
                prefix={<FolderOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff', fontSize: '28px' }}
              />
              <div style={{ marginTop: '8px' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Phân loại thuốc & TPCN
                </Text>
              </div>
            </Card>
          </Col>
        )}

        {permissions.canReadInventory() && (
          <Col xs={24} sm={12} lg={6}>
            <Card 
              hoverable
              onClick={() => navigate('/admin/inventory')}
              style={{ cursor: 'pointer', borderColor: lowStock > 0 ? '#ff4d4f' : undefined }}
            >
              <Statistic
                title="Cảnh báo tồn kho"
                value={lowStock}
                prefix={<WarningOutlined style={{ color: lowStock > 0 ? '#ff4d4f' : '#52c41a' }} />}
                valueStyle={{ color: lowStock > 0 ? '#ff4d4f' : '#52c41a', fontSize: '28px' }}
                suffix="sản phẩm"
              />
              <div style={{ marginTop: '8px' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {lowStock > 0 ? 'Cần nhập hàng ngay' : 'Đủ hàng trong kho'}
                </Text>
              </div>
            </Card>
          </Col>
        )}

        {permissions.canReadUsers() && (
          <Col xs={24} sm={12} lg={6}>
            <Card 
              hoverable
              onClick={() => navigate('/admin/users')}
              style={{ cursor: 'pointer' }}
            >
              <Statistic
                title="Nhân viên"
                value={userStats?.totalUsers || 0}
                prefix={<TeamOutlined style={{ color: '#722ed1' }} />}
                valueStyle={{ color: '#722ed1', fontSize: '28px' }}
              />
              <div style={{ marginTop: '8px' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {userStats?.activeUsers || 0} đang hoạt động
                </Text>
              </div>
            </Card>
          </Col>
        )}
      </Row>

      {/* Revenue Stats (if user has permission) */}
      {(permissions.canReadOrders() || permissions.canReadReports()) && (
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={8}>
            <Card hoverable>
              <Statistic
                title="Doanh số tháng này"
                value={monthRevenue}
                prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
                formatter={(value) => formatMoney(value)}
                valueStyle={{ color: '#52c41a', fontSize: '24px' }}
              />
              <div style={{ marginTop: '8px' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  📊 Tổng doanh thu trong tháng
                </Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card hoverable>
              <Statistic
                title="Hóa đơn hôm nay"
                value={todayInvoices}
                prefix={<ShoppingCartOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff', fontSize: '24px' }}
              />
              <div style={{ marginTop: '8px' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  🛒 Số đơn hàng đã hoàn thành
                </Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card hoverable>
              <Statistic
                title="Doanh số hôm nay"
                value={todayRevenue}
                prefix={<DollarOutlined style={{ color: '#722ed1' }} />}
                formatter={(value) => formatMoney(value)}
                valueStyle={{ color: '#722ed1', fontSize: '24px' }}
              />
              <div style={{ marginTop: '8px' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  💰 Doanh thu trong ngày
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* Order Status Stats */}
      {permissions.canReadOrders() && orderStats && (
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable onClick={() => navigate('/admin/orders?status=pending')} style={{ cursor: 'pointer' }}>
              <Statistic
                title="Đơn chờ xử lý"
                value={orderStats.statusBreakdown?.find(s => s._id === 'pending')?.count || 0}
                prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14', fontSize: '24px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable onClick={() => navigate('/admin/orders?status=processing')} style={{ cursor: 'pointer' }}>
              <Statistic
                title="Đang xử lý"
                value={orderStats.statusBreakdown?.find(s => s._id === 'processing')?.count || 0}
                prefix={<EditOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff', fontSize: '24px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable onClick={() => navigate('/admin/orders?status=shipping')} style={{ cursor: 'pointer' }}>
              <Statistic
                title="Đang giao hàng"
                value={orderStats.statusBreakdown?.find(s => s._id === 'shipping')?.count || 0}
                prefix={<CarOutlined style={{ color: '#13c2c2' }} />}
                valueStyle={{ color: '#13c2c2', fontSize: '24px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable onClick={() => navigate('/admin/orders?status=completed')} style={{ cursor: 'pointer' }}>
              <Statistic
                title="Đã hoàn thành"
                value={orderStats.statusBreakdown?.find(s => s._id === 'completed')?.count || 0}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a', fontSize: '24px' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* User Statistics (if user has permission) */}
      {permissions.canReadUsers() && userStats && (
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} lg={12}>
            <Card title="Thống kê người dùng" extra={<TeamOutlined />}>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Tổng người dùng"
                    value={userStats.totalUsers}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Người dùng hoạt động"
                    value={userStats.activeUsers}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Col>
              </Row>
              <Divider />
              <div>
                <Text strong>Phân bố theo vai trò:</Text>
                <div style={{ marginTop: '12px' }}>
                  {Object.entries(userStats.usersByRole || {}).map(([role, count]) => (
                    <div key={role} style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <Text>{role === 'admin' ? 'Admin' : role === 'manager' ? 'Quản lý' : role === 'pharmacist' ? 'Dược sĩ' : 'Nhân viên'}</Text>
                        <Text strong>{count}</Text>
                      </div>
                      <Progress 
                        percent={Math.round((count / userStats.totalUsers) * 100)} 
                        size="small" 
                        strokeColor={role === 'admin' ? '#722ed1' : role === 'manager' ? '#fa8c16' : role === 'pharmacist' ? '#1890ff' : '#52c41a'}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Nhân viên gần đây" extra={<CalendarOutlined />}>
              <List
                dataSource={userStats.recentUsers || []}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={item.name}
                      description={
                        <Space>
                          <Tag color={getRoleInfo(item.role).color}>{getRoleInfo(item.role).name}</Tag>
                          <Text type="secondary">
                            {item.lastLogin ? new Date(item.lastLogin).toLocaleDateString('vi-VN') : 'Chưa đăng nhập'}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Charts and Recent Orders */}
      <Row gutter={[16, 16]}>
        {permissions.canReadReports() && stats?.chart?.daily && (
          <Col xs={24} lg={16}>
            <Card 
              title={<><BarChartOutlined /> Doanh số bán hàng tháng này</>}
              extra={
                <Button type="link" icon={<LinkOutlined />} onClick={() => navigate('/admin/reports')}>
                  Xem báo cáo
                </Button>
              }
            >
              <DashboardChart data={stats.chart.daily} />
            </Card>
          </Col>
        )}
        
        {permissions.canReadOrders() && recentOrders.length > 0 && (
          <Col xs={24} lg={permissions.canReadReports() && stats?.chart?.daily ? 8 : 24}>
            <Card 
              title={<><ShoppingCartOutlined /> Đơn hàng gần đây</>}
              extra={
                <Button type="link" icon={<LinkOutlined />} onClick={() => navigate('/admin/orders')}>
                  Xem tất cả
                </Button>
              }
            >
              <List
                dataSource={recentOrders}
                renderItem={(order) => {
                  const statusColors = {
                    pending: 'orange',
                    processing: 'blue',
                    shipping: 'cyan',
                    completed: 'green',
                    cancelled: 'red'
                  };
                  const statusNames = {
                    pending: 'Chờ xử lý',
                    processing: 'Đang xử lý',
                    shipping: 'Đang giao',
                    completed: 'Hoàn thành',
                    cancelled: 'Đã hủy'
                  };
                  return (
                    <List.Item 
                      style={{ cursor: 'pointer', padding: '12px' }}
                      onClick={() => navigate(`/admin/orders/${order._id}`)}
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<FileTextOutlined />} style={{ backgroundColor: statusColors[order.status] || 'gray' }} />}
                        title={
                          <Space>
                            <Text strong>#{order.code || order._id.slice(-6)}</Text>
                            <Tag color={statusColors[order.status]}>{statusNames[order.status] || order.status}</Tag>
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size={2}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {order.customer?.name || order.shippingAddress?.name || 'Khách hàng'}
                            </Text>
                            <Text strong style={{ color: '#52c41a' }}>
                              {formatMoney(order.totals?.grand || 0)}
                            </Text>
                            <Text type="secondary" style={{ fontSize: '11px' }}>
                              {new Date(order.createdAt).toLocaleString('vi-VN')}
                            </Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            </Card>
          </Col>
        )}
      </Row>

      {/* Recent Activities */}
      {stats?.activities && stats.activities.length > 0 && (
        <Card title="Hoạt động gần đây" style={{ marginTop: '24px' }}>
          <List
            dataSource={stats.activities}
            renderItem={(activity) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<EditOutlined />} />}
                  title={activity.action}
                  description={new Date(activity.createdAt).toLocaleString('vi-VN')}
                />
              </List.Item>
            )}
          />
        </Card>
      )}
    </div>
  );
}

function DashboardChart({ data }) {
  // Enhanced bar chart using Ant Design components
  const max = Math.max(1, ...data.map((d) => d.total));
  
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 200, padding: '16px 0' }}>
        {data.map((d) => (
          <Tooltip key={d.day} title={`Ngày ${d.day}: ${d.total.toLocaleString("vi-VN")} VNĐ`}>
            <div 
              style={{ 
                background: "linear-gradient(to top, #52c41a, #73d13d)", 
                width: 20, 
                height: Math.round((d.total / max) * 180),
                borderRadius: '4px 4px 0 0',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
            />
          </Tooltip>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, fontSize: 12, color: "#8c8c8c", marginTop: 12, justifyContent: 'space-between' }}>
        {data.map((d) => (
          <div key={d.day} style={{ width: 20, textAlign: "center", fontWeight: 500 }}>
            {d.day}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, padding: '12px', backgroundColor: '#f6ffed', borderRadius: '6px', border: '1px solid #b7eb8f' }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          💡 Tổng doanh số: {data.reduce((sum, d) => sum + d.total, 0).toLocaleString("vi-VN")} VNĐ
        </Text>
      </div>
    </div>
  );
}


