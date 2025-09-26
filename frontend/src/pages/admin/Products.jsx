import { useEffect, useState } from "react";
import api, { uploadFile } from "../../api/client.js";

export default function AdminProducts() {
  const [items, setItems] = useState([]);
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState({ name: "", slug: "", categoryId: "", price: 0, attributes: {} });
  const [editId, setEditId] = useState("");
  const [open, setOpen] = useState(false);

  function slugify(str) {
    return str
      .toLowerCase()
      .normalize("NFD").replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }

  function load() {
    api.get("/products").then((res) => setItems(res.data.items));
    api.get("/categories").then((res) => setCats(res.data));
  }
  useEffect(load, []);

  async function create(e) {
    e.preventDefault();
    if (editId) {
      await api.put(`/products/${editId}`, form);
    } else {
      await api.post("/products", form);
    }
    setForm({ name: "", slug: "", categoryId: "", price: 0, attributes: {} });
    setEditId("");
    load();
  }
  async function remove(id) {
    await api.delete(`/products/${id}`);
    load();
  }

  return (
    <div>
      <h2>Sản phẩm</h2>
      <div style={{ marginBottom: 12 }}>
        <button className="btn-primary" onClick={() => { setOpen(true); setEditId(""); setForm({ name: "", slug: "", categoryId: "", price: 0, attributes: {} }); }}>Thêm sản phẩm</button>
      </div>

      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div className="card" style={{ width: 800, padding: 16, background: "#fff", maxHeight: "90vh", overflow: "auto" }}>
            <h3>{editId ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h3>
            <form onSubmit={create}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <input placeholder="Tên" value={form.name} onChange={(e) => { const v = e.target.value; setForm({ ...form, name: v, slug: slugify(v) }); }} required />
                <input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} required />
                <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
                  <option value="">--Danh mục--</option>
                  {cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                <input type="number" placeholder="Giá" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required />
                <input placeholder="Ảnh (URL)" value={form.imageUrls?.[0] || ""} onChange={(e) => setForm({ ...form, imageUrls: [e.target.value] })} />
                <div>
                  <label>Tải ảnh lên</label>
                  <input type="file" accept="image/*" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await uploadFile(file);
                    setForm({ ...form, imageUrls: [url] });
                  }} />
                </div>
              </div>

              {/* Thuộc tính động theo danh mục */}
              <div className="card" style={{ padding: 12, marginTop: 12 }}>
                <h3>Thuộc tính</h3>
                {(() => {
                  const cat = cats.find(c => c._id === form.categoryId);
                  const name = cat?.name?.toLowerCase() || "";
                  if (name.includes("thuoc") || name.includes("thuốc")) {
                    return (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                        <input placeholder="Hoạt chất" value={form.attributes.active_ingredient || ""} onChange={(e) => setForm({ ...form, attributes: { ...form.attributes, active_ingredient: e.target.value } })} />
                        <input placeholder="Dạng bào chế" value={form.attributes.dosage_form || ""} onChange={(e) => setForm({ ...form, attributes: { ...form.attributes, dosage_form: e.target.value } })} />
                        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <input type="checkbox" checked={!!form.attributes.requires_prescription} onChange={(e) => setForm({ ...form, attributes: { ...form.attributes, requires_prescription: e.target.checked } })} /> Cần đơn
                        </label>
                        <textarea placeholder="Công dụng" value={form.attributes.usage || ""} onChange={(e) => setForm({ ...form, attributes: { ...form.attributes, usage: e.target.value } })} style={{ gridColumn: "1 / -1" }} />
                      </div>
                    );
                  }
                  if (name.includes("my pham") || name.includes("mỹ phẩm")) {
                    return (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <input placeholder="Loại da phù hợp" value={form.attributes.skin_type || ""} onChange={(e) => setForm({ ...form, attributes: { ...form.attributes, skin_type: e.target.value } })} />
                        <input placeholder="Dung tích/Khối lượng" value={form.attributes.volume || ""} onChange={(e) => setForm({ ...form, attributes: { ...form.attributes, volume: e.target.value } })} />
                        <textarea placeholder="Mô tả" value={form.attributes.description || ""} onChange={(e) => setForm({ ...form, attributes: { ...form.attributes, description: e.target.value } })} style={{ gridColumn: "1 / -1" }} />
                      </div>
                    );
                  }
                  if (name.includes("sua") || name.includes("sữa")) {
                    return (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <input placeholder="Độ tuổi" value={form.attributes.age_range || ""} onChange={(e) => setForm({ ...form, attributes: { ...form.attributes, age_range: e.target.value } })} />
                        <input placeholder="Khối lượng" value={form.attributes.weight || ""} onChange={(e) => setForm({ ...form, attributes: { ...form.attributes, weight: e.target.value } })} />
                      </div>
                    );
                  }
                  return <div style={{ color: '#6b7280' }}>Danh mục này chưa có trường riêng. Bạn có thể thêm sau.</div>;
                })()}
              </div>

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
                <button type="button" onClick={() => { setOpen(false); setEditId(""); }}>Đóng</button>
                <button type="submit" className="btn-primary">{editId ? "Lưu" : "Thêm"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Thuộc tính động theo category (demo đơn giản) */}
      {form.categoryId && (
        <div className="card" style={{ padding: 12, marginBottom: 12 }}>
          <h3>Thuộc tính theo danh mục</h3>
          {(() => {
            const cat = cats.find(c => c._id === form.categoryId);
            const name = cat?.name?.toLowerCase() || "";
            if (name.includes("thuoc")) {
              return (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  <input placeholder="Hoạt chất" value={form.attributes.active_ingredient || ""} onChange={(e) => setForm({ ...form, attributes: { ...form.attributes, active_ingredient: e.target.value } })} />
                  <input placeholder="Dạng bào chế" value={form.attributes.dosage_form || ""} onChange={(e) => setForm({ ...form, attributes: { ...form.attributes, dosage_form: e.target.value } })} />
                  <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <input type="checkbox" checked={!!form.attributes.requires_prescription} onChange={(e) => setForm({ ...form, attributes: { ...form.attributes, requires_prescription: e.target.checked } })} /> Cần đơn
                  </label>
                </div>
              );
            }
            if (name.includes("my pham") || name.includes("mỹ phẩm")) {
              return (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <input placeholder="Loại da phù hợp" value={form.attributes.skin_type || ""} onChange={(e) => setForm({ ...form, attributes: { ...form.attributes, skin_type: e.target.value } })} />
                  <input placeholder="Dung tích/Khối lượng" value={form.attributes.volume || ""} onChange={(e) => setForm({ ...form, attributes: { ...form.attributes, volume: e.target.value } })} />
                </div>
              );
            }
            if (name.includes("sua") || name.includes("sữa")) {
              return (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <input placeholder="Độ tuổi" value={form.attributes.age_range || ""} onChange={(e) => setForm({ ...form, attributes: { ...form.attributes, age_range: e.target.value } })} />
                  <input placeholder="Khối lượng" value={form.attributes.weight || ""} onChange={(e) => setForm({ ...form, attributes: { ...form.attributes, weight: e.target.value } })} />
                </div>
              );
            }
            return <div style={{ color: '#6b7280' }}>Danh mục này chưa có trường riêng. Bạn có thể thêm sau.</div>;
          })()}
        </div>
      )}
      <table width="100%" border="1" cellPadding="6">
        <thead><tr><th>Ảnh</th><th>Tên</th><th>Danh mục</th><th>Giá</th><th>Tồn</th><th></th></tr></thead>
        <tbody>
          {items.map(p => (
            <tr key={p._id}>
              <td style={{ textAlign: "center" }}>{p.imageUrls?.[0] ? <img src={p.imageUrls[0]} alt="" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8 }} /> : null}</td>
              <td>{p.name}</td>
              <td>{cats.find(c => c._id === p.categoryId)?.name || p.categoryId}</td>
              <td>{p.price?.toLocaleString()}</td>
              <td>{p.stockOnHand}</td>
              <td>
                <button onClick={() => { setEditId(p._id); setForm({ name: p.name, slug: p.slug, categoryId: p.categoryId?.toString?.() || p.categoryId, price: p.price, imageUrls: p.imageUrls || [], attributes: p.attributes || {} }); }}>Sửa</button>
                <button onClick={() => remove(p._id)} style={{ marginLeft: 6 }}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


