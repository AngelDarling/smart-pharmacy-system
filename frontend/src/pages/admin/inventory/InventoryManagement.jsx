import React from 'react';
import { Tabs, Typography } from 'antd';
import { ShoppingOutlined, HistoryOutlined, AlertOutlined, FileTextOutlined, ImportOutlined } from '@ant-design/icons';
import CurrentStockTab from './tabs/CurrentStockTab';
import GoodsReceiptFormTab from './tabs/GoodsReceiptFormTab';
import GoodsReceiptHistoryTab from './tabs/GoodsReceiptHistoryTab';
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
          <ImportOutlined />
          Nhập kho
        </span>
      ),
      children: <GoodsReceiptFormTab />
    },
    {
      key: '3',
      label: (
        <span>
          <FileTextOutlined />
          Lịch sử phiếu nhập
        </span>
      ),
      children: <GoodsReceiptHistoryTab />
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
          Quản lý nhập kho, lịch sử phiếu nhập, theo dõi hạn sử dụng và cảnh báo tồn kho
        </Text>
      </div>

      <Tabs defaultActiveKey="1" type="card" items={items} />
    </div>
  );
}
