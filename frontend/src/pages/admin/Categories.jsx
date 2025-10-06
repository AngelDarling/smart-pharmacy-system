import { useEffect, useState } from "react";
import api, { uploadFile } from "../../api/client.js";

export default function AdminCategories() {
  const [items, setItems] = useState([]);
  const [allCats, setAllCats] = useState([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [editId, setEditId] = useState("");
  const [open, setOpen] = useState(false);
  async function onIconChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file);
    setIconUrl(url);
  }

  function slugify(str) {
    return str
      .toLowerCase()
      .normalize("NFD").replace(/\p{Diacritic}/gu, "") // bỏ dấu tiếng Việt
      .replace(/[^a-z0-9]+/g, "-") // ký tự không hợp lệ -> '-'
      .replace(/(^-|-$)+/g, ""); // bỏ '-' đầu/cuối
  }

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  function load() {
    api.get(`/categories?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`).then((res) => {
      setItems(res.data.items || []);
      setTotal(res.data.total || 0);
    });
    // load all for parent select
    api.get(`/categories?q=&page=1&limit=100`).then((res) => setAllCats(res.data.items || []));
  }
  useEffect(load, [q, page]);

  const [saving, setSaving] = useState(false);
  async function create(e) {
    e.preventDefault();
    try {
      setSaving(true);
      if (editId) {
        await api.put(`/categories/${editId}`, { name, slug, iconUrl, parentId: parentId || null, isActive });
      } else {
        await api.post("/categories", { name, slug, parentId: parentId || null, iconUrl, isActive });
      }
      setName(""); setSlug(""); setIconUrl(""); setParentId(""); setIsActive(true);
      setEditId("");
      setOpen(false);
      load();
    } catch (err) {
      alert(err?.response?.data?.message || "Không thể lưu danh mục");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    await api.delete(`/categories/${id}`);
    load();
  }

  return (
    <div>
      <h2>Danh mục</h2>
      <div style={{ marginBottom: 12, display: "flex", gap: 12, alignItems: "center" }}>
        <input placeholder="Tìm theo tên..." value={q} onChange={(e) => { setPage(1); setQ(e.target.value); }} style={{ flex: 1 }} />
        <button className="btn-primary" onClick={() => { setOpen(true); setEditId(""); setName(""); setSlug(""); setIconUrl(""); setParentId(""); setIsActive(true); }}>Thêm danh mục</button>
      </div>

      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div className="card" style={{ width: 700, padding: 16, background: "#fff" }}>
            <h3>{editId ? "Sửa danh mục" : "Thêm danh mục"}</h3>
            <form onSubmit={create} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input placeholder="Tên" value={name} onChange={(e) => { const v = e.target.value; setName(v); setSlug(slugify(v)); }} required />
              <input placeholder="Slug" value={slug} onChange={(e) => setSlug(slugify(e.target.value))} required />
              <select value={parentId} onChange={(e) => setParentId(e.target.value)}>
                <option value="">--Thuộc danh mục lớn--</option>
                {allCats.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /> Hiển thị
              </label>
              <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 12 }}>
                <input type="file" accept="image/*" onChange={onIconChange} />
                {iconUrl && <img src={iconUrl} alt="preview" style={{ width: 56, height: 56, objectFit: "contain" }} />}
              </div>
              <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => { setOpen(false); setEditId(""); }} disabled={saving}>Đóng</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Đang lưu..." : (editId ? "Lưu" : "Thêm")}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <table width="100%" border="1" cellPadding="6">
        <thead><tr><th>Icon</th><th>Tên</th><th>Slug</th><th>Thuộc danh mục</th><th>Hiển thị</th><th style={{ textAlign: "center" }}>Thao tác</th></tr></thead>
        <tbody>
          {items.map(c => (
            <tr key={c._id}>
              <td style={{ textAlign: "center" }}>{c.iconUrl ? <img src={c.iconUrl} alt="" style={{ width: 36, height: 36, objectFit: "contain" }} /> : null}</td>
              <td>{c.name}</td>
              <td>{c.slug}</td>
              <td>{allCats.find(x => x._id === (c.parentId || "").toString())?.name || (c.parentId ? c.parentId : "-")}</td>
              <td>{c.isActive ? "Có" : "Không"}</td>
              <td style={{ textAlign: "center" }}>
                <button onClick={() => { setEditId(c._id); setName(c.name); setSlug(c.slug); setIconUrl(c.iconUrl || ""); setParentId(c.parentId || ""); setIsActive(!!c.isActive); setOpen(true); }}>Sửa</button>
                <button onClick={() => remove(c._id)} style={{ marginLeft: 6 }}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
        <div>Tổng: {total}</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>« Trước</button>
          <span style={{ display: "inline-block", minWidth: 70, textAlign: "center" }}>Trang {page}</span>
          <button disabled={page * limit >= total} onClick={() => setPage(p => p + 1)}>Sau »</button>
        </div>
      </div>
    </div>
  );
}


