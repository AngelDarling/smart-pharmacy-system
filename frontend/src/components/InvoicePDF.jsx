import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import dayjs from 'dayjs';
import { NotoSansRegularBase64, NotoSansBoldBase64 } from '../fonts/notoSansBase64';

// Register font Noto Sans subset từ base64 - chỉ ~38KB mỗi font (giảm 90% so với font đầy đủ)
// Font subset chỉ chứa ký tự tiếng Việt và các ký tự cơ bản, hỗ trợ đầy đủ tiếng Việt
Font.register({
  family: 'NotoSans',
  fonts: [
    {
      src: `data:font/truetype;base64,${NotoSansRegularBase64}`,
      fontWeight: 'normal',
    },
    {
      src: `data:font/truetype;base64,${NotoSansBoldBase64}`,
      fontWeight: 'bold',
    },
  ],
});

// Định nghĩa styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: 'NotoSans', // Font Noto Sans hỗ trợ đầy đủ tiếng Việt
  },
  header: {
    marginBottom: 30,
    borderBottom: '2px solid #000',
    paddingBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  col: {
    flex: 1,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  value: {
    marginBottom: 4,
  },
  table: {
    marginTop: 10,
    border: '1px solid #000',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottom: '1px solid #000',
    padding: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #ccc',
    padding: 8,
  },
  tableCell: {
    flex: 1,
    padding: 4,
  },
  tableCellCenter: {
    flex: 1,
    padding: 4,
    textAlign: 'center',
  },
  tableCellRight: {
    flex: 1,
    padding: 4,
    textAlign: 'right',
  },
  totals: {
    marginTop: 20,
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  totalLabel: {
    width: 150,
    textAlign: 'right',
    marginRight: 10,
  },
  totalValue: {
    width: 120,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  grandTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16a34a',
    marginTop: 8,
    paddingTop: 8,
    borderTop: '1px solid #000',
  },
  footer: {
    marginTop: 40,
    textAlign: 'center',
    borderTop: '1px solid #ddd',
    paddingTop: 20,
    fontSize: 10,
    color: '#666',
  },
});

const InvoicePDF = ({ order }) => {
  if (!order) return null;

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount || 0) + '₫';
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>HÓA ĐƠN BÁN HÀNG</Text>
          <Text style={styles.subtitle}>Smart Pharmacy System</Text>
        </View>

        {/* Invoice Info */}
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Mã hóa đơn:</Text>
            <Text style={styles.value}>{order.code}</Text>
            <Text style={styles.label}>Ngày xuất:</Text>
            <Text style={styles.value}>
              {dayjs(order.createdAt).format('DD/MM/YYYY HH:mm')}
            </Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Phương thức thanh toán:</Text>
            <Text style={styles.value}>{(order.paymentMethod || 'cod').toUpperCase()}</Text>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Tên khách hàng:</Text>
              <Text style={styles.value}>
                {order.shippingAddress?.fullName || order.userId?.name || 'Khách vãng lai'}
              </Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>SĐT:</Text>
              <Text style={styles.value}>{order.shippingAddress?.phone || '—'}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{order.shippingAddress?.email || '—'}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Địa chỉ:</Text>
              <Text style={styles.value}>{order.shippingAddress?.address || '—'}</Text>
            </View>
          </View>
        </View>

        {/* Products Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danh sách sản phẩm</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, { flex: 0.5 }]}>STT</Text>
              <Text style={styles.tableCell}>Tên sản phẩm</Text>
              <Text style={styles.tableCellCenter}>SL</Text>
              <Text style={styles.tableCellRight}>Đơn giá</Text>
              <Text style={styles.tableCellRight}>Thành tiền</Text>
            </View>
            {/* Table Rows */}
            {(order.items || []).map((item, index) => {
              const unitPrice = item.priceSnapshot || 0;
              const quantity = item.quantity || 0;
              const total = unitPrice * quantity;
              return (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 0.5 }]}>{index + 1}</Text>
                  <Text style={styles.tableCell}>{item.nameSnapshot || '—'}</Text>
                  <Text style={styles.tableCellCenter}>{quantity}</Text>
                  <Text style={styles.tableCellRight}>{formatMoney(unitPrice)}</Text>
                  <Text style={styles.tableCellRight}>{formatMoney(total)}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng tiền hàng:</Text>
            <Text style={styles.totalValue}>
              {formatMoney(order.totals?.items || 0)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Phí vận chuyển:</Text>
            <Text style={styles.totalValue}>
              {formatMoney(order.totals?.shipping || 0)}
            </Text>
          </View>
          {order.totals?.discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Giảm giá:</Text>
              <Text style={[styles.totalValue, { color: '#ef4444' }]}>
                -{formatMoney(order.totals?.discount || 0)}
              </Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, styles.grandTotal]}>Tổng thanh toán:</Text>
            <Text style={[styles.totalValue, styles.grandTotal]}>
              {formatMoney(order.totals?.grand || 0)}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Cảm ơn quý khách đã sử dụng dịch vụ của Smart Pharmacy!</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;

