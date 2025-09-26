import { useEffect, useState } from "react";
import api from "../../api/client.js";

export default function AdminGoodsReceipts() {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [list, setList] = useState([]);
  const [code, setCode] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [rows, setRows] = useState([{ productId: "", quantity: 0, unitCost: 0 }]);
  const [note, setNote] = useState("");

  function load() {
    api.get("/suppliers").then((r) => setSuppliers(r.data));
    api.get("/products").then((r) => setProducts(r.data.items));
    api.get("/goods-receipts").then((r) => setList(r.data));
  }
  useEffect(load, []);

  function setRow(idx, field, val) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: val } : r)));
  }
  function addRow() { setRows((prev) => [...prev, { productId: "", quantity: 0, unitCost: 0 }]); }
  function removeRow(i) { setRows((prev) => prev.filter((_, idx) => idx !== i)); }

  async function submit(e) {
    e.preventDefault();
    const payload = { code, supplierId, note, items: rows.map(r => ({ ...r, quantity: Number(r.quantity), unitCost: Number(r.unitCost) })) };
    await api.post("/goods-receipts", payload);
    setCode(""); setSupplierId(""); setRows([{ productId: "", quantity: 0, unitCost: 0 }]); setNote("");
    load();
  }

  return (
    <div>
      <h2>Phiếu nhập hàng</h2>
      <form onSubmit={submit} className="card" style={{ padding: 12, marginBottom: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 8, marginBottom: 8 }}>
          <input placeholder="Mã phiếu" value={code} onChange={(e) => setCode(e.target.value)} required />
          <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} required>
            <option value="">--Chọn nhà cung cấp--</option>
            {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <input placeholder="Ghi chú" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>

        <table width="100%" border="1" cellPadding="6" style={{ marginBottom: 8 }}>
          <thead><tr><th>Sản phẩm</th><th>SL</th><th>Đơn giá</th><th></th></tr></thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={idx}>
                <td>
                  <select value={r.productId} onChange={(e) => setRow(idx, "productId", e.target.value)} required>
                    <option value="">--Chọn sản phẩm--</option>
                    {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </td>
                <td><input type="number" value={r.quantity} onChange={(e) => setRow(idx, "quantity", e.target.value)} required /></td>
                <td><input type="number" value={r.unitCost} onChange={(e) => setRow(idx, "unitCost", e.target.value)} /></td>
                <td><button type="button" onClick={() => removeRow(idx)}>Xóa</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" className="btn-primary" onClick={addRow} style={{ marginRight: 8 }}>Thêm dòng</button>
        <button type="submit" className="btn-primary">Lưu phiếu nhập</button>
      </form>

      <h3>Danh sách phiếu nhập</h3>
      <table width="100%" border="1" cellPadding="6">
        <thead><tr><th>Mã</th><th>Nhà cung cấp</th><th>SL dòng</th><th>Thời gian</th></tr></thead>
        <tbody>
          {list.map(gr => (
            <tr key={gr._id}>
              <td>{gr.code}</td>
              <td>{(suppliers.find(s => s._id === gr.supplierId)?.name) || gr.supplierId}</td>
              <td>{gr.items?.length || 0}</td>
              <td>{new Date(gr.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


