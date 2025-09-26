import { useEffect, useState } from "react";
import api from "../api/client.js";

export default function CategorySidebar({ selected, onSelect }) {
  const [cats, setCats] = useState([]);
  useEffect(() => {
    api.get("/categories").then((res) => setCats(res.data));
  }, []);
  return (
    <aside style={{ width: 240, padding: 12 }}>
      <h3>Danh mục</h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        <li>
          <button onClick={() => onSelect(null)} style={{ background: "none", border: "none", color: !selected ? "#1976d2" : "#333", cursor: "pointer" }}>Tất cả</button>
        </li>
        {cats.map((c) => (
          <li key={c._id}>
            <button onClick={() => onSelect(c._id)} style={{ background: "none", border: "none", color: selected === c._id ? "#1976d2" : "#333", cursor: "pointer" }}>{c.name}</button>
          </li>
        ))}
      </ul>
    </aside>
  );
}


