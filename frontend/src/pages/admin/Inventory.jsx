import { useEffect, useState } from "react";
import api from "../../api/client.js";

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");
  const [type, setType] = useState("import");
  const [quantity, setQuantity] = useState(0);
  const [unitCost, setUnitCost] = useState(0);
  const [note, setNote] = useState("");
  const [txs, setTxs] = useState([]);

  function loadProducts() {
    api.get("/products").then((res) => setProducts(res.data.items));
  }
  function loadTxs() {
    if (!productId) return setTxs([]);
    api.get(`/inventory/product/${productId}`).then((res) => setTxs(res.data));
  }
  useEffect(loadProducts, []);
  useEffect(loadTxs, [productId]);

  async function submit(e) {
    e.preventDefault();
    await api.post("/inventory/tx", { productId, type, quantity: Number(quantity), unitCost: Number(unitCost), note });
    loadProducts();
    loadTxs();
  }

  return (
    <div>
      <h2>Nhập/Xuất/Điều chỉnh kho</h2>
      <form onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 2fr auto", gap: 8, marginBottom: 12 }}>
        <select value={productId} onChange={(e) => setProductId(e.target.value)} required>
          <option value="">--Chọn sản phẩm--</option>
          {products.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="import">Nhập</option>
          <option value="export">Xuất</option>
          <option value="adjust">Điều chỉnh</option>
        </select>
        <input type="number" placeholder="Số lượng" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
        <input type="number" placeholder="Đơn giá" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} />
        <input placeholder="Ghi chú" value={note} onChange={(e) => setNote(e.target.value)} />
        <button type="submit">Ghi nhận</button>
      </form>

      <h3>Lịch sử giao dịch</h3>
      <table width="100%" border="1" cellPadding="6">
        <thead><tr><th>Thời gian</th><th>Loại</th><th>SL</th><th>Đơn giá</th><th>Ghi chú</th></tr></thead>
        <tbody>
          {txs.map(tx => (
            <tr key={tx._id}>
              <td>{new Date(tx.createdAt).toLocaleString()}</td>
              <td>{tx.type}</td>
              <td>{tx.quantity}</td>
              <td>{tx.unitCost || "-"}</td>
              <td>{tx.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


