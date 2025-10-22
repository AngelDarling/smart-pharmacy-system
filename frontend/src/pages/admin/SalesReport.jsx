import { useEffect, useMemo, useState } from 'react';
import api from '../../api/client';
import { Table, Input, Button, Space, Typography, Statistic, Row, Col, message, Select, Card } from 'antd';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function SalesReport() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [to, setTo] = useState(dayjs().endOf('month').format('YYYY-MM-DD'));
  // product filter removed per request
  const [groupBy, setGroupBy] = useState('day');
  const [summary, setSummary] = useState([]);
  const [quick, setQuick] = useState('');
  const [month, setMonth] = useState('');
  const [quarter, setQuarter] = useState('');

  const controlStyle = { height: 44, fontSize: 16 };
  const controlSize = 'large';

  const resetFilters = () => {
    const start = dayjs().startOf('month').format('YYYY-MM-DD');
    const end = dayjs().endOf('month').format('YYYY-MM-DD');
    setFrom(start);
    setTo(end);
    setGroupBy('day');
    setMonth('');
    setQuarter('');
    setQuick('');
    load({ from: start, to: end });
  };

  const load = async (override = {}) => {
    try {
      setLoading(true);
      const effFrom = override.from ?? from;
      const effTo = override.to ?? to;
      const params = new URLSearchParams();
      if (effFrom) params.set('from', new Date(effFrom + 'T00:00:00').toISOString());
      if (effTo) params.set('to', new Date(effTo + 'T23:59:59.999').toISOString());
      // No productId filter
      // detailed rows per day
      const res = await api.get(`/sales/daily?${params.toString()}`);
      setData(res.data.items || []);
      // summary grouped
      params.set('groupBy', groupBy);
      const sum = await api.get(`/sales/report?${params.toString()}`);
      setSummary(sum.data.items || []);
    } catch (e) {
      message.error('Không tải được dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Quick ranges
  const applyQuick = (type) => {
    setQuick(type);
    const today = dayjs();
    let newFrom = from, newTo = to;
    if (type === 'today') { newFrom = today.format('YYYY-MM-DD'); newTo = today.format('YYYY-MM-DD'); }
    else if (type === '7d') { newFrom = today.subtract(6, 'day').format('YYYY-MM-DD'); newTo = today.format('YYYY-MM-DD'); }
    else if (type === 'thisMonth') { newFrom = today.startOf('month').format('YYYY-MM-DD'); newTo = today.endOf('month').format('YYYY-MM-DD'); }
    else if (type === 'thisQuarter') { newFrom = today.startOf('quarter').format('YYYY-MM-DD'); newTo = today.endOf('quarter').format('YYYY-MM-DD'); }
    setFrom(newFrom); setTo(newTo);
    load({ from: newFrom, to: newTo });
  };

  const applyMonth = (m) => {
    setMonth(m);
    if (!m) return;
    const y = dayjs().year();
    const start = dayjs(`${y}-${String(m).padStart(2,'0')}-01`);
    const nf = start.startOf('month').format('YYYY-MM-DD');
    const nt = start.endOf('month').format('YYYY-MM-DD');
    setFrom(nf);
    setTo(nt);
    load({ from: nf, to: nt });
  };

  const applyQuarter = (q) => {
    setQuarter(q);
    if (!q) return;
    const y = dayjs().year();
    const startMonth = (q - 1) * 3 + 1;
    const start = dayjs(`${y}-${String(startMonth).padStart(2,'0')}-01`);
    const nf = start.startOf('quarter').format('YYYY-MM-DD');
    const nt = start.endOf('quarter').format('YYYY-MM-DD');
    setFrom(nf);
    setTo(nt);
    load({ from: nf, to: nt });
  };

  const totals = useMemo(() => {
    return (data || []).reduce((acc, d) => {
      acc.qty += d.quantity || 0;
      acc.revenue += d.revenue || 0;
      return acc;
    }, { qty: 0, revenue: 0 });
  }, [data]);

  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      render: (v) => dayjs(v).format('DD/MM/YYYY')
    },
    {
      title: 'SL bán',
      dataIndex: 'quantity',
      align: 'right'
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      align: 'right',
      render: (v) => (v || 0).toLocaleString('vi-VN') + '₫'
    }
  ];

  const summaryCols = [
    { title: 'Nhóm', dataIndex: 'label' },
    { title: 'SL', dataIndex: 'quantity', align: 'right' },
    { title: 'Doanh thu', dataIndex: 'revenue', align: 'right', render: v => (v||0).toLocaleString('vi-VN') + '₫' },
  ];

  return (
    <div>
      <Title level={3}>Báo cáo bán hàng</Title>
      <Space style={{ marginBottom: 16 }} size={12} wrap>
        <Input type="date" value={from} onChange={(e)=>setFrom(e.target.value)} size={controlSize} style={{ ...controlStyle, width: 170 }} />
        <Input type="date" value={to} onChange={(e)=>setTo(e.target.value)} size={controlSize} style={{ ...controlStyle, width: 170 }} />
        <Select value={groupBy} onChange={setGroupBy} size={controlSize} style={{ ...controlStyle, width: 180 }} options={[{value:'day',label:'Theo ngày'},{value:'week',label:'Theo tuần'},{value:'month',label:'Theo tháng'}]} />
        <Button type="primary" size={controlSize} onClick={()=>load()} loading={loading}>Lọc</Button>
        <Button size={controlSize} onClick={() => applyQuick('today')}>Hôm nay</Button>
        <Button size={controlSize} onClick={() => applyQuick('7d')}>7 ngày</Button>
        <Button size={controlSize} onClick={() => applyQuick('thisMonth')}>Tháng này</Button>
        <Button size={controlSize} onClick={() => applyQuick('thisQuarter')}>Quý này</Button>
        <Button size={controlSize} onClick={async()=>{
          try{
            const params=new URLSearchParams();
            if(from)params.set('from',new Date(from+'T00:00:00').toISOString());
            if(to)params.set('to',new Date(to+'T23:59:59.999').toISOString());
            params.set('groupBy',groupBy);
            const url=`/sales/export.xlsx?${params.toString()}`;
            window.open(api.defaults.baseURL + url,'_blank');
          }catch(e){ message.error('Xuất Excel thất bại'); }
        }}>Xuất Excel</Button>
        <Button size={controlSize} onClick={resetFilters}>Reset</Button>
      </Space>

      <div style={{ marginTop: 4 }} />
      <Title level={5} style={{ margin: '8px 0' }}>Lọc theo tháng / quý</Title>
      <Space size={12} wrap style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 14, fontWeight: 600, marginRight: 4 }}>Tháng</Text>
        <Select placeholder="Tháng" value={month} onChange={applyMonth} size={controlSize} style={{ ...controlStyle, width: 160 }} allowClear options={Array.from({length:12},(_,i)=>({value:i+1,label:`Tháng ${i+1}`}))} />
        <Text style={{ fontSize: 14, fontWeight: 600, margin: '0 4px 0 12px' }}>Quý</Text>
        <Select placeholder="Quý" value={quarter} onChange={applyQuarter} size={controlSize} style={{ ...controlStyle, width: 140 }} allowClear options={[{value:1,label:'Quý 1'},{value:2,label:'Quý 2'},{value:3,label:'Quý 3'},{value:4,label:'Quý 4'}]} />
      </Space>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col><Statistic title="Tổng số lượng" value={totals.qty} valueStyle={{ fontSize: 32 }} /></Col>
        <Col><Statistic title="Tổng doanh thu" value={(totals.revenue || 0).toLocaleString('vi-VN') + '₫'} valueStyle={{ fontSize: 32 }} /></Col>
      </Row>

      <Table
        rowKey={(r) => r._id}
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Card title="Tổng hợp" style={{ marginTop: 16 }}>
        <Table rowKey={(r, i)=>i} columns={summaryCols} dataSource={summary} pagination={{ pageSize: 10 }} size="small" />
      </Card>

      <Card title="Top sản phẩm bán chạy" style={{ marginTop: 16 }}>
        <TopProducts from={from} to={to} />
      </Card>
    </div>
  );
}

function TopProducts({ from, to }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (from) params.set('from', new Date(from + 'T00:00:00').toISOString());
        if (to) params.set('to', new Date(to + 'T23:59:59.999').toISOString());
        params.set('limit', '10');
        const res = await api.get(`/sales/top-products?${params.toString()}`);
        setRows(res.data.items || []);
      } catch {}
      finally { setLoading(false); }
    };
    run();
  }, [from, to]);

  const cols = [
    { title: 'Sản phẩm', dataIndex: 'name', render: (v, r) => <a href={`/p/${r.slug}`} target="_blank" rel="noreferrer">{v}</a> },
    { title: 'SL', dataIndex: 'quantity', align: 'right' },
    { title: 'Doanh thu', dataIndex: 'revenue', align: 'right', render: v => (v||0).toLocaleString('vi-VN') + '₫' }
  ];

  return <Table size="small" rowKey={(r)=>r._id} columns={cols} dataSource={rows} loading={loading} pagination={false} />;
}


