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
  EditOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

export default function AdminDashboard() {
  const { user } = useAuth();
  const { permissions } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  
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
      <Card style={{ marginBottom: '24px' }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Space size="large">
              <Avatar size={64} icon={roleInfo.icon} style={{ backgroundColor: roleInfo.color === 'purple' ? '#722ed1' : undefined }} />
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  Xin chào, {user?.name}!
                </Title>
                <Space>
                  <Tag color={roleInfo.color} icon={roleInfo.icon}>
                    {roleInfo.name}
                  </Tag>
                  {user?.department && (
                    <Tag color="blue">{user.department}</Tag>
                  )}
                  {user?.position && (
                    <Tag color="green">{user.position}</Tag>
                  )}
                </Space>
                <div style={{ marginTop: '8px' }}>
                  <Text type="secondary">
                    Đăng nhập cuối: {user?.lastLogin ? new Date(user.lastLogin).toLocaleString('vi-VN') : 'Chưa có'}
                  </Text>
                </div>
              </div>
            </Space>
          </Col>
          <Col>
            <Space direction="vertical" align="end">
              <Text strong>Số lần đăng nhập: {user?.loginCount || 0}</Text>
              <Text type="secondary">Hôm nay: {new Date().toLocaleDateString('vi-VN')}</Text>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Quick Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {permissions.canReadProducts() && (
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng sản phẩm"
                value={stats?.products?.total || 0}
                prefix={<ShoppingOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
        )}
        
        {permissions.canReadCategories() && (
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Danh mục"
                value={stats?.categories?.total || 0}
                prefix={<FolderOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        )}

        {permissions.canReadInventory() && (
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Cảnh báo tồn kho"
                value={lowStock}
                prefix={<WarningOutlined />}
                valueStyle={{ color: lowStock > 0 ? '#cf1322' : '#3f8600' }}
                suffix="sản phẩm"
              />
            </Card>
          </Col>
        )}

        {permissions.canReadUsers() && (
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng người dùng"
                value={userStats?.totalUsers || 0}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        )}
      </Row>

      {/* Revenue Stats (if user has permission) */}
      {(permissions.canReadOrders() || permissions.canReadReports()) && (
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={8}>
            <Card>
              <Statistic
                title="Doanh số tháng này"
                value={monthRevenue}
                prefix={<DollarOutlined />}
                formatter={(value) => formatMoney(value)}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card>
              <Statistic
                title="Hóa đơn hôm nay"
                value={todayInvoices}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card>
              <Statistic
                title="Doanh số hôm nay"
                value={todayRevenue}
                prefix={<DollarOutlined />}
                formatter={(value) => formatMoney(value)}
                valueStyle={{ color: '#722ed1' }}
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

      {/* Charts and Tables */}
      <Row gutter={[16, 16]}>
        {permissions.canReadReports() && stats?.chart?.daily && (
          <Col xs={24} lg={16}>
            <Card title="Doanh số bán hàng tháng này" extra={<BarChartOutlined />}>
              <DashboardChart data={stats.chart.daily} />
            </Card>
          </Col>
        )}
        
        {permissions.canReadInventory() && (
          <Col xs={24} lg={8}>
            <Card title="Cảnh báo tồn kho" extra={<WarningOutlined />}>
              {lowStock > 0 ? (
                <Alert
                  message={`${lowStock} sản phẩm sắp hết hàng`}
                  type="warning"
                  showIcon
                  action={
                    <Button size="small" type="primary">
                      Xem chi tiết
                    </Button>
                  }
                />
              ) : (
                <Alert
                  message="Tất cả sản phẩm đều có đủ hàng"
                  type="success"
                  showIcon
                />
              )}
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


