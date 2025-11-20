import React from 'react';
import { Tabs, Typography } from 'antd';
import { ShoppingOutlined, HistoryOutlined, AlertOutlined, FileTextOutlined } from '@ant-design/icons';
import CurrentStockTab from './tabs/CurrentStockTab';
import StockMovementTab from './tabs/StockMovementTab';
import GoodsReceiptTab from './tabs/GoodsReceiptTab';
import AlertsTab from './tabs/AlertsTab';

const { Title, Text } = Typography;

export default function InventoryManagement() {
  const items = [
    {
      key: '1',
      label: (
        <span>
          <ShoppingOutlined />
          Tồn kho hiện tại
        </span>
      ),
      children: <CurrentStockTab />
    },
    {
      key: '2',
      label: (
        <span>
          <HistoryOutlined />
          Nhập/Xuất kho
        </span>
      ),
      children: <StockMovementTab />
    },
    {
      key: '3',
      label: (
        <span>
          <FileTextOutlined />
          Phiếu nhập
        </span>
      ),
      children: <GoodsReceiptTab />
    },
    {
      key: '4',
      label: (
        <span>
          <AlertOutlined />
          Cảnh báo tồn kho
        </span>
      ),
      children: <AlertsTab />
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>
          <ShoppingOutlined style={{ marginRight: '8px' }} />
          Quản lý tồn kho
        </Title>
        <Text type="secondary">
          Quản lý nhập/xuất, phiếu nhập, theo dõi hạn sử dụng và cảnh báo tồn kho
        </Text>
      </div>

      <Tabs defaultActiveKey="1" type="card" items={items} />
    </div>
  );
}
