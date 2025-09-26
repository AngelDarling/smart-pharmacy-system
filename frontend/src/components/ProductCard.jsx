export default function ProductCard({ product }) {
  return (
    <div style={{ border: "1px solid #eee", padding: 12, borderRadius: 8 }}>
      <img src={product.imageUrls?.[0] || "/vite.svg"} alt={product.name} style={{ width: "100%", height: 140, objectFit: "cover" }} />
      <h4 style={{ margin: "8px 0" }}>{product.name}</h4>
      <p style={{ color: "#2e7d32", fontWeight: 600 }}>{product.price?.toLocaleString()} đ</p>
      <a href={`/p/${product.slug}`}>Xem chi tiết</a>
    </div>
  );
}


