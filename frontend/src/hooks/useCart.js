import { useEffect, useState } from "react";

export default function useCart() {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cart") || "[]"); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  function add(product, qty = 1) {
    setItems((prev) => {
      const found = prev.find((i) => i.id === product._id);
      if (found) return prev.map((i) => i.id === product._id ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { id: product._id, name: product.name, price: product.price, image: product.imageUrls?.[0], qty }];
    });
  }

  function remove(id) { setItems((prev) => prev.filter((i) => i.id !== id)); }
  function clear() { setItems([]); }
  function updateQty(id, newQty) {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, qty: newQty } : i));
  }

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  return { items, add, remove, clear, updateQty, total };
}


