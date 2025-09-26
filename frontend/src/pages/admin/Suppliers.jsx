import { useEffect, useState } from "react";
import api from "../../api/client.js";

export default function AdminSuppliers() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });

  function load() {
    api.get("/suppliers").then((res) => setItems(res.data));
  }
  useEffect(load, []);

  async function create(e) {
    e.preventDefault();
    await api.post("/suppliers", form);
    setForm({ name: "", email: "", phone: "", address: "" });
    load();
  }
  async function remove(id) {
    await api.delete(`/suppliers/${id}`);
    load();
  }

  return (
    <div>
      <h2>Nhà cung cấp</h2>
      <form onSubmit={create} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 2fr auto", gap: 8, marginBottom: 12 }}>
        <input placeholder="Tên" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input placeholder="SĐT" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input placeholder="Địa chỉ" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <button type="submit" className="btn-primary">Thêm</button>
      </form>

      <table width="100%" border="1" cellPadding="6">
        <thead><tr><th>Tên</th><th>Email</th><th>SĐT</th><th>Địa chỉ</th><th></th></tr></thead>
        <tbody>
          {items.map(s => (
            <tr key={s._id}>
              <td>{s.name}</td>
              <td>{s.email || '-'}</td>
              <td>{s.phone || '-'}</td>
              <td>{s.address || '-'}</td>
              <td><button onClick={() => remove(s._id)}>Xóa</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


