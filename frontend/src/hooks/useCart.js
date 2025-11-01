import { useEffect, useState } from "react";

// Global cart state - singleton pattern
let globalCartState = {
  items: (() => {
    try { 
      return JSON.parse(localStorage.getItem("cart") || "[]");
    } catch { 
      return []; 
    }
  })(),
  listeners: new Set()
};

// Global functions
const addToGlobalCart = (product, qty = 1) => {
  console.log('addToGlobalCart called:', { productId: product._id, productName: product.name, qty });
  
  const productId = String(product._id);
  const found = globalCartState.items.find((i) => String(i.id) === productId);
  
  if (found) {
      globalCartState.items = globalCartState.items.map((i) => 
      String(i.id) === productId ? { 
        ...i, 
        qty: i.qty + qty,
        // Cập nhật thông tin giá giảm nếu có
        finalPrice: product.finalPrice !== undefined ? product.finalPrice : i.finalPrice || i.price,
        originalPrice: product.originalPrice !== undefined ? product.originalPrice : i.originalPrice || i.price,
        discount: product.discount || i.discount || 0,
        discountType: product.discountType || i.discountType,
        discountValue: product.discountValue || i.discountValue,
        slug: product.slug || i.slug // Cập nhật slug nếu có
      } : i
    );
  } else {
    const newItem = { 
      id: productId,
      name: product.name, 
      price: product.price,
      // Lưu thông tin giá đã giảm nếu có
      finalPrice: product.finalPrice !== undefined ? product.finalPrice : product.price,
      originalPrice: product.originalPrice !== undefined ? product.originalPrice : product.price,
      discount: product.discount || 0,
      discountType: product.discountType,
      discountValue: product.discountValue,
      image: product.imageUrls?.[0] || product.image || '/default-product.svg',
      slug: product.slug, // Lưu slug để fetch direct coupon
      qty 
    };
    globalCartState.items = [...globalCartState.items, newItem];
  }
  
  console.log('Global cart updated:', globalCartState.items);
  localStorage.setItem("cart", JSON.stringify(globalCartState.items));
  globalCartState.listeners.forEach(callback => callback(globalCartState.items));
};

const removeFromGlobalCart = (id) => {
  globalCartState.items = globalCartState.items.filter((i) => String(i.id) !== String(id));
  localStorage.setItem("cart", JSON.stringify(globalCartState.items));
  globalCartState.listeners.forEach(callback => callback(globalCartState.items));
};

export const clearGlobalCart = () => {
  globalCartState.items = [];
  localStorage.setItem("cart", JSON.stringify(globalCartState.items));
  globalCartState.listeners.forEach(callback => callback(globalCartState.items));
};

const updateGlobalCartQty = (id, newQty) => {
  globalCartState.items = globalCartState.items.map((i) => 
    String(i.id) === String(id) ? { ...i, qty: newQty } : i
  );
  localStorage.setItem("cart", JSON.stringify(globalCartState.items));
  globalCartState.listeners.forEach(callback => callback(globalCartState.items));
};

export default function useCart() {
  const [items, setItems] = useState(globalCartState.items);

  useEffect(() => {
    const callback = (newItems) => {
      console.log('useCart listener callback:', newItems);
      setItems(newItems);
    };
    
    globalCartState.listeners.add(callback);
    
    return () => {
      globalCartState.listeners.delete(callback);
    };
  }, []);

  function add(product, qty = 1) {
    addToGlobalCart(product, qty);
  }

  function remove(id) { 
    removeFromGlobalCart(id);
  }
  
  function clear() { 
    clearGlobalCart();
  }
  
  function updateQty(id, newQty) {
    updateGlobalCartQty(id, newQty);
  }

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  return { items, add, remove, clear, updateQty, total };
}


