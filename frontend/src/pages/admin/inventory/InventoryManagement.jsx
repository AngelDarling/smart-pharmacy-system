import React from 'react';
import { Tabs, Typography, Avatar } from 'antd';
import { ShoppingOutlined, HistoryOutlined, AlertOutlined, FileTextOutlined, ImportOutlined, InboxOutlined, FileDoneOutlined } from '@ant-design/icons';
import CurrentStockTab from './tabs/CurrentStockTab';
import GoodsReceiptFormTab from './tabs/GoodsReceiptFormTab';
import GoodsReceiptsTab from './tabs/GoodsReceiptsTab';
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
          <FileDoneOutlined />
          Quản lý phiếu nhập
        </span>
      ),
      children: <GoodsReceiptsTab />
    },
    {
      key: '4',
      label: (
        <span>
          <FileTextOutlined />
          Lịch sử phiếu nhập
        </span>
      ),
      children: <GoodsReceiptHistoryTab />
    },
    {
      key: '5',
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
            icon={<InboxOutlined />}
            style={{
              backgroundColor: '#722ed1',
              marginRight: '16px'
            }}
          />
          <div>
            <h2 style={{ margin: 0, color: '#262626' }}>
              Quản lý tồn kho
            </h2>
            <div style={{ color: '#8c8c8c', fontSize: '14px' }}>
              Quản lý nhập kho, lịch sử phiếu nhập và cảnh báo tồn kho
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultActiveKey="1" type="card" items={items} />
    </div>
  );
}
